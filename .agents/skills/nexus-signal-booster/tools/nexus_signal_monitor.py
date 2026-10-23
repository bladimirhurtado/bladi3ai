#!/usr/bin/env python3
"""Nexus Signal Booster: monitor HTTPS reachability from Android/Termux.

This is a diagnostic probe, not an LTE signal amplifier and not an ARK server test.
Uses only Python's standard library. Stop with Ctrl+C. Writes CSV to the current folder.
"""
import csv
import time
import urllib.request
import urllib.error
from datetime import datetime

TARGETS = {
    "cloudflare": "https://www.cloudflare.com/cdn-cgi/trace",
    "google_connectivity": "https://www.google.com/generate_204",
}
INTERVAL_SECONDS = 5
TIMEOUT_SECONDS = 3
LOG_FILE = "nexus_signal_log.csv"


def probe(url):
    start = time.monotonic()
    request = urllib.request.Request(
        url,
        method="GET",
        headers={"User-Agent": "NexusSignalBooster/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            # Read a tiny amount so the request is completed without downloading a page.
            response.read(64)
            elapsed_ms = round((time.monotonic() - start) * 1000)
            return "ok", response.status, elapsed_ms
    except urllib.error.HTTPError as exc:
        elapsed_ms = round((time.monotonic() - start) * 1000)
        # HTTP response proves reachability even when the server returns an error.
        return "http_response", exc.code, elapsed_ms
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        elapsed_ms = round((time.monotonic() - start) * 1000)
        reason = getattr(exc, "reason", exc).__class__.__name__
        return f"failed:{reason}", "", elapsed_ms


def main():
    print("NEXUS SIGNAL BOOSTER — monitor de conectividad")
    print("No mide la señal de radio ni la latencia del servidor de ARK.")
    print(f"Intervalo: {INTERVAL_SECONDS}s | timeout por destino: {TIMEOUT_SECONDS}s")
    print(f"Registro CSV: {LOG_FILE} | detener: Ctrl+C\n")

    with open(LOG_FILE, "a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        if file.tell() == 0:
            writer.writerow(["timestamp_local", "target", "result", "http_status", "elapsed_ms"])
        try:
            while True:
                stamp = datetime.now().astimezone().isoformat(timespec="seconds")
                for name, url in TARGETS.items():
                    result, status, elapsed = probe(url)
                    writer.writerow([stamp, name, result, status, elapsed])
                    file.flush()
                    label = f"HTTP {status}" if status != "" else result
                    print(f"{stamp} | {name}: {label} | {elapsed} ms")
                time.sleep(INTERVAL_SECONDS)
        except KeyboardInterrupt:
            print(f"\nMonitor detenido. Registro guardado en {LOG_FILE}.")


if __name__ == "__main__":
    main()
