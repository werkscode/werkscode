from __future__ import annotations

import math
import sys
from pathlib import Path

from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Cut
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox, BRepPrimAPI_MakeCylinder
from OCC.Core.TopoDS import topods

from app.exterior_faces import (
    collect_solids,
    compute_exterior_surface_area_mm2,
    compute_shape_faces_surface_area_mm2,
)


def _assert_close(actual: float, expected: float, rel_tol: float = 0.02) -> None:
    if expected == 0:
        assert abs(actual) < 1e-6
        return
    assert abs(actual - expected) / expected <= rel_tol, f"{actual} != {expected}"


def test_solid_box_exterior_matches_total() -> None:
    box = BRepPrimAPI_MakeBox(100, 80, 60).Shape()
    solid = topods.Solid(box)
    total = compute_shape_faces_surface_area_mm2(solid)
    exterior = compute_exterior_surface_area_mm2(solid)
    _assert_close(exterior, total)
    _assert_close(total, 2 * (100 * 80 + 100 * 60 + 80 * 60))


def test_hollow_tube_exterior_less_than_total() -> None:
    outer = BRepPrimAPI_MakeCylinder(50, 200).Shape()
    inner = BRepPrimAPI_MakeCylinder(40, 200).Shape()
    tube = BRepAlgoAPI_Cut(outer, inner).Shape()
    solids = collect_solids(tube)
    assert len(solids) == 1
    solid = solids[0]

    total = compute_shape_faces_surface_area_mm2(solid)
    exterior = compute_exterior_surface_area_mm2(solid)

    outer_lateral = 2 * math.pi * 50 * 200
    inner_lateral = 2 * math.pi * 40 * 200
    end_annulus = 2 * math.pi * (50**2 - 40**2)

    _assert_close(total, outer_lateral + inner_lateral + end_annulus, rel_tol=0.03)
    _assert_close(exterior, outer_lateral + end_annulus, rel_tol=0.03)
    assert exterior < total


def test_box_step_file_if_available() -> None:
    step_path = Path("/test-assets/box.step")
    if not step_path.is_file():
        step_path = Path(__file__).resolve().parents[3] / "step-viewer/test-assets/box.step"
    if not step_path.is_file():
        return

    from app.converter import _load_step_document
    from app.metrics import compute_document_metrics
    from OCC.Core.XCAFDoc import XCAFDoc_DocumentTool

    _, shape_tool = _load_step_document(step_path)
    metrics = compute_document_metrics(shape_tool)
    assert metrics["surfaceAreaM2"] > 0
    assert metrics["totalSurfaceAreaM2"] > 0
    _assert_close(metrics["surfaceAreaM2"], metrics["totalSurfaceAreaM2"], rel_tol=0.05)


def main() -> int:
    test_solid_box_exterior_matches_total()
    test_hollow_tube_exterior_less_than_total()
    test_box_step_file_if_available()
    print("All exterior face tests passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
