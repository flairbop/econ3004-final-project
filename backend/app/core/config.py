"""
Application configuration loaded from environment variables.
"""
import os
from pathlib import Path
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application settings."""

    # App
    APP_NAME: str = "AI Career Coach"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"

    # CORS - use Field to avoid parsing issues with env file
    BACKEND_CORS_ORIGINS: str = Field(default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000", env="BACKEND_CORS_ORIGINS")

    @property
    def cors_origins(self) -> list[str]:
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]
        return self.BACKEND_CORS_ORIGINS

    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/app.db"

    # File uploads
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set[str] = {".pdf", ".docx", ".txt"}

    # AI Model Configuration
    # FREE-FIRST DEFAULTS: Ollama for local development
    # For public deployment, frontend uses browser-based inference (WebLLM)
    # Report generation model (can use Ollama, OpenAI, Anthropic, etc.)
    REPORT_MODEL_PROVIDER: str = "ollama"  # Default: ollama (free, local)
    REPORT_MODEL_NAME: str = "qwen2.5:7b"  # Lightweight, good quality
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