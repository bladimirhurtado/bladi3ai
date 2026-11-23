import contextlib
import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

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

    def test_cli_includes_existing_inventory_paths(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            biomes = root / "Biomes.uexp"
            spawns = root / "DinoSpawns.uexp"
            inventory = root / "pakchunk1-Android_lista.txt"
            output = root / "out" / "redwood"
            biomes.write_bytes(b"TheRedwoodForests")
            spawns.write_bytes(b"DinoSpawnEntriesRedwoods")
            inventory.write_text(
                "CoreBlueprints/Spawners/DinoSpawnEntriesRedwoods.uasset\n"
                "CoreBlueprints/HarvestComponents/WoodHarvestComponent_RedWood.uasset\n"
                "CoreBlueprints/Spawners/DinoSpawnEntriesSwamp.uasset\n",
                encoding="utf-8",
            )
            inventory_before = module.sha256(inventory)
            argv = ["ark_zone_relation_builder.py", "--biomes", str(biomes),
                    "--spawns", str(spawns), "--inventory", str(inventory),
                    "--out", str(output)]
            stdout = io.StringIO()
            with patch("sys.argv", argv), contextlib.redirect_stdout(stdout):
                self.assertEqual(module.main(), 0)
            report = json.loads(output.with_suffix(".json").read_text(encoding="utf-8"))
            redwood_paths = report["zones"]["redwood"]["inventory_paths"]
            self.assertEqual(len(redwood_paths), 2)
            self.assertTrue(any("DinoSpawnEntriesRedwoods.uasset" in x for x in redwood_paths))
            self.assertEqual(report["summary"]["inventory_path_candidates"], 2)
            self.assertEqual(report["sources"]["inventory"]["sha256"], inventory_before)
            self.assertEqual(module.sha256(inventory), inventory_before)
            self.assertIn("inventory=2", stdout.getvalue())

    def test_cli_builds_graph_and_keeps_sources_unchanged(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            biomes = root / "Biomes.uexp"
            spawns = root / "DinoSpawns.uexp"
            output = root / "out" / "redwood_relaciones"
            biomes.write_bytes(b"TheRedwoodForests\x00SouthernJungle")
            spawns.write_bytes(b"DinoSpawnEntries_Redwoods\x00DinoSpawnEntriesSwamp")
            before = (module.sha256(biomes), module.sha256(spawns))
            argv = ["ark_zone_relation_builder.py", "--biomes", str(biomes),
                    "--spawns", str(spawns), "--out", str(output)]
            stdout = io.StringIO()
            with patch("sys.argv", argv), contextlib.redirect_stdout(stdout):
                self.assertEqual(module.main(), 0)
            report = json.loads(output.with_suffix(".json").read_text(encoding="utf-8"))
            self.assertIn("redwood", report["zones"])
            self.assertGreater(len(report["zones"]["redwood"]["spawns_strings"]), 0)
            self.assertEqual(report["summary"]["zones_with_candidates"], 3)
            self.assertEqual(before, (module.sha256(biomes), module.sha256(spawns)))
            self.assertTrue(output.with_suffix(".csv").is_file())
            self.assertIn("spawns=", stdout.getvalue())


if __name__ == "__main__":
    unittest.main()
