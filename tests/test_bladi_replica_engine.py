import tempfile
import unittest
import json
from pathlib import Path
from bladi_replica_engine.engine import STAGES, complete_stage, export_manifest, init_project, load_state, prepare_stage, status

class ReplicaEngineTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.workspace = Path(self.temp.name)
    def tearDown(self):
        self.temp.cleanup()
    def test_init_and_first_stage(self):
        root = init_project(self.workspace, "Demo App", "https://example.com")
        self.assertTrue((root / "project.json").is_file())
        prompt = prepare_stage(root)
        self.assertTrue(prompt.is_file())
        self.assertIn("clean-room", prompt.read_text(encoding="utf-8").lower())
        self.assertEqual(status(root)["current_stage"], "recon")
    def test_complete_advances_to_architect(self):
        root = init_project(self.workspace, "demo-app")
        result = self.workspace / "result.md"
        result.write_text("# Recon\nEstado: completo\n", encoding="utf-8")
        saved = complete_stage(root, "recon", result)
        self.assertTrue(saved.is_file())
        self.assertEqual(load_state(root)["current_stage"], "architect")
        self.assertIn("recon", status(root)["completed"])
    def test_all_stages_are_declared(self):
        self.assertEqual(len(STAGES), 11)
        self.assertEqual(len({s[0] for s in STAGES}), 11)
    def test_manifest_has_all_stages(self):
        root = init_project(self.workspace, "manifest-demo")
        path = export_manifest(root)
        self.assertEqual(len(json.loads(path.read_text())["stages"]), 11)
    def test_duplicate_project_and_unknown_stage_fail(self):
        root = init_project(self.workspace, "safe-demo")
        with self.assertRaises(FileExistsError):
            init_project(self.workspace, "safe-demo")
        with self.assertRaises(ValueError):
            prepare_stage(root, "unknown")

if __name__ == "__main__":
    unittest.main()
