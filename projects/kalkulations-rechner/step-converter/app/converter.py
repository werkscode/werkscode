from __future__ import annotations

from pathlib import Path
from typing import Any

from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.BRepTools import breptools
from OCC.Core.IFSelect import IFSelect_RetDone
from OCC.Core.Message import Message_ProgressRange
from OCC.Core.RWGltf import RWGltf_CafWriter
from OCC.Core.STEPCAFControl import STEPCAFControl_Reader
from OCC.Core.TCollection import TCollection_AsciiString
from OCC.Core.TColStd import TColStd_IndexedDataMapOfStringString
from OCC.Core.TDF import TDF_Label, TDF_LabelSequence
from OCC.Core.TDocStd import TDocStd_Document
from OCC.Core.TopAbs import TopAbs_FACE
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopoDS import TopoDS_Shape, topods
from OCC.Core.XCAFDoc import XCAFDoc_DocumentTool

from app.assembly import build_assembly_tree, enrich_assembly_tree_with_glb_names
from app.exterior_faces import collect_solids
from app.face_colors import apply_face_fingerprint_colors
from app.face_manifest import build_face_manifest
from app.metrics import compute_document_metrics


def _load_step_document(step_path: Path) -> tuple[TDocStd_Document, Any]:
    doc = TDocStd_Document("pythonocc-doc-step-import")
    shape_tool = XCAFDoc_DocumentTool.ShapeTool(doc.Main())

    reader = STEPCAFControl_Reader()
    reader.SetColorMode(True)
    reader.SetLayerMode(True)
    reader.SetNameMode(True)
    reader.SetMatMode(True)

    status = reader.ReadFile(str(step_path))
    if status != IFSelect_RetDone:
        raise IOError(f"STEP-Datei konnte nicht gelesen werden: {step_path}")

    if not reader.Transfer(doc):
        raise IOError(f"STEP-Transfer fehlgeschlagen: {step_path}")

    return doc, shape_tool


def _mesh_faces_on_shape(shape: TopoDS_Shape, linear_deflection: float) -> None:
    solids = collect_solids(shape)
    if solids:
        for solid in solids:
            explorer = TopExp_Explorer(solid, TopAbs_FACE)
            while explorer.More():
                face = topods.Face(explorer.Current())
                breptools.Clean(face)
                mesher = BRepMesh_IncrementalMesh(face, linear_deflection, False, 0.5, True)
                mesher.Perform()
                explorer.Next()
        return

    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    while explorer.More():
        face = topods.Face(explorer.Current())
        breptools.Clean(face)
        mesher = BRepMesh_IncrementalMesh(face, linear_deflection, False, 0.5, True)
        mesher.Perform()
        explorer.Next()


def _mesh_label(shape_tool, label: TDF_Label, linear_deflection: float) -> None:
    if shape_tool.IsAssembly(label):
        components = TDF_LabelSequence()
        shape_tool.GetComponents(label, components)
        for index in range(components.Length()):
            component = components.Value(index + 1)
            if shape_tool.IsReference(component):
                referred = TDF_Label()
                shape_tool.GetReferredShape(component, referred)
                _mesh_label(shape_tool, referred, linear_deflection)
            else:
                _mesh_label(shape_tool, component, linear_deflection)
        return

    if shape_tool.IsSimpleShape(label):
        shape = shape_tool.GetShape(label)
        _mesh_faces_on_shape(shape, linear_deflection)
        return


def _mesh_document(shape_tool, linear_deflection: float) -> None:
    roots = TDF_LabelSequence()
    shape_tool.GetFreeShapes(roots)
    for index in range(roots.Length()):
        _mesh_label(shape_tool, roots.Value(index + 1), linear_deflection)


def _export_gltf(doc: TDocStd_Document, glb_path: Path) -> None:
    file_info = TColStd_IndexedDataMapOfStringString()
    file_info.Add(
        TCollection_AsciiString("Authors"),
        TCollection_AsciiString("kalkulations-rechner"),
    )

    writer = RWGltf_CafWriter(str(glb_path), True)
    status = writer.Perform(doc, file_info, Message_ProgressRange())
    if status != IFSelect_RetDone:
        raise IOError("GLB-Export fehlgeschlagen.")


def step_to_glb(
    step_path: Path,
    glb_path: Path,
    linear_deflection: float = 0.1,
) -> dict[str, Any]:
    doc, shape_tool = _load_step_document(step_path)
    metrics = compute_document_metrics(shape_tool)
    assembly_tree = build_assembly_tree(doc)
    _mesh_document(shape_tool, linear_deflection)
    color_tool = XCAFDoc_DocumentTool.ColorTool(doc.Main())
    apply_face_fingerprint_colors(shape_tool, color_tool)
    _export_gltf(doc, glb_path)
    faces = build_face_manifest(shape_tool, glb_path)
    enriched_tree = enrich_assembly_tree_with_glb_names(assembly_tree, glb_path)
    return {
        "assemblyTree": enriched_tree,
        "faces": faces,
        **metrics,
    }
