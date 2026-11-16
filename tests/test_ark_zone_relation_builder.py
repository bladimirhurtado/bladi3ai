import importlib.util
import unittest
from pathlib import Path

MODULE = Path(__file__).resolve().parents[1] / "scripts" / "ark_zone_relation_builder.py"
spec = importlib.util.spec_from_file_location("ark_zone_relation_builder", MODULE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class ZoneRelationBuilderTests(unittest.TestCase):
    def test_redwood_aliases(self):
        self.assertIn("redwood", module.classify("DinoSpawnEntries_Redwoods"))

    def test_swamp_aliases(self):
        self.assertIn("swamp", module.classify("TheWrithingSwamps"))

    def test_unrelated_string(self):
        self.assertEqual(module.classify("PlayerCharacterStatusComponent"), [])

    def test_ascii_and_utf16_strings(self):
        data = b"xx RedwoodForest yy\x00" + "TheSouthernIslets".encode("utf-16-le")
        values = module.printable_strings(data)
        self.assertTrue(any("RedwoodForest" in x for x in values))
        self.assertTrue(any("TheSouthernIslets" in x for x in values))

if __name__ == "__main__":
    unittest.main()
