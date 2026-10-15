import contextlib
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
import zipfile

from scripts.re_triage import DEFAULT_MAX_BYTES, inspect_file, main


class ReverseTriageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def write(self, name, data):
        path = self.root / name
        path.write_bytes(data)
        return path

    def make_zip(self, name, entries):
        path = self.root / name
        with zipfile.ZipFile(path, "w") as archive:
            for entry_name, payload in entries:
                archive.writestr(entry_name, payload)
        return path

    def test_regular_file_hash_and_size(self):
        path = self.write("sample.bin", b"hello world")
        result = inspect_file(path)
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["size_bytes"], 11)
        self.assertEqual(result["sha256"], "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9")
        self.assertEqual(result["format_guess"], "unknown")
        self.assertIn("preliminary", result["assessment"])

    def test_empty_file_is_supported(self):
        result = inspect_file(self.write("empty", b""))
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["size_bytes"], 0)
        self.assertEqual(result["sha256"], "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")

    def test_missing_file_returns_controlled_error(self):
        result = inspect_file(self.root / "missing")
        self.assertEqual(result["status"], "error")
        self.assertEqual(result["error"]["code"], "not_found")

    def test_directory_is_rejected(self):
        result = inspect_file(self.root)
        self.assertEqual(result["status"], "error")
        self.assertEqual(result["error"]["code"], "not_regular_file")

    def test_size_limit_is_enforced_before_hashing(self):
        path = self.write("large.bin", b"123456")
        result = inspect_file(path, max_bytes=5)
        self.assertEqual(result["status"], "error")
        self.assertEqual(result["error"]["code"], "file_too_large")

    def test_invalid_size_limit_is_rejected(self):
        result = inspect_file(self.write("x", b"x"), max_bytes=0)
        self.assertEqual(result["status"], "error")
        self.assertEqual(result["error"]["code"], "invalid_limit")

    def test_signature_beats_misleading_extension(self):
        path = self.write("not-a-pdf.pdf", b"\x89PNG\r\n\x1a\nrest")
        result = inspect_file(path)
        self.assertEqual(result["format_guess"], "PNG image")
        self.assertIn("extension_mismatch", result["notes"])

    def test_zip_metadata_is_reported_without_extraction(self):
        path = self.make_zip("sample.apk", [("AndroidManifest.xml", b"synthetic"), ("classes.dex", b"dex\n035\0")])
        result = inspect_file(path)
        self.assertEqual(result["format_guess"], "ZIP archive (APK-like)")
        self.assertEqual(result["archive"]["entry_count"], 2)
        self.assertIn("AndroidManifest.xml", result["archive"]["entry_names"])
        self.assertFalse((self.root / "AndroidManifest.xml").exists())

    def test_regular_zip_is_recognized(self):
        result = inspect_file(self.make_zip("bundle.zip", [("readme.txt", b"synthetic")]))
        self.assertEqual(result["format_guess"], "ZIP archive")
        self.assertEqual(result["archive"]["entry_count"], 1)

    def test_corrupt_zip_is_not_a_crash(self):
        result = inspect_file(self.write("bad.zip", b"PK\x03\x04not really a zip"))
        self.assertEqual(result["status"], "ok")
        self.assertIn("archive_inspection_failed", result["notes"])
        self.assertIsNone(result["archive"])

    def test_suspicious_paths_are_flagged(self):
        path = self.make_zip("paths.zip", [("../escape.txt", b"x"), ("/absolute.txt", b"x"), ("C:\\outside.txt", b"x")])
        result = inspect_file(path)
        flagged = {item["name"] for item in result["archive"]["suspicious_paths"]}
        self.assertEqual(flagged, {"../escape.txt", "/absolute.txt", "C:\\outside.txt"})

    def test_duplicate_archive_names_are_flagged(self):
        path = self.root / "dupes.zip"
        with zipfile.ZipFile(path, "w") as archive:
            archive.writestr("same.txt", b"one")
            archive.writestr("same.txt", b"two")
        result = inspect_file(path)
        self.assertIn("same.txt", result["archive"]["duplicate_names"])

    def test_cli_json_output_and_exit_code(self):
        path = self.write("sample.dat", b"abc")
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            code = main([str(path), "--json"])
        self.assertEqual(code, 0)
        payload = json.loads(output.getvalue())
        self.assertEqual(payload["status"], "ok")
        self.assertNotIn("contents", payload)

    def test_cli_works_from_another_working_directory(self):
        import subprocess
        import sys

        path = self.write("outside-cwd.bin", b"cli works")
        script = Path(__file__).resolve().parents[1] / "scripts" / "re_triage.py"
        completed = subprocess.run(
            [sys.executable, str(script), str(path), "--json"],
            cwd=self.root,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertEqual(json.loads(completed.stdout)["status"], "ok")

    def test_high_compression_ratio_is_flagged_as_signal(self):
        path = self.root / "ratio.zip"
        with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr("repeat.txt", b"A" * 200_000)
        result = inspect_file(path)
        self.assertTrue(result["archive"]["high_compression_ratio"])
        self.assertEqual(result["status"], "ok")

    def test_cli_error_has_nonzero_exit(self):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            code = main([str(self.root / "absent"), "--json"])
        self.assertEqual(code, 2)
        self.assertEqual(json.loads(output.getvalue())["error"]["code"], "not_found")

    def test_default_limit_is_reasonable(self):
        self.assertGreater(DEFAULT_MAX_BYTES, 0)
        self.assertLessEqual(DEFAULT_MAX_BYTES, 1024 * 1024 * 1024)


if __name__ == "__main__":
    unittest.main()
