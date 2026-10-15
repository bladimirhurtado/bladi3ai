#!/usr/bin/env python3
"""Read-only Android device/app metadata audit through ADB.

No root, install, uninstall, settings changes, app-data access, screenshots,
messages, contacts, network capture, or file extraction is performed.
"""
from __future__ import annotations
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from typing import Sequence

PACKAGE_RE = re.compile(r"^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+$")
SERIAL_RE = re.compile(r"^[A-Za-z0-9._:-]+$")

def run_adb(adb: str, args: list[str], serial: str | None, timeout: int = 12) -> dict:
    cmd = [adb]
    if serial:
        cmd += ["-s", serial]
    cmd += args
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, check=False)
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": "timeout"}
    except OSError as exc:
        return {"ok": False, "error": type(exc).__name__}
    return {"ok": proc.returncode == 0, "stdout": proc.stdout.strip(),
            "stderr": proc.stderr.strip()[:500], "returncode": proc.returncode}

def audit_device(package: str, adb: str = "adb", serial: str | None = None) -> dict:
    if not PACKAGE_RE.fullmatch(package):
        return {"status":"error","error":"invalid_package_id","message":"Provide a package ID such as com.example.app."}
    if serial and not SERIAL_RE.fullmatch(serial):
        return {"status":"error","error":"invalid_serial","message":"Invalid ADB serial format."}
    adb_path = shutil.which(adb) if not ("/" in adb or "\\" in adb) else adb
    if not adb_path or ("/" in adb and not os.path.isfile(adb_path)):
        return {"status":"error","error":"adb_not_found","message":"ADB executable was not found on this computer."}
    devices = run_adb(adb_path, ["devices"], None)
    if not devices["ok"]:
        return {"status":"error","error":"adb_failed","detail":devices.get("stderr","")}
    connected = []
    for line in devices["stdout"].splitlines()[1:]:
        fields = line.split()
        if len(fields) >= 2 and fields[1] == "device":
            connected.append(fields[0])
    if serial:
        if serial not in connected:
            return {"status":"error","error":"device_not_authorized_or_missing","message":"Selected device is not connected and authorized for ADB."}
    elif len(connected) != 1:
        return {"status":"error","error":"select_device","message":"Connect and authorize exactly one device, or specify --serial.",
                "connected_device_count":len(connected)}
    selected = serial or connected[0]
    def shell(*args):
        return run_adb(adb_path, ["shell", *args], selected)
    model = shell("getprop", "ro.product.model")
    release = shell("getprop", "ro.build.version.release")
    sdk = shell("getprop", "ro.build.version.sdk")
    pkg = shell("dumpsys", "package", package)
    path = shell("pm", "path", package)
    if not pkg["ok"] or "Unable to find package" in pkg.get("stdout","") or not path.get("stdout",""):
        return {"status":"error","error":"package_not_found_or_inaccessible","package":package,
                "device_serial":selected,"detail":pkg.get("stderr","")[:300]}
    fields = {}
    wanted = ("versionName=", "versionCode=", "firstInstallTime=", "lastUpdateTime=",
              "installerPackageName=", "initiatingPackageName=", "originatingPackageName=",
              "signatures=", "SigningInfo", "userId=", "codePath=")
    for line in pkg["stdout"].splitlines():
        trimmed = line.strip()
        if any(term in trimmed for term in wanted):
            fields.setdefault(trimmed.split("=",1)[0].split()[0], [])
            key = trimmed.split("=",1)[0].split()[0]
            fields[key].append(trimmed[:300])
    return {
        "status":"ok","tool":"android_device_audit","version":"1.0",
        "analysis_utc":datetime.now(timezone.utc).isoformat(),
        "device":{"serial":selected,"model":model.get("stdout",""),
                  "android_release":release.get("stdout",""),"sdk":sdk.get("stdout","")},
        "target_package":package,"package_metadata":fields,
        "apk_paths":path["stdout"].splitlines(),
        "read_only":True,
        "device_modified":False,
        "private_app_data_read":False,
        "limitations":[
            "Requires the owner to enable USB debugging and approve this computer.",
            "Collects metadata for only the explicitly named package; does not read app-private data.",
            "ADB output depends on Android version and OEM; missing fields are not proof of tampering.",
            "This is a metadata audit, not a malware verdict or a complete handset security audit."
        ]
    }

def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", required=True, help="exact Android package ID to inspect")
    parser.add_argument("--adb", default="adb", help="ADB executable path")
    parser.add_argument("--serial", help="explicit ADB device serial if more than one device is connected")
    parser.add_argument("--out", help="optional JSON report output path on this computer")
    args = parser.parse_args(argv)
    result = audit_device(args.package, args.adb, args.serial)
    payload = json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True)
    if args.out and result.get("status") == "ok":
        try:
            from pathlib import Path
            Path(args.out).write_text(payload + "\n", encoding="utf-8")
        except OSError as exc:
            print("Could not write report: " + type(exc).__name__, file=sys.stderr)
            return 2
    print(payload)
    return 0 if result.get("status") == "ok" else 2

if __name__ == "__main__":
    raise SystemExit(main())
