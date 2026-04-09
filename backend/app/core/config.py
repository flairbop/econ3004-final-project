"""
Application configuration loaded from environment variables.
"""
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application settings."""

    # App
    APP_NAME: str = "AI Career Coach"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/app.db"

    # File uploads
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set[str] = {".pdf", ".docx", ".txt"}

    # AI Model Configuration
    # Report generation model (can use OpenAI, Anthropic, etc.)
    REPORT_MODEL_PROVIDER: str = "openai"  # or "anthropic"
    REPORT_MODEL_NAME: str = "gpt-4o-mini"
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    # Chatbot model (default to local Ollama for zero cost)
    CHATBOT_PROVIDER: str = "ollama"  # "ollama", "huggingface", "openai"
    CHATBOT_MODEL_NAME: str = "llama3.2"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    HUGGINGFACE_API_KEY: Optional[str] = None

    # Report generation settings
    MAX_REPORT_TOKENS: int = 4000
    REPORT_TEMPERATURE: float = 0.3

    # Chat settings
    MAX_CHAT_TOKENS: int = 2000
    CHAT_TEMPERATURE: float = 0.7
    MAX_CHAT_HISTORY: int = 20

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Ensure upload directory exists
settings.UPLOAD_DIR.mkdir(exist_ok=True)