import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

MODULE = Path(__file__).resolve().parents[1] / "scripts" / "ark_ecosystem_integrator.py"
spec = importlib.util.spec_from_file_location("ark_ecosystem_integrator", MODULE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class EcosystemIntegratorTests(unittest.TestCase):
    def test_integrates_reports_without_upgrading_evidence(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            map_path = root / "map.json"
            zone_path = root / "zones.json"
            map_path.write_text(json.dumps({
                "version": "0.1.0",
                "recursos_unicos": 23609,
                "candidatos": 126,
                "conteo_categorias": {"spawns": 40, "biomas": 12},
                "sha256_inventario": "abc",
            }), encoding="utf-8")
            zone_path.write_text(json.dumps({
                "version": "0.1.1",
                "sources": {"inventory": {"sha256": "def"}},
                "summary": {"inventory_path_candidates": 7},
                "zones": {
                    "redwood": {
                        "biomes_strings": ["TheRedwoodForests"],
                        "spawns_strings": ["DinoSpawnEntriesRedwoods"],
                        "inventory_paths": ["CoreBlueprints/Spawners/DinoSpawnEntriesRedwoods.uasset"],
                    }
                },
            }), encoding="utf-8")

            result = module.integrate(
                module.load_json(map_path, "map"),
                module.load_json(zone_path, "zones"),
                map_path, zone_path,
            )

            self.assertEqual(result["map_inventory"]["unique_resources"], 23609)
            self.assertEqual(result["zone_candidates"]["redwood"]["spawn_string_candidates"], 1)
            self.assertEqual(result["zone_candidates"]["redwood"]["evidence_level"], "candidate_only")
            self.assertFalse(result["cross_report_checks"]["interpretation"].startswith("Verified"))

    def test_rejects_non_object_json(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "bad.json"
            path.write_text("[]", encoding="utf-8")
            with self.assertRaises(ValueError):
                module.load_json(path, "bad")


if __name__ == "__main__":
    unittest.main()
