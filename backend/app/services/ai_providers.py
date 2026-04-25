"""
AI provider abstractions for report generation and chatbot.
"""
import json
import logging
from abc import ABC, abstractmethod
from typing import AsyncGenerator, Optional, Dict, Any, List
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class BaseAIProvider(ABC):
    """Base class for AI providers."""

    def __init__(self, model_name: str):
        self.model_name = model_name

    @abstractmethod
    async def generate(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
        """Generate a complete response."""
        pass

    @abstractmethod
    async def generate_stream(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        """Generate a streaming response."""
        pass


class OpenAIProvider(BaseAIProvider):
    """OpenAI API provider."""

    def __init__(self, model_name: str, api_key: Optional[str] = None):
        super().__init__(model_name)
        self.api_key = api_key or settings.OPENAI_API_KEY
        if not self.api_key:
            raise ValueError("OpenAI API key not provided")
        self.base_url = "https://api.openai.com/v1"

    async def generate(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
        """Generate using OpenAI API."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def generate_stream(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        """Stream generation from OpenAI API."""
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "stream": True
                },
                timeout=60.0
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            if "choices" in chunk and len(chunk["choices"]) > 0:
                                delta = chunk["choices"][0].get("delta", {})
                                if "content" in delta:
                                    yield delta["content"]
                        except json.JSONDecodeError:
                            continue


class AnthropicProvider(BaseAIProvider):
    """Anthropic Claude API provider."""

    def __init__(self, model_name: str, api_key: Optional[str] = None):
        super().__init__(model_name)
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        if not self.api_key:
            raise ValueError("Anthropic API key not provided")
        self.base_url = "https://api.anthropic.com/v1"

    async def generate(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
        """Generate using Anthropic API."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]

    async def generate_stream(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        """Stream generation from Anthropic API."""
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "stream": True
                },
                timeout=60.0
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        try:
                            chunk = json.loads(data)
                            if chunk.get("type") == "content_block_delta":
                                yield chunk["delta"].get("text", "")
                        except json.JSONDecodeError:
                            continue


class OllamaProvider(BaseAIProvider):
    """
    Ollama local model provider.
    This is the default zero-cost option for the chatbot.
    """

    def __init__(self, model_name: str, base_url: Optional[str] = None):
        super().__init__(model_name)
        self.base_url = base_url or settings.OLLAMA_BASE_URL

    async def _check_model(self) -> bool:
        """Check if the model is available in Ollama."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/tags",
                    timeout=5.0
                )
                response.raise_for_status()
                data = response.json()
                models = [m["name"] for m in data.get("models", [])]
                return any(self.model_name in m for m in models)
        except Exception as e:
            logger.warning(f"Could not check Ollama models: {e}")
            return False

    async def generate(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
        """Generate using local Ollama instance."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json",  # Force JSON output - no preamble text
                        "options": {
                            "temperature": temperature,
                            "num_predict": max_tokens,
                            "num_ctx": 16384  # Larger context for long prompts + responses
                        }
                    },
                    timeout=600.0  # 10 minutes for complex reports on slower hardware
                )
                response.raise_for_status()
                data = response.json()
                return data.get("response", "")
        except httpx.ConnectError:
            raise RuntimeError(
                f"Could not connect to Ollama at {self.base_url}. "
                "Make sure Ollama is running and the model is pulled."
            )
        except Exception as e:
            logger.error(f"Ollama generation error: {e}")
            raise

    async def generate_stream(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        """Stream generation from Ollama."""
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": True,
                        "options": {
                            "temperature": temperature,
                            "num_predict": max_tokens,
                            "num_ctx": 8192  # Larger context for long prompts
                        }
                    },
                    timeout=300.0  # 5 minutes for complex reports
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                if "response" in data:
                                    yield data["response"]
                                if data.get("done", False):
                                    break
                            except json.JSONDecodeError:
                                continue
        except httpx.ConnectError:
            yield (
                f"Error: Could not connect to Ollama at {self.base_url}. "
                "Please make sure Ollama is running and the model is pulled."
            )
        except Exception as e:
            logger.error(f"Ollama streaming error: {e}")
            yield f"Error: {str(e)}"


class GroqProvider(BaseAIProvider):
    """
    Groq API provider - FREE, ultra-fast (~500-1000 tokens/sec).
    Sign up at: https://console.groq.com/
    Free tier: 30 RPM, 14,400 RPD, 500K tokens/day
    """

    def __init__(self, model_name: str, api_key: Optional[str] = None):
        super().__init__(model_name)
        self.api_key = api_key or settings.GROQ_API_KEY
        if not self.api_key:
            raise ValueError("Groq API key not provided")
        self.base_url = "https://api.groq.com/openai/v1"

    async def generate(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
        """Generate using Groq API - extremely fast."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=30.0  # Groq is fast - 30s is plenty
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def generate_stream(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        """Stream generation from Groq API."""
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "stream": True
                },
                timeout=30.0
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            if "choices" in chunk and len(chunk["choices"]) > 0:
                                delta = chunk["choices"][0].get("delta", {})
                                if "content" in delta:
                                    yield delta["content"]
                        except json.JSONDecodeError:
                            continue


class HuggingFaceProvider(BaseAIProvider):
    """
    Hugging Face Inference API provider.
    Can use free tier or local transformers.
    """

    def __init__(self, model_name: str, api_key: Optional[str] = None):
        super().__init__(model_name)
        self.api_key = api_key or settings.HUGGINGFACE_API_KEY
        self.base_url = "https://api-inference.huggingface.co/models"

    async def generate(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> str:
        """Generate using Hugging Face Inference API."""
        if not self.api_key:
            raise ValueError("Hugging Face API key not provided")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/{self.model_name}",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": max_tokens,
                        "temperature": temperature,
                        "return_full_text": False
                    }
                },
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()

            # Handle different response formats
            if isinstance(data, list) and len(data) > 0:
                return data[0].get("generated_text", "")
            elif isinstance(data, dict):
                return data.get("generated_text", "")
            return str(data)

    async def generate_stream(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        """Hugging Face doesn't support streaming well in free tier."""
        # Fall back to non-streaming
        response = await self.generate(prompt, max_tokens, temperature)
        yield response


def get_report_provider() -> BaseAIProvider:
    """Get the configured provider for report generation."""
    provider = settings.REPORT_MODEL_PROVIDER

    if provider == "groq":
        return GroqProvider(settings.REPORT_MODEL_NAME)
    elif provider == "openai":
        return OpenAIProvider(settings.REPORT_MODEL_NAME)
    elif provider == "anthropic":
        return AnthropicProvider(settings.REPORT_MODEL_NAME)
    elif provider == "ollama":
        return OllamaProvider(settings.REPORT_MODEL_NAME)
    else:
        raise ValueError(f"Unknown report provider: {provider}")


def get_chatbot_provider() -> BaseAIProvider:
    """Get the configured provider for chatbot (defaults to Ollama for zero cost)."""
    provider = settings.CHATBOT_PROVIDER

    if provider == "ollama":
        return OllamaProvider(settings.CHATBOT_MODEL_NAME)
    elif provider == "openai":
        return OpenAIProvider(settings.CHATBOT_MODEL_NAME)
    elif provider == "anthropic":
        return AnthropicProvider(settings.CHATBOT_MODEL_NAME)
    elif provider == "huggingface":
        return HuggingFaceProvider(settings.CHATBOT_MODEL_NAME)
    else:
        # Default to Ollama for zero-cost chat
        return OllamaProvider(settings.CHATBOT_MODEL_NAME)