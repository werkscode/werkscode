from __future__ import annotations

from pathlib import Path

from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Cut
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox, BRepPrimAPI_MakeCylinder
from OCC.Core.TDocStd import TDocStd_Document
from OCC.Core.XCAFDoc import XCAFDoc_DocumentTool

from app.converter import _export_gltf, _mesh_document, step_to_glb
from app.face_colors import apply_face_fingerprint_colors
from app.face_manifest import build_face_manifest, collect_document_faces


def _build_glb(shape, glb_path: Path) -> list[dict]:
    doc = TDocStd_Document("test")
    shape_tool = XCAFDoc_DocumentTool.ShapeTool(doc.Main())
    color_tool = XCAFDoc_DocumentTool.ColorTool(doc.Main())
    label = shape_tool.AddShape(shape)
    shape_tool.SetShape(label, shape)
    _mesh_document(shape_tool, 0.5)
    apply_face_fingerprint_colors(shape_tool, color_tool)
    _export_gltf(doc, glb_path)
    return build_face_manifest(shape_tool, glb_path)


def test_box_face_manifest_count_and_exterior(tmp_path: Path) -> None:
    box = BRepPrimAPI_MakeBox(10, 10, 10).Shape()
    faces = _build_glb(box, tmp_path / "box.glb")
    assert len(faces) == 6
    assert all(face["isExterior"] for face in faces)
    assert {face["groupIndex"] for face in faces} == {0, 1, 2, 3, 4, 5}


def test_tube_face_manifest_has_interior(tmp_path: Path) -> None:
    outer = BRepPrimAPI_MakeCylinder(50, 200).Shape()
    inner = BRepPrimAPI_MakeCylinder(40, 200).Shape()
    tube = BRepAlgoAPI_Cut(outer, inner).Shape()
    faces = _build_glb(tube, tmp_path / "tube.glb")
    exterior_count = sum(1 for face in faces if face["isExterior"])
    assert len(faces) == 4
    assert exterior_count == 3
    assert exterior_count < len(faces)


def test_manifest_matches_brep_face_count_for_box(tmp_path: Path) -> None:
    box = BRepPrimAPI_MakeBox(10, 10, 10).Shape()
    doc = TDocStd_Document("test")
    shape_tool = XCAFDoc_DocumentTool.ShapeTool(doc.Main())
    label = shape_tool.AddShape(box)
    shape_tool.SetShape(label, box)
    brep_faces = collect_document_faces(shape_tool)
    manifest_faces = _build_glb(box, tmp_path / "box-count.glb")
    assert len(manifest_faces) == len(brep_faces)


def _step_box_asset_path() -> Path | None:
    candidates = [
        Path(__file__).resolve().parents[2] / "step-viewer" / "test-assets" / "box.step",
        Path("/step-viewer/test-assets/box.step"),
    ]
    file_path = Path(__file__).resolve()
    if len(file_path.parents) > 3:
        candidates.append(file_path.parents[3] / ".." / "step-viewer" / "test-assets" / "box.step")
    for candidate in candidates:
        resolved = candidate.resolve()
        if resolved.is_file():
            return resolved
    return None


def test_step_box_maps_each_brep_face_to_glb_primitive(tmp_path: Path) -> None:
    step_path = _step_box_asset_path()
    if step_path is None:
        return

    result = step_to_glb(step_path, tmp_path / "box.glb", linear_deflection=0.1)
    faces = result["faces"]
    assert len(faces) == 6
    assert all(face["isExterior"] for face in faces)
    assert sum(face["areaMm2"] for face in faces) > 0
    assert len({(face["gltfNodeName"], face["groupIndex"]) for face in faces}) >= 3
