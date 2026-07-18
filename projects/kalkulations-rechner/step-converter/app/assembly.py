from __future__ import annotations

import json
import struct
from pathlib import Path
from typing import Any

from OCC.Core.TDF import TDF_Label, TDF_LabelSequence
from OCC.Core.TDocStd import TDocStd_Document
from OCC.Core.XCAFDoc import XCAFDoc_DocumentTool


def _label_name(label: TDF_Label, fallback_id: str) -> str:
    label_name = label.GetLabelName()
    if label_name:
        return label_name

    return f"Part {fallback_id}"


def _build_node(shape_tool, label: TDF_Label, node_id: str) -> dict[str, Any]:
    name = _label_name(label, node_id)
    is_assembly = shape_tool.IsAssembly(label)
    node_type = "assembly" if is_assembly else "part"

    children: list[dict[str, Any]] = []

    if is_assembly:
        components = TDF_LabelSequence()
        shape_tool.GetComponents(label, components)
        for index in range(components.Length()):
            component = components.Value(index + 1)
            child_label = component
            if shape_tool.IsReference(component):
                referred = TDF_Label()
                shape_tool.GetReferredShape(component, referred)
                child_label = referred
            child_id = f"{node_id}/{index}"
            children.append(_build_node(shape_tool, child_label, child_id))

    return {
        "id": node_id,
        "name": name,
        "type": node_type,
        "gltfName": name,
        "children": children,
    }


def build_assembly_tree(doc: TDocStd_Document) -> dict[str, Any]:
    shape_tool = XCAFDoc_DocumentTool.ShapeTool(doc.Main())
    roots = TDF_LabelSequence()
    shape_tool.GetFreeShapes(roots)

    children: list[dict[str, Any]] = []
    for index in range(roots.Length()):
        root_label = roots.Value(index + 1)
        children.append(_build_node(shape_tool, root_label, str(index)))

    if len(children) == 1:
        return children[0]

    return {
        "id": "root",
        "name": "Assembly",
        "type": "assembly",
        "gltfName": "Assembly",
        "children": children,
    }


def _read_glb_json(glb_path: Path) -> dict[str, Any]:
    data = glb_path.read_bytes()
    if len(data) < 20 or data[:4] != b"glTF":
        raise IOError("Ungültige GLB-Datei.")

    chunk_length = struct.unpack_from("<I", data, 12)[0]
    chunk_type = data[16:20]
    if chunk_type != b"JSON":
        raise IOError("GLB enthält keinen JSON-Chunk.")

    return json.loads(data[20 : 20 + chunk_length])


def _normalize_name(value: str) -> str:
    return value.strip().lower()


def _collect_gltf_mesh_nodes(glb_json: dict[str, Any]) -> list[dict[str, Any]]:
    nodes = glb_json.get("nodes", [])
    scenes = glb_json.get("scenes", [])
    mesh_nodes: list[dict[str, Any]] = []

    def walk(index: int) -> None:
        node = nodes[index]
        name = node.get("name") or f"node-{index}"
        has_mesh = node.get("mesh") is not None
        children = node.get("children", [])

        if has_mesh or not children:
            mesh_nodes.append({"index": len(mesh_nodes), "name": name, "nodeIndex": index})

        for child_index in children:
            walk(child_index)

    if scenes:
        for root_index in scenes[0].get("nodes", []):
            walk(root_index)

    return mesh_nodes


def _collect_tree_nodes(tree: dict[str, Any]) -> list[dict[str, Any]]:
    collected: list[dict[str, Any]] = []

    def walk(node: dict[str, Any]) -> None:
        collected.append(node)
        for child in node.get("children", []):
            walk(child)

    walk(tree)
    return collected


def enrich_assembly_tree_with_glb_names(
    tree: dict[str, Any],
    glb_path: Path,
) -> dict[str, Any]:
    glb_json = _read_glb_json(glb_path)
    gltf_mesh_nodes = _collect_gltf_mesh_nodes(glb_json)
    gltf_names = [node["name"] for node in gltf_mesh_nodes]

    leaf_parts = [
        node
        for node in _collect_tree_nodes(tree)
        if node.get("type") == "part" and not node.get("children")
    ]

    used_indices: set[int] = set()

    for part in leaf_parts:
        candidate_names = {
            _normalize_name(part.get("name", "")),
            _normalize_name(part.get("gltfName", "")),
        }
        candidate_names.discard("")

        for gltf_node in gltf_mesh_nodes:
            gltf_index = gltf_node["index"]
            if gltf_index in used_indices:
                continue
            if _normalize_name(gltf_node["name"]) in candidate_names:
                part["gltfName"] = gltf_node["name"]
                part["gltfIndex"] = gltf_index
                used_indices.add(gltf_index)
                break

    remaining_gltf = [node for node in gltf_mesh_nodes if node["index"] not in used_indices]
    remaining_parts = [part for part in leaf_parts if "gltfIndex" not in part]
    for part, gltf_node in zip(remaining_parts, remaining_gltf):
        part["gltfName"] = gltf_node["name"]
        part["gltfIndex"] = gltf_node["index"]

    if gltf_names:
        tree["gltfNames"] = gltf_names

    return tree
