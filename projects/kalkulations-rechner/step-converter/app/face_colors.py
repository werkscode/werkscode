from __future__ import annotations

from OCC.Core.Quantity import Quantity_Color
from OCC.Core.TDF import TDF_Label, TDF_LabelSequence
from OCC.Core.TopAbs import TopAbs_FACE
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopoDS import TopoDS_Shape, topods
from OCC.Core.XCAFDoc import XCAFDoc_ColorSurf

from app.exterior_faces import collect_solids
from app.face_fingerprint import encode_fingerprint_index


def _set_face_color(shape_tool, color_tool, label: TDF_Label, face, color: Quantity_Color) -> None:
    sub_label = shape_tool.AddSubShape(label, face)
    color_tool.SetColor(sub_label, color, XCAFDoc_ColorSurf)


def _color_shape_faces(
    shape_tool,
    color_tool,
    label: TDF_Label,
    shape: TopoDS_Shape,
    counter: list[int],
) -> None:
    solids = collect_solids(shape)
    if solids:
        for solid in solids:
            explorer = TopExp_Explorer(solid, TopAbs_FACE)
            while explorer.More():
                face = topods.Face(explorer.Current())
                color = encode_fingerprint_index(counter[0])
                counter[0] += 1
                _set_face_color(shape_tool, color_tool, label, face, color)
                explorer.Next()
        return

    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    while explorer.More():
        face = topods.Face(explorer.Current())
        color = encode_fingerprint_index(counter[0])
        counter[0] += 1
        _set_face_color(shape_tool, color_tool, label, face, color)
        explorer.Next()


def _color_label_faces(shape_tool, color_tool, label: TDF_Label, counter: list[int]) -> None:
    if shape_tool.IsAssembly(label):
        components = TDF_LabelSequence()
        shape_tool.GetComponents(label, components)
        for index in range(components.Length()):
            component = components.Value(index + 1)
            if shape_tool.IsReference(component):
                referred = TDF_Label()
                shape_tool.GetReferredShape(component, referred)
                _color_label_faces(shape_tool, color_tool, referred, counter)
            else:
                _color_label_faces(shape_tool, color_tool, component, counter)
        return

    if shape_tool.IsSimpleShape(label):
        shape = shape_tool.GetShape(label)
        _color_shape_faces(shape_tool, color_tool, label, shape, counter)


def apply_face_fingerprint_colors(shape_tool, color_tool) -> None:
    counter = [0]
    roots = TDF_LabelSequence()
    shape_tool.GetFreeShapes(roots)
    for index in range(roots.Length()):
        _color_label_faces(shape_tool, color_tool, roots.Value(index + 1), counter)
