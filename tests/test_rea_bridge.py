import importlib.util
import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.error import HTTPError
from urllib.request import Request, urlopen

MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "rea_bridge.py"
SPEC = importlib.util.spec_from_file_location("rea_bridge", MODULE_PATH)
bridge = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(bridge)


class ReaBridgeTests(unittest.TestCase):
    def test_status_does_not_assume_missing_repo_files_exist(self):
        with TemporaryDirectory() as tmp:
            result = bridge.repo_status(Path(tmp))
        self.assertFalse(result["repo_ready"])
        self.assertFalse(any(result["required_files"].values()))
        self.assertTrue(result["connected"])

    def test_health_is_read_only_and_does_not_need_token(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), bridge.Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        url = f"http://127.0.0.1:{server.server_port}/health"
        req = Request(url, headers={"Origin": bridge.ALLOWED_ORIGIN})
        with urlopen(req, timeout=2) as response:
            body = json.loads(response.read())
            self.assertEqual(response.status, 200)
            self.assertTrue(body["ok"])

    def test_status_rejects_missing_token(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), bridge.Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        req = Request(
            f"http://127.0.0.1:{server.server_port}/status",
            headers={"Origin": bridge.ALLOWED_ORIGIN},
        )
        with self.assertRaises(HTTPError) as caught:
            urlopen(req, timeout=2)
        self.assertEqual(caught.exception.code, 401)
        caught.exception.close()

    def test_status_rejects_unapproved_origin(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), bridge.Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        req = Request(
            f"http://127.0.0.1:{server.server_port}/status",
            headers={"Origin": "https://example.com", "Authorization": "Bearer " + bridge.TOKEN},
        )
        with self.assertRaises(HTTPError) as caught:
            urlopen(req, timeout=2)
        self.assertEqual(caught.exception.code, 403)
        caught.exception.close()

    def test_status_accepts_token_from_approved_origin(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), bridge.Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        req = Request(
            f"http://127.0.0.1:{server.server_port}/status",
            headers={"Origin": bridge.ALLOWED_ORIGIN, "Authorization": "Bearer " + bridge.TOKEN},
        )
        with urlopen(req, timeout=2) as response:
            body = json.loads(response.read())
            self.assertEqual(response.status, 200)
            self.assertIn("required_files", body)
            self.assertIn("git", body)


if __name__ == "__main__":
    unittest.main()
