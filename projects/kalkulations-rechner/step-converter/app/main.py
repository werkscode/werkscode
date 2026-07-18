import json
import shutil
import uuid
from pathlib import Path
from typing import Any

import aiofiles
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.config import (
    ALLOWED_EXTENSIONS,
    LINEAR_DEFLECTION,
    MAX_UPLOAD_SIZE_BYTES,
    UPLOAD_DIR,
)
from app.converter import step_to_glb

app = FastAPI(title="STEP Converter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/convert")
async def convert_step(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Kein Dateiname angegeben.")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Ungültiges Dateiformat. Erlaubt: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Datei zu groß. Maximum: {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)} MB",
        )

    model_id = str(uuid.uuid4())
    model_dir = UPLOAD_DIR / model_id
    model_dir.mkdir(parents=True, exist_ok=True)

    step_path = model_dir / f"input{suffix}"
    glb_path = model_dir / "output.glb"
    assembly_path = model_dir / "assembly.json"
    faces_path = model_dir / "faces.json"

    async with aiofiles.open(step_path, "wb") as f:
        await f.write(content)

    try:
        result = step_to_glb(
            step_path,
            glb_path,
            linear_deflection=LINEAR_DEFLECTION,
        )
        async with aiofiles.open(assembly_path, "w", encoding="utf-8") as f:
            await f.write(json.dumps(result["assemblyTree"], ensure_ascii=False))
        async with aiofiles.open(faces_path, "w", encoding="utf-8") as f:
            await f.write(json.dumps(result["faces"], ensure_ascii=False))
    except Exception as exc:
        shutil.rmtree(model_dir, ignore_errors=True)
        raise HTTPException(
            status_code=422,
            detail=f"Konvertierung fehlgeschlagen: {exc}",
        ) from exc

    return {
        "modelId": model_id,
        "glbUrl": f"/api/models/{model_id}.glb",
        "fileName": file.filename,
        "assemblyTree": result["assemblyTree"],
        "surfaceAreaM2": result["surfaceAreaM2"],
        "totalSurfaceAreaM2": result["totalSurfaceAreaM2"],
        "boundingBoxMm": result["boundingBoxMm"],
        "faces": result["faces"],
    }


@app.get("/api/models/{model_id}.glb")
async def get_model(model_id: str) -> FileResponse:
    try:
        uuid.UUID(model_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Ungültige Modell-ID.") from exc

    glb_path = UPLOAD_DIR / model_id / "output.glb"
    if not glb_path.is_file():
        raise HTTPException(status_code=404, detail="Modell nicht gefunden.")

    return FileResponse(
        path=glb_path,
        media_type="model/gltf-binary",
        filename=f"{model_id}.glb",
    )


@app.get("/api/models/{model_id}/faces.json")
async def get_faces(model_id: str) -> FileResponse:
    try:
        uuid.UUID(model_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Ungültige Modell-ID.") from exc

    faces_path = UPLOAD_DIR / model_id / "faces.json"
    if not faces_path.is_file():
        raise HTTPException(status_code=404, detail="Flächendaten nicht gefunden.")

    return FileResponse(
        path=faces_path,
        media_type="application/json",
        filename=f"{model_id}-faces.json",
    )


@app.get("/api/models/{model_id}/assembly.json")
async def get_assembly(model_id: str) -> FileResponse:
    try:
        uuid.UUID(model_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Ungültige Modell-ID.") from exc

    assembly_path = UPLOAD_DIR / model_id / "assembly.json"
    if not assembly_path.is_file():
        raise HTTPException(status_code=404, detail="Assembly-Daten nicht gefunden.")

    return FileResponse(
        path=assembly_path,
        media_type="application/json",
        filename=f"{model_id}-assembly.json",
    )
