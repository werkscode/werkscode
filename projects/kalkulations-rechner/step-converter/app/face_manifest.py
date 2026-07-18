from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from OCC.Core.TDF import TDF_Label, TDF_LabelSequence
from OCC.Core.TopAbs import TopAbs_FACE
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopoDS import TopoDS_Shape, topods

from app.assembly import _read_glb_json
from app.exterior_faces import collect_solids, face_area_mm2, is_exterior_face_on_solid
from app.face_fingerprint import decode_fingerprint_rgb

logger = logging.getLogger(__name__)


def _collect_shape_faces(shape: TopoDS_Shape) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    solids = collect_solids(shape)
    if solids:
        for solid in solids:
            explorer = TopExp_Explorer(solid, TopAbs_FACE)
            while explorer.More():
                face = topods.Face(explorer.Current())
                records.append({
                    "areaMm2": face_area_mm2(face),
                    "isExterior": is_exterior_face_on_solid(face, solid),
                })
                explorer.Next()
        return records

    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    while explorer.More():
        face = topods.Face(explorer.Current())
        records.append({
            "areaMm2": face_area_mm2(face),
            "isExterior": True,
        })
        explorer.Next()
    return records


def _collect_label_faces(shape_tool, label: TDF_Label) -> list[dict[str, Any]]:
    if shape_tool.IsAssembly(label):
        records: list[dict[str, Any]] = []
        components = TDF_LabelSequence()
        shape_tool.GetComponents(label, components)
        for index in range(components.Length()):
            component = components.Value(index + 1)
            if shape_tool.IsReference(component):
                referred = TDF_Label()
                shape_tool.GetReferredShape(component, referred)
                records.extend(_collect_label_faces(shape_tool, referred))
            else:
                records.extend(_collect_label_faces(shape_tool, component))
        return records

    if shape_tool.IsSimpleShape(label):
        shape = shape_tool.GetShape(label)
        return _collect_shape_faces(shape)

    return []


def collect_document_faces(shape_tool) -> list[dict[str, Any]]:
    roots = TDF_LabelSequence()
    shape_tool.GetFreeShapes(roots)
    records: list[dict[str, Any]] = []
    for index in range(roots.Length()):
        records.extend(_collect_label_faces(shape_tool, roots.Value(index + 1)))

    for fingerprint_index, record in enumerate(records):
        record["fingerprintIndex"] = fingerprint_index

    return records


def _collect_gltf_primitive_slots(glb_json: dict[str, Any]) -> list[dict[str, Any]]:
    nodes = glb_json.get("nodes", [])
    meshes = glb_json.get("meshes", [])
    scenes = glb_json.get("scenes", [])
    slots: list[dict[str, Any]] = []

    def walk(node_index: int) -> None:
        node = nodes[node_index]
        node_name = node.get("name") or f"node-{node_index}"
        mesh_ref = node.get("mesh")
        if mesh_ref is not None:
            mesh = meshes[mesh_ref]
            primitives = mesh.get("primitives", [])
            for group_index, primitive in enumerate(primitives):
                slots.append({
                    "gltfNodeName": node_name,
                    "meshIndex": mesh_ref,
                    "groupIndex": group_index,
                    "materialIndex": primitive.get("material", 0),
                })
        for child_index in node.get("children", []):
            walk(child_index)

    if scenes:
        for root_index in scenes[0].get("nodes", []):
            walk(root_index)

    return slots


def _read_slot_fingerprint(glb_json: dict[str, Any], slot: dict[str, Any]) -> int | None:
    materials = glb_json.get("materials", [])
    material_index = slot.get("materialIndex", 0)
    if material_index < 0 or material_index >= len(materials):
        return None

    material = materials[material_index]
    pbr = material.get("pbrMetallicRoughness", {})
    base_color = pbr.get("baseColorFactor", [1.0, 1.0, 1.0, 1.0])
    if len(base_color) < 3:
        return None

    return decode_fingerprint_rgb(base_color[0], base_color[1], base_color[2])


def _distribute_counts(total: int, buckets: int) -> list[int]:
    if buckets <= 0:
        return []
    base, remainder = divmod(total, buckets)
    return [base + (1 if index < remainder else 0) for index in range(buckets)]


def _face_entry(
    record: dict[str, Any],
    slot: dict[str, Any],
    face_id: str,
) -> dict[str, Any]:
    return {
        "id": face_id,
        "areaMm2": record["areaMm2"],
        "isExterior": record["isExterior"],
        "gltfNodeName": slot["gltfNodeName"],
        "meshIndex": slot["meshIndex"],
        "groupIndex": slot["groupIndex"],
        "materialIndex": slot["materialIndex"],
    }


def _aggregate_bucket_faces(
    bucket: list[dict[str, Any]],
    slot: dict[str, Any],
    face_id: str,
) -> dict[str, Any]:
    return {
        "id": face_id,
        "areaMm2": sum(record["areaMm2"] for record in bucket),
        "isExterior": all(record["isExterior"] for record in bucket),
        "gltfNodeName": slot["gltfNodeName"],
        "meshIndex": slot["meshIndex"],
        "groupIndex": slot["groupIndex"],
        "materialIndex": slot["materialIndex"],
    }


def _fallback_positional_match(
    face_records: list[dict[str, Any]],
    slots: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    logger.warning(
        "Fingerprint matching incomplete; falling back to positional alignment (%d faces, %d slots)",
        len(face_records),
        len(slots),
    )

    if len(slots) == len(face_records):
        return [
            _face_entry(record, slot, str(index))
            for index, (record, slot) in enumerate(zip(face_records, slots))
        ]

    enriched: list[dict[str, Any]] = []
    bucket_sizes = _distribute_counts(len(face_records), len(slots))
    brep_index = 0
    for slot_index, slot in enumerate(slots):
        bucket_size = bucket_sizes[slot_index]
        bucket = face_records[brep_index : brep_index + bucket_size]
        brep_index += bucket_size
        if not bucket:
            continue
        enriched.append(_aggregate_bucket_faces(bucket, slot, str(slot_index)))
    return enriched


def _assign_slot_for_face(
    fingerprint_index: int,
    fingerprint_to_slot: dict[int, dict[str, Any]],
    slots: list[dict[str, Any]],
) -> dict[str, Any]:
    direct = fingerprint_to_slot.get(fingerprint_index)
    if direct is not None:
        return direct

    for previous_index in range(fingerprint_index - 1, -1, -1):
        previous_slot = fingerprint_to_slot.get(previous_index)
        if previous_slot is not None:
            return previous_slot

    return slots[fingerprint_index % len(slots)]


def enrich_faces_with_glb_metadata(
    face_records: list[dict[str, Any]],
    glb_path: Path,
) -> list[dict[str, Any]]:
    if not face_records:
        return []

    glb_json = _read_glb_json(glb_path)
    slots = _collect_gltf_primitive_slots(glb_json)

    if not slots:
        return [
            {
                "id": str(index),
                "areaMm2": record["areaMm2"],
                "isExterior": record["isExterior"],
                "gltfNodeName": "",
                "meshIndex": 0,
                "groupIndex": 0,
                "materialIndex": 0,
            }
            for index, record in enumerate(face_records)
        ]

    fingerprint_to_slot: dict[int, dict[str, Any]] = {}
    for slot in slots:
        fingerprint_index = _read_slot_fingerprint(glb_json, slot)
        if fingerprint_index is not None and fingerprint_index not in fingerprint_to_slot:
            fingerprint_to_slot[fingerprint_index] = slot

    if len(fingerprint_to_slot) == len(face_records):
        return [
            _face_entry(record, fingerprint_to_slot[record["fingerprintIndex"]], str(record["fingerprintIndex"]))
            for record in face_records
        ]

    if len(fingerprint_to_slot) > 0:
        enriched = [
            _face_entry(
                record,
                _assign_slot_for_face(record["fingerprintIndex"], fingerprint_to_slot, slots),
                str(record["fingerprintIndex"]),
            )
            for record in face_records
        ]
        if len(enriched) == len(face_records):
            if len(fingerprint_to_slot) < len(face_records):
                logger.warning(
                    "Partial fingerprint match (%d/%d); assigned shared GLB groups for merged faces",
                    len(fingerprint_to_slot),
                    len(face_records),
                )
            return enriched

    return _fallback_positional_match(face_records, slots)


def build_face_manifest(shape_tool, glb_path: Path) -> list[dict[str, Any]]:
    face_records = collect_document_faces(shape_tool)
    return enrich_faces_with_glb_metadata(face_records, glb_path)
