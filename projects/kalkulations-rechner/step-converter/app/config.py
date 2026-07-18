import os
from pathlib import Path

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/tmp/uploads"))
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = {".step", ".stp"}
LINEAR_DEFLECTION = float(os.getenv("LINEAR_DEFLECTION", "0.1"))
