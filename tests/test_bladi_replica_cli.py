import io
import tempfile
import unittest
from contextlib import redirect_stdout
from unittest.mock import patch
from bladi_replica_engine.cli import main
from bladi_replica_engine.engine import init_project, load_state
from bladi_replica_engine.memory import read_memory

class FakeRouter:
    def available(self):
        return [{"name": "ollama", "model": "test", "remote": False}]
    def generate(self, prompt, provider_name=None, allow_remote=False):
        return {"provider": "ollama", "model": "test", "text": "Borrador de prueba"}

class CliTests(unittest.TestCase):
    def test_run_stage_saves_draft_without_completing_stage(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = init_project(tmp, "cli-demo")
            with patch("bladi_replica_engine.cli._router", return_value=FakeRouter()):
                with redirect_stdout(io.StringIO()):
                    main(["run-stage", str(project)])
            draft = project / "outputs" / "drafts" / "recon-draft.md"
            self.assertTrue(draft.is_file())
            self.assertIn("Borrador de prueba", draft.read_text(encoding="utf-8"))
            self.assertEqual(load_state(project)["completed"], [])
            self.assertEqual(load_state(project)["current_stage"], "recon")
            self.assertIn("Borrador de prueba", read_memory(project)[0]["content"])
    def test_ask_save_writes_local_memory(self):
        with tempfile.TemporaryDirectory() as tmp:
            project = init_project(tmp, "ask-demo")
            with patch("bladi_replica_engine.cli._router", return_value=FakeRouter()):
                with redirect_stdout(io.StringIO()):
                    main(["ask", "--text", "hola", "--project-dir", str(project), "--save"])
            items = read_memory(project)
            self.assertEqual(len(items), 2)
            self.assertEqual(items[0]["role"], "user")
            self.assertEqual(items[1]["content"], "Borrador de prueba")

if __name__ == "__main__":
    unittest.main()
