"""Provider adapters and failover router; standard library only."""
from __future__ import annotations
import json
import os
import urllib.error
import urllib.request
from urllib.parse import urlparse
from typing import Dict, List, Optional

class ProviderError(RuntimeError):
    """A provider could not complete a request."""

class BaseProvider:
    name = "base"
    remote = False
    def __init__(self, model: str, timeout: int = 60):
        self.model = model
        self.timeout = max(5, min(int(timeout), 300))
    def generate(self, prompt: str) -> str:
        raise NotImplementedError
    def _post_json(self, url: str, payload: dict, headers: Optional[dict] = None) -> dict:
        data = json.dumps(payload).encode("utf-8")
        request_headers = {"Content-Type": "application/json"}
        if headers:
            request_headers.update(headers)
        request = urllib.request.Request(url, data=data, headers=request_headers, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                raw = response.read(2 * 1024 * 1024 + 1)
            if len(raw) > 2 * 1024 * 1024:
                raise ProviderError("La respuesta superó el límite de 2 MiB.")
            return json.loads(raw.decode("utf-8"))
        except urllib.error.HTTPError as exc:
            raise ProviderError("El proveedor respondió con HTTP {}.".format(exc.code)) from None
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            raise ProviderError("No se pudo conectar: {}".format(type(exc).__name__)) from None
        except (ValueError, UnicodeDecodeError) as exc:
            raise ProviderError("Respuesta JSON inválida: {}".format(type(exc).__name__)) from None

class OllamaProvider(BaseProvider):
    name = "ollama"
    remote = False
    def __init__(self, model: str, base_url: str = "http://127.0.0.1:11434", timeout: int = 120):
        super().__init__(model, timeout)
        self.base_url = base_url.rstrip("/")
        host = (urlparse(self.base_url).hostname or "").lower()
        self.remote = host not in ("localhost", "127.0.0.1", "::1")
    def generate(self, prompt: str) -> str:
        result = self._post_json(self.base_url + "/api/chat",
            {"model": self.model, "messages": [{"role": "user", "content": prompt}], "stream": False})
        text = (result.get("message") or {}).get("content", "")
        if not isinstance(text, str) or not text.strip():
            raise ProviderError("Ollama devolvió una respuesta vacía o con formato inesperado.")
        return text.strip()

class OpenAICompatibleProvider(BaseProvider):
    """Adapter for explicitly configured OpenAI-compatible chat-completions APIs."""
    name = "openai-compatible"
    remote = True
    def __init__(self, model: str, base_url: str, api_key: str = "", timeout: int = 60):
        super().__init__(model, timeout)
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
    def generate(self, prompt: str) -> str:
        url = self.base_url
        if not url.endswith("/chat/completions"):
            url += "/chat/completions"
        headers = {"Authorization": "Bearer " + self.api_key} if self.api_key else {}
        result = self._post_json(url,
            {"model": self.model, "messages": [{"role": "user", "content": prompt}], "stream": False},
            headers)
        try:
            text = result["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError):
            raise ProviderError("El proveedor devolvió un formato de respuesta no reconocido.") from None
        if not isinstance(text, str) or not text.strip():
            raise ProviderError("El proveedor devolvió una respuesta vacía.")
        return text.strip()

def configured_providers(env=None) -> List[BaseProvider]:
    """Build adapters from environment; remote adapter is opt-in via URL + model."""
    env = env or os.environ
    timeout = int(env.get("BLADI_AI_TIMEOUT", "60"))
    providers: Dict[str, BaseProvider] = {}
    if env.get("BLADI_OLLAMA_MODEL", "llama3.2").strip().lower() not in ("", "off", "none"):
        providers["ollama"] = OllamaProvider(env.get("BLADI_OLLAMA_MODEL", "llama3.2"),
            env.get("BLADI_OLLAMA_URL", "http://127.0.0.1:11434"), timeout)
    remote_url = env.get("BLADI_OPENAI_COMPATIBLE_URL", "").strip()
    remote_model = env.get("BLADI_OPENAI_COMPATIBLE_MODEL", "").strip()
    if remote_url and remote_model:
        providers["openai-compatible"] = OpenAICompatibleProvider(remote_model, remote_url,
            env.get("BLADI_OPENAI_COMPATIBLE_API_KEY", ""), timeout)
    order = [part.strip().lower() for part in env.get("BLADI_AI_ORDER", "ollama,openai-compatible").split(",")]
    return [providers[name] for name in order if name in providers]

class ProviderRouter:
    def __init__(self, providers: List[BaseProvider]):
        self.providers = list(providers)
    def available(self) -> List[dict]:
        return [{"name": p.name, "model": p.model, "remote": p.remote} for p in self.providers]
    def generate(self, prompt: str, provider_name: Optional[str] = None, allow_remote: bool = False):
        if not prompt or not prompt.strip():
            raise ValueError("El prompt no puede estar vacío.")
        candidates = self.providers
        if provider_name:
            candidates = [p for p in candidates if p.name == provider_name]
        if not allow_remote:
            candidates = [p for p in candidates if not p.remote]
        if not candidates:
            raise ProviderError("No hay proveedores elegibles. Revisa la configuración y el permiso de proveedor remoto.")
        failures = []
        for provider in candidates:
            try:
                answer = provider.generate(prompt)
                return {"provider": provider.name, "model": provider.model, "text": answer}
            except ProviderError as exc:
                failures.append("{}: {}".format(provider.name, exc))
        raise ProviderError("Fallaron los proveedores disponibles: " + " | ".join(failures))
