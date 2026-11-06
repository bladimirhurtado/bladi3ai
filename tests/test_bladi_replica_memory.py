import tempfile
import unittest
from bladi_replica_engine.memory import append_memory, read_memory

class MemoryTests(unittest.TestCase):
    def test_append_and_read_local_memory(self):
        with tempfile.TemporaryDirectory() as tmp:
            append_memory(tmp, "user", "analizar pantalla")
            append_memory(tmp, "assistant", "hallazgo", "ollama")
            items = read_memory(tmp)
            self.assertEqual(len(items), 2)
            self.assertEqual(items[-1]["provider"], "ollama")
    def test_reject_invalid_role_and_empty_content(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                append_memory(tmp, "root", "texto")
            with self.assertRaises(ValueError):
                append_memory(tmp, "note", " ")

if __name__ == "__main__":
    unittest.main()
