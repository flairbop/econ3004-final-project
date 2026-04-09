"""
Resume upload and parsing endpoints.
"""
import uuid
import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlmodel import Session

from app.core.config import settings
from app.db.database import get_session
from app.models.models import ResumeDocument, AnalysisSession, AnalysisStatus
from app.schemas.schemas import UploadResponse
from app.utils.file_parser import parse_resume_file, extract_resume_structure

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload-resume", response_model=UploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_session)
):
    """
    Upload and parse a resume file (PDF, DOCX, or TXT).
    """
    # Validate file extension
    extension = Path(file.filename).suffix.lower()
    if extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: {extension}. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE / (1024*1024):.1f}MB"
        )

    # Generate session ID
    session_id = str(uuid.uuid4())

    try:
        # Parse the file
        text, warnings, metadata = parse_resume_file(contents, file.filename)

        # Extract structure
        structure = extract_resume_structure(text)

        # Save file to disk
        file_path = settings.UPLOAD_DIR / f"{session_id}{extension}"
        with open(file_path, "wb") as f:
            f.write(contents)

        # Create database records
        session = AnalysisSession(
            session_id=session_id,
            status=AnalysisStatus.PENDING,
            status_message="Resume uploaded and parsed successfully"
        )
        db.add(session)

        resume_doc = ResumeDocument(
            session_id=session_id,
            filename=file.filename,
            file_path=str(file_path),
            raw_text=text,
            parsed_structure=json.dumps(structure),
            parsing_warnings="|".join(warnings) if warnings else None
        )
        db.add(resume_doc)

        db.commit()

        return UploadResponse(
            session_id=session_id,
            filename=file.filename,
            file_size=len(contents),
            parsing_status="success" if not warnings else "partial",
            warnings=warnings if warnings else None
        )

    except Exception as e:
        logger.error(f"Resume upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")