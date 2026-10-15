import hashlib
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

from scripts.apk_static_inspect import inspect_apk, main


class ApkStaticInspectTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def make_apk(self, entries=None):
        path = self.root / "sample.apk"
        if entries is None:
            entries = [
                ("AndroidManifest.xml", b"synthetic manifest"),
                ("classes.dex", b"not a valid DEX"),
                ("lib/arm64-v8a/libsample.so", b"\x7fELF xx spoofInstallSource xx"),
                ("assets/data.save", b"files/ShooterGame/Saved/Config/Android/Game.ini"),
            ]
        with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for name, data in entries:
                archive.writestr(name, data)
        return path

    def test_hash_inventory_and_read_only_contract(self):
        path = self.make_apk()
        result = inspect_apk(path)
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["sha256"], hashlib.sha256(path.read_bytes()).hexdigest())
        self.assertEqual(result["archive_entries"], 4)
        self.assertFalse(result["execution_performed"])
        self.assertFalse(result["modified"])
        self.assertFalse(result["extracted_to_disk"])
        self.assertFalse((self.root / "assets").exists())

    def test_structured_indicators(self):
        result = inspect_apk(self.make_apk())
        ids = {x["id"] for x in result["evidence"]}
        self.assertIn("package_integrity_hook_indicators", ids)
        self.assertIn("unreal_engine_or_ark_resource_indicators", ids)

    def test_missing_file(self):
        self.assertEqual(inspect_apk(self.root / "missing.apk")["error"]["code"], "not_found")

    def test_size_limit(self):
        self.assertEqual(inspect_apk(self.make_apk(), max_bytes=2)["error"]["code"], "file_too_large")

    def test_invalid_limit(self):
        self.assertEqual(inspect_apk(self.make_apk(), max_bytes=0)["error"]["code"], "invalid_limit")

    def test_non_zip_is_rejected(self):
        path = self.root / "bad.apk"
        path.write_bytes(b"not an APK")
        self.assertEqual(inspect_apk(path)["error"]["code"], "not_zip_apk")

    def test_cli_writes_report_without_extracting(self):
        apk = self.make_apk()
        output = self.root / "report.json"
        self.assertEqual(main([str(apk), "--out", str(output)]), 0)
        report = json.loads(output.read_text(encoding="utf-8"))
        self.assertEqual(report["file"], apk.name)
        self.assertFalse((self.root / "assets").exists())


if __name__ == "__main__":
    unittest.main()
