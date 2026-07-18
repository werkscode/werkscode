from __future__ import annotations

from typing import Any

from OCC.Core.Bnd import Bnd_Box
from OCC.Core.BRepBndLib import brepbndlib
from OCC.Core.BRepGProp import brepgprop
from OCC.Core.GProp import GProp_GProps
from OCC.Core.TDF import TDF_Label, TDF_LabelSequence
from OCC.Core.TopoDS import TopoDS_Shape, TopoDS_Solid

from app.exterior_faces import (
    collect_solids,
    compute_exterior_surface_area_mm2,
    compute_shape_faces_surface_area_mm2,
)


def _shape_total_surface_area_mm2(shape: TopoDS_Shape) -> float:
    props = GProp_GProps()
    brepgprop.SurfaceProperties(shape, props)
    return props.Mass()


def _shape_bbox_extents(shape: TopoDS_Shape) -> tuple[float, float, float, float, float, float]:
    bbox = Bnd_Box()
    brepbndlib.Add(shape, bbox)
    return bbox.Get()


def _extents_to_dimensions(
    xmin: float,
    ymin: float,
    zmin: float,
    xmax: float,
    ymax: float,
    zmax: float,
) -> dict[str, float]:
    return {
        "x": xmax - xmin,
        "y": ymax - ymin,
        "z": zmax - zmin,
    }


def _merge_extents(
    current: tuple[float, float, float, float, float, float] | None,
    xmin: float,
    ymin: float,
    zmin: float,
    xmax: float,
    ymax: float,
    zmax: float,
) -> tuple[float, float, float, float, float, float]:
    if current is None:
        return xmin, ymin, zmin, xmax, ymax, zmax
    cxmin, cymin, czmin, cxmax, cymax, czmax = current
    return (
        min(cxmin, xmin),
        min(cymin, ymin),
        min(czmin, zmin),
        max(cxmax, xmax),
        max(cymax, ymax),
        max(czmax, zmax),
    )


def _solid_key(solid: TopoDS_Solid) -> int:
    return hash(solid)


def _process_shape_metrics(
    shape: TopoDS_Shape,
    processed_solids: set[int],
) -> tuple[float, float]:
    solids = collect_solids(shape)
    if solids:
        total_area_mm2 = 0.0
        exterior_area_mm2 = 0.0
        for solid in solids:
            solid_key = _solid_key(solid)
            if solid_key in processed_solids:
                continue
            processed_solids.add(solid_key)
            total_area_mm2 += _shape_total_surface_area_mm2(solid)
            exterior_area_mm2 += compute_exterior_surface_area_mm2(solid)
        return total_area_mm2, exterior_area_mm2

    face_area = compute_shape_faces_surface_area_mm2(shape)
    return face_area, face_area


def _accumulate_label_metrics(
    shape_tool,
    label: TDF_Label,
    total_area_mm2: float,
    exterior_area_mm2: float,
    combined_extents: tuple[float, float, float, float, float, float] | None,
    processed_solids: set[int],
) -> tuple[float, float, tuple[float, float, float, float, float, float] | None]:
    if shape_tool.IsAssembly(label):
        components = TDF_LabelSequence()
        shape_tool.GetComponents(label, components)
        for index in range(components.Length()):
            component = components.Value(index + 1)
            if shape_tool.IsReference(component):
                referred = TDF_Label()
                shape_tool.GetReferredShape(component, referred)
                total_area_mm2, exterior_area_mm2, combined_extents = _accumulate_label_metrics(
                    shape_tool,
                    referred,
                    total_area_mm2,
                    exterior_area_mm2,
                    combined_extents,
                    processed_solids,
                )
            else:
                total_area_mm2, exterior_area_mm2, combined_extents = _accumulate_label_metrics(
                    shape_tool,
                    component,
                    total_area_mm2,
                    exterior_area_mm2,
                    combined_extents,
                    processed_solids,
                )
        return total_area_mm2, exterior_area_mm2, combined_extents

    if shape_tool.IsSimpleShape(label):
        shape = shape_tool.GetShape(label)
        shape_total, shape_exterior = _process_shape_metrics(shape, processed_solids)
        total_area_mm2 += shape_total
        exterior_area_mm2 += shape_exterior
        combined_extents = _merge_extents(combined_extents, *_shape_bbox_extents(shape))

    return total_area_mm2, exterior_area_mm2, combined_extents


def compute_document_metrics(shape_tool) -> dict[str, Any]:
    roots = TDF_LabelSequence()
    shape_tool.GetFreeShapes(roots)

    total_area_mm2 = 0.0
    exterior_area_mm2 = 0.0
    combined_extents: tuple[float, float, float, float, float, float] | None = None
    processed_solids: set[int] = set()

    for index in range(roots.Length()):
        total_area_mm2, exterior_area_mm2, combined_extents = _accumulate_label_metrics(
            shape_tool,
            roots.Value(index + 1),
            total_area_mm2,
            exterior_area_mm2,
            combined_extents,
            processed_solids,
        )

    if combined_extents is None:
        bounding_box_mm = {"x": 0.0, "y": 0.0, "z": 0.0}
    else:
        bounding_box_mm = _extents_to_dimensions(*combined_extents)

    return {
        "surfaceAreaM2": exterior_area_mm2 / 1_000_000.0,
        "totalSurfaceAreaM2": total_area_mm2 / 1_000_000.0,
        "boundingBoxMm": bounding_box_mm,
    }
