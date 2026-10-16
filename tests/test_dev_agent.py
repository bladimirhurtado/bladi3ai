"""Tests for the standard-library development agent CLI."""
import json
import tempfile
import unittest
from pathlib import Path

from scripts import dev_agent


class SafePathTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / "workspace"
        self.root.mkdir()
        (self.root / "inside.txt").write_text("safe", encoding="utf-8")

    def tearDown(self):
        self.temp.cleanup()

    def test_accepts_path_inside_base(self):
        result = dev_agent.safe_relative_path(self.root, "new/child.txt")
        self.assertEqual(result, self.root.resolve() / "new" / "child.txt")

    def test_rejects_parent_traversal(self):
        with self.assertRaises(dev_agent.AgentError):
            dev_agent.safe_relative_path(self.root, "../outside.txt")

    def test_rejects_sibling_with_shared_prefix(self):
        sibling = self.root.parent / (self.root.name + "-backup")
        with self.assertRaises(dev_agent.AgentError):
            dev_agent.safe_relative_path(self.root, str(sibling / "secret.txt"))

    def test_rejects_symlink_escape_when_supported(self):
        outside = Path(self.temp.name) / "outside"
        outside.mkdir()
        try:
            (self.root / "escape").symlink_to(outside, target_is_directory=True)
        except (OSError, NotImplementedError):
            self.skipTest("Symlinks are not available in this environment")
        with self.assertRaises(dev_agent.AgentError):
            dev_agent.safe_relative_path(self.root, "escape/secret.txt")


class RepositoryInspectionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / "repo"
        self.root.mkdir()
        (self.root / "README.md").write_text("# Example\n", encoding="utf-8")
        tests = self.root / "tests"
        tests.mkdir()
        (tests / "test_sample.py").write_text("def test_ok():\n    assert True\n", encoding="utf-8")
        (self.root / "src.py").write_text("print('not executed')\n", encoding="utf-8")

    def tearDown(self):
        self.temp.cleanup()

    def test_inspect_finds_manifest_free_project_and_tests(self):
        result = dev_agent.inspect_repository(str(self.root))
        self.assertEqual(result["operation"], "inspect")
        self.assertIn("README.md", result["top_level_entries"])
        self.assertTrue(result["test_locations"])
        self.assertFalse(result["executed_project_code"])

    def test_review_redacts_secret_values_and_detects_conflicts(self):
        fixture = self.root / "src.py"
        fixture.write_text(
            "token = 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456'\n"
            "<<<<<<< HEAD\n"
            "safe = True\n"
            ">>>>>>> branch\n",
            encoding="utf-8",
        )
        result = dev_agent.review_repository(str(self.root))
        kinds = {item["kind"] for item in result["findings"]}
        self.assertIn("possible-secret", kinds)
        self.assertIn("merge-conflict-marker", kinds)
        serialized = json.dumps(result)
        self.assertNotIn("ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456", serialized)
        self.assertFalse(result["executed_project_code"])

    def test_review_does_not_report_env_example_as_secret(self):
        (self.root / ".env.example").write_text(
            "API_KEY='example-placeholder-value'\n", encoding="utf-8"
        )
        result = dev_agent.review_repository(str(self.root))
        self.assertFalse(any(item.get("path") == ".env.example" for item in result["findings"]))

    def test_plan_does_not_write_files(self):
        before = sorted(p.relative_to(self.root).as_posix() for p in self.root.rglob("*"))
        result = dev_agent.make_refactor_plan(str(self.root))
        after = sorted(p.relative_to(self.root).as_posix() for p in self.root.rglob("*"))
        self.assertEqual(before, after)
        self.assertFalse(result["writes_performed"])
        self.assertTrue(result["steps"])


class CloneSafetyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.repo = self.root / "source"
        self.repo.mkdir()
        (self.repo / ".git").mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def test_rejects_remote_url_with_embedded_credentials(self):
        with self.assertRaises(dev_agent.AgentError):
            dev_agent.validate_clone_source("https://user:secret@example.com/org/repo.git")

    def test_rejects_unsupported_scheme(self):
        with self.assertRaises(dev_agent.AgentError):
            dev_agent.validate_clone_source("file:///tmp/repo.git")

    def test_existing_destination_is_never_overwritten(self):
        destination = self.root / "existing"
        destination.mkdir()
        sentinel = destination / "keep.txt"
        sentinel.write_text("keep", encoding="utf-8")
        with self.assertRaises(dev_agent.AgentError):
            dev_agent.clone_repository(str(self.repo), str(destination))
        self.assertEqual(sentinel.read_text(encoding="utf-8"), "keep")


class CliTests(unittest.TestCase):
    def test_help_parses_without_project_execution(self):
        parser = dev_agent.build_parser()
        args = parser.parse_args(["inspect", "."])
        self.assertEqual(args.command, "inspect")
        self.assertFalse(args.json)


if __name__ == "__main__":
    unittest.main()
