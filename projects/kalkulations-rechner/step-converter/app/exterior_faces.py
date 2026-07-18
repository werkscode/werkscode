from __future__ import annotations

import math

from OCC.Core.BRepAdaptor import BRepAdaptor_Surface
from OCC.Core.BRepBndLib import brepbndlib
from OCC.Core.BRepClass3d import BRepClass3d_SolidClassifier
from OCC.Core.BRepGProp import brepgprop
from OCC.Core.BRepTools import breptools
from OCC.Core.Bnd import Bnd_Box
from OCC.Core.GProp import GProp_GProps
from OCC.Core.TopAbs import TopAbs_FACE, TopAbs_OUT, TopAbs_REVERSED, TopAbs_SOLID
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopoDS import TopoDS_Shape, TopoDS_Solid, topods
from OCC.Core.gp import gp_Pnt, gp_Vec


def _bbox_diagonal(shape: TopoDS_Shape) -> float:
    bbox = Bnd_Box()
    brepbndlib.Add(shape, bbox)
    xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
    return math.sqrt((xmax - xmin) ** 2 + (ymax - ymin) ** 2 + (zmax - zmin) ** 2)


def face_area_mm2(face) -> float:
    props = GProp_GProps()
    brepgprop.SurfaceProperties(face, props)
    return props.Mass()


def _face_uv_center(face) -> tuple[float, float]:
    umin, umax, vmin, vmax = breptools.UVBounds(face)
    if not math.isfinite(umin) or not math.isfinite(umax):
        return 0.0, 0.0
    if abs(umax - umin) < 1e-12:
        u = umin
    else:
        u = (umin + umax) / 2.0
    if abs(vmax - vmin) < 1e-12:
        v = vmin
    else:
        v = (vmin + vmax) / 2.0
    return u, v


def _face_center_and_normal(face) -> tuple[gp_Pnt, gp_Vec] | None:
    u, v = _face_uv_center(face)
    surface = BRepAdaptor_Surface(face)
    point = gp_Pnt()
    du = gp_Vec()
    dv = gp_Vec()
    surface.D1(u, v, point, du, dv)

    normal = du.Crossed(dv)
    if normal.Magnitude() < 1e-12:
        return None
    if face.Orientation() == TopAbs_REVERSED:
        normal.Reverse()
    normal.Normalize()
    return point, normal


def _solid_center_of_mass(solid: TopoDS_Solid) -> gp_Pnt:
    props = GProp_GProps()
    brepgprop.VolumeProperties(solid, props)
    return props.CentreOfMass()


def _outward_probe_point(face, epsilon: float) -> gp_Pnt | None:
    center_and_normal = _face_center_and_normal(face)
    if center_and_normal is None:
        return None
    point, normal = center_and_normal

    return gp_Pnt(
        point.X() + normal.X() * epsilon,
        point.Y() + normal.Y() * epsilon,
        point.Z() + normal.Z() * epsilon,
    )


def _is_exterior_face(face, solid: TopoDS_Solid, com: gp_Pnt, epsilon: float, tolerance: float) -> bool:
    center_and_normal = _face_center_and_normal(face)
    if center_and_normal is None:
        return True

    point, normal = center_and_normal
    probe = _outward_probe_point(face, epsilon)
    if probe is None:
        return True

    classifier = BRepClass3d_SolidClassifier(solid)
    classifier.Perform(probe, tolerance)
    if classifier.State() != TopAbs_OUT:
        return False

    to_face = gp_Vec(com, point)
    return to_face.Dot(normal) > 0


def is_exterior_face_on_solid(face, solid: TopoDS_Solid) -> bool:
    diagonal = _bbox_diagonal(solid)
    epsilon = max(1e-3, 1e-5 * diagonal)
    tolerance = max(1e-7, 1e-6 * diagonal)
    com = _solid_center_of_mass(solid)
    return _is_exterior_face(face, solid, com, epsilon, tolerance)


def compute_exterior_surface_area_mm2(solid: TopoDS_Solid) -> float:
    area_mm2 = 0.0
    explorer = TopExp_Explorer(solid, TopAbs_FACE)
    while explorer.More():
        face = topods.Face(explorer.Current())
        if is_exterior_face_on_solid(face, solid):
            area_mm2 += face_area_mm2(face)
        explorer.Next()

    return area_mm2


def collect_solids(shape: TopoDS_Shape) -> list[TopoDS_Solid]:
    solids: list[TopoDS_Solid] = []
    explorer = TopExp_Explorer(shape, TopAbs_SOLID)
    while explorer.More():
        solids.append(topods.Solid(explorer.Current()))
        explorer.Next()
    return solids


def compute_shape_faces_surface_area_mm2(shape: TopoDS_Shape) -> float:
    area_mm2 = 0.0
    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    while explorer.More():
        face = topods.Face(explorer.Current())
        area_mm2 += face_area_mm2(face)
        explorer.Next()
    return area_mm2
