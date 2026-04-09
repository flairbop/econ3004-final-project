"""
Health check endpoints.
"""
from fastapi import APIRouter

from app.core.config import settings
from app.schemas.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and configuration."""
    return HealthResponse(
        status="healthy",
        chatbot_provider=settings.CHATBOT_PROVIDER,
        chatbot_model=settings.CHATBOT_MODEL_NAME
    )