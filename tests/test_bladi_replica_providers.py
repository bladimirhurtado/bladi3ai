import unittest
from unittest.mock import patch
from bladi_replica_engine.providers import BaseProvider, OllamaProvider, OpenAICompatibleProvider, ProviderError, ProviderRouter, configured_providers

class FakeProvider(BaseProvider):
    def __init__(self, name, result=None, error=None, remote=False):
        self.name, self.model, self.remote = name, "test-model", remote
        self.result, self.error = result, error
    def generate(self, prompt):
        if self.error:
            raise ProviderError(self.error)
        return self.result

class ProviderTests(unittest.TestCase):
    def test_router_fails_over_to_next_provider(self):
        router = ProviderRouter([FakeProvider("local", error="offline"), FakeProvider("backup", result="ok")])
        result = router.generate("hello")
        self.assertEqual(result["provider"], "backup")
        self.assertEqual(result["text"], "ok")
    def test_remote_is_not_used_without_explicit_permission(self):
        router = ProviderRouter([FakeProvider("cloud", result="private", remote=True)])
        with self.assertRaises(ProviderError):
            router.generate("sensitive")
        self.assertEqual(router.generate("public", allow_remote=True)["text"], "private")
    def test_config_defaults_to_local_ollama_only(self):
        providers = configured_providers({})
        self.assertEqual([p.name for p in providers], ["ollama"])
        self.assertFalse(providers[0].remote)
    def test_non_loopback_ollama_endpoint_is_treated_as_remote(self):
        providers = configured_providers({"BLADI_OLLAMA_URL": "http://192.168.1.20:11434"})
        self.assertTrue(providers[0].remote)
    def test_remote_requires_url_and_model(self):
        env = {"BLADI_OPENAI_COMPATIBLE_URL": "https://api.example/v1"}
        self.assertEqual([p.name for p in configured_providers(env)], ["ollama"])
        env["BLADI_OPENAI_COMPATIBLE_MODEL"] = "model-x"
        self.assertEqual([p.name for p in configured_providers(env)], ["ollama", "openai-compatible"])
    @patch.object(BaseProvider, "_post_json", return_value={"message": {"content": "hola"}})
    def test_ollama_response_parsing(self, _post):
        self.assertEqual(OllamaProvider("test").generate("hi"), "hola")
    @patch.object(BaseProvider, "_post_json", return_value={"choices": [{"message": {"content": "respuesta"}}]})
    def test_openai_compatible_response_parsing(self, post):
        provider = OpenAICompatibleProvider("m", "https://api.example/v1", "secret")
        self.assertEqual(provider.generate("hi"), "respuesta")
        self.assertEqual(post.call_args.args[0], "https://api.example/v1/chat/completions")
    @patch.object(BaseProvider, "_post_json", return_value={"unexpected": True})
    def test_bad_provider_response_is_rejected(self, _post):
        with self.assertRaises(ProviderError):
            OpenAICompatibleProvider("m", "https://api.example/v1").generate("hi")
    def test_empty_prompt_is_rejected(self):
        with self.assertRaises(ValueError):
            ProviderRouter([FakeProvider("x", result="y")]).generate(" ")

if __name__ == "__main__":
    unittest.main()
