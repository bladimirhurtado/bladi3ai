import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "install-portable-skill.py"
VALID_SKILL = """---
name: reverse-engineering
description: Safe portable skill for authorized analysis.
---

# Reverse Engineering
Instructions.
"""


class PortableInstallerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.source = self.root / "source"
        self.source.mkdir()
        (self.source / "SKILL.md").write_text(VALID_SKILL, encoding="utf-8")
        (self.source / "README.md").write_text("# portable\n", encoding="utf-8")
        self.target = self.root / "project"
        self.target.mkdir()

    def run_cli(self, *args):
        return subprocess.run(
            [sys.executable, str(SCRIPT), str(self.target), "--source", str(self.source), *args],
            capture_output=True, text=True, check=False,
        )

    def test_installs_to_agents_convention(self):
        result = self.run_cli()
        destination = self.target / ".agents/skills/reverse-engineering"
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((destination / "SKILL.md").read_text(encoding="utf-8"), VALID_SKILL)
        self.assertTrue((destination / "README.md").is_file())

    def test_installs_to_claude_convention(self):
        result = self.run_cli("--agent", "claude")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue((self.target / ".claude/skills/reverse-engineering/SKILL.md").is_file())

    def test_conflict_is_safe_by_default(self):
        destination = self.target / ".agents/skills/reverse-engineering"
        destination.mkdir(parents=True)
        (destination / "keep.txt").write_text("keep", encoding="utf-8")
        result = self.run_cli()
        self.assertEqual(result.returncode, 3)
        self.assertEqual((destination / "keep.txt").read_text(encoding="utf-8"), "keep")

    def test_force_backs_up_existing_skill(self):
        destination = self.target / ".agents/skills/reverse-engineering"
        destination.mkdir(parents=True)
        (destination / "old.txt").write_text("preserve", encoding="utf-8")
        result = self.run_cli("--force")
        self.assertEqual(result.returncode, 0, result.stderr)
        backups = list(destination.parent.glob("reverse-engineering.backup-*"))
        self.assertEqual(len(backups), 1)
        self.assertEqual((backups[0] / "old.txt").read_text(encoding="utf-8"), "preserve")
        self.assertTrue((destination / "SKILL.md").is_file())

    def test_dry_run_does_not_write(self):
        result = self.run_cli("--dry-run")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("DRY RUN", result.stdout)
        self.assertFalse((self.target / ".agents").exists())

    def test_invalid_source_is_rejected(self):
        (self.source / "SKILL.md").write_text("not a skill", encoding="utf-8")
        result = self.run_cli()
        self.assertEqual(result.returncode, 2)
        self.assertFalse((self.target / ".agents").exists())


if __name__ == "__main__":
    unittest.main()
