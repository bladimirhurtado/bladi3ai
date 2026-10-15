import unittest
from unittest.mock import patch

from scripts.android_device_audit import audit_device

class AndroidDeviceAuditTests(unittest.TestCase):
    def test_rejects_invalid_package(self):
        self.assertEqual(audit_device("not a package")["error"], "invalid_package_id")

    def test_rejects_invalid_serial(self):
        self.assertEqual(audit_device("com.example.app", serial="bad serial")["error"], "invalid_serial")

    @patch("scripts.android_device_audit.shutil.which", return_value=None)
    def test_adb_missing(self, _):
        self.assertEqual(audit_device("com.example.app")["error"], "adb_not_found")

if __name__ == "__main__":
    unittest.main()
