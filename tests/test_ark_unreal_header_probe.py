import importlib.util
import struct
import tempfile
import unittest
from pathlib import Path

MODULE = Path(__file__).resolve().parents[1] / "scripts" / "ark_unreal_header_probe.py"
spec = importlib.util.spec_from_file_location("ark_unreal_header_probe", MODULE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class UnrealHeaderProbeTests(unittest.TestCase):
    def test_reads_fixed_prefix_and_preserves_source(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "sample.uasset"
            prefix = struct.pack("<Iiiii", module.PACKAGE_TAG, -7, 0, 522, 3)
            path.write_bytes(prefix + b"synthetic-summary-payload")
            before = module.sha256(path)
            result = module.inspect_prefix(path)
            self.assertTrue(result["package_tag_valid"])
            self.assertEqual(result["legacy_file_version"], -7)
            self.assertEqual(result["file_version_ue4"], 522)
            self.assertEqual(result["licensee_version_ue4"], 3)
            self.assertEqual(module.sha256(path), before)

    def test_rejects_unknown_tag(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "bad.uasset"
            path.write_bytes(b"BAD!" + bytes(24))
            with self.assertRaisesRegex(ValueError, "Tag Unreal no reconocido"):
                module.inspect_prefix(path)

    def test_rejects_truncated_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "short.uasset"
            path.write_bytes(bytes(12))
            with self.assertRaisesRegex(ValueError, "demasiado pequeño"):
                module.inspect_prefix(path)


if __name__ == "__main__":
    unittest.main()
