#!/usr/bin/env python3
"""Read-only APK static inventory. No execution, extraction, patching or bypass."""
from __future__ import annotations
import argparse, hashlib, json, re, stat, sys, zipfile
from datetime import datetime, timezone
from pathlib import Path

MAX_APK = 75 * 1024 * 1024
MAX_ENTRIES = 5000
MAX_DEX = 16 * 1024 * 1024
MAX_NATIVE = 128 * 1024 * 1024
CHUNK = 65536
PRINTABLE = re.compile(rb"[ -~]{7,}")
CLASS_DESC = re.compile(r"^L[A-Za-z0-9_$/.-]+;$")
TERMS = ("spoofSigningInfo", "spoofInstallSource", "SignatureKiller",
         "KillerApplication", "nativeVerifyKey", "nativeIsValidated", "GetURL",
         "ANDROID_ID", "Game.ini", "GameUserSettings.ini", "ShooterGame", "UE4")

def fail(code, message, path=None):
    r = {"status":"error", "error":{"code":code,"message":message}}
    if path is not None: r["path"] = str(path)
    return r

def uleb(buf, off):
    value = shift = 0
    for _ in range(5):
        if off >= len(buf): raise ValueError("bad ULEB128 offset")
        b = buf[off]; off += 1; value |= (b & 127) << shift
        if b < 128: return value, off
        shift += 7
    raise ValueError("long ULEB128")

def dex_strings(buf):
    if len(buf) < 112 or not buf.startswith(b"dex\n") or buf[7:8] != b"\0":
        raise ValueError("invalid DEX header")
    declared = int.from_bytes(buf[32:36], "little")
    count = int.from_bytes(buf[56:60], "little")
    off = int.from_bytes(buf[60:64], "little")
    if declared < 112 or declared > len(buf) or count > 1000000 or off > len(buf) or count*4 > len(buf)-off:
        raise ValueError("invalid DEX string table bounds")
    out = []
    for i in range(count):
        p = int.from_bytes(buf[off+i*4:off+i*4+4], "little")
        if p >= len(buf): raise ValueError("invalid DEX string offset")
        _, p = uleb(buf, p); end = buf.find(b"\0", p)
        if end < 0: raise ValueError("unterminated DEX string")
        out.append(buf[p:end].decode("utf-8", "replace"))
    return out

def scan_strings(z, name, limit, max_results=40):
    found, seen, total, tail, truncated = [], set(), 0, b"", False
    with z.open(name) as f:
        while total < limit:
            chunk = f.read(min(CHUNK, limit-total))
            if not chunk: break
            total += len(chunk); data = tail + chunk
            for m in PRINTABLE.finditer(data):
                s = m.group().decode("ascii", "replace")
                if s not in seen and any(t.lower() in s.lower() for t in TERMS):
                    seen.add(s); found.append(s[:240])
                    if len(found) >= max_results:
                        truncated = True; break
            tail = data[-512:]
            if truncated: break
        if total >= limit and f.read(1): truncated = True
    return found, total, truncated

def inspect_apk(path, max_bytes=MAX_APK):
    p = Path(path).expanduser()
    if not isinstance(max_bytes, int) or isinstance(max_bytes, bool) or max_bytes <= 0:
        return fail("invalid_limit", "max_bytes must be positive.", p)
    try: info = p.stat()
    except FileNotFoundError: return fail("not_found", "File not found.", p)
    except OSError: return fail("unreadable", "Cannot read file metadata.", p)
    if not stat.S_ISREG(info.st_mode): return fail("not_regular_file", "Input must be a regular file.", p)
    if info.st_size > max_bytes: return fail("file_too_large", "APK exceeds size limit.", p)
    h = hashlib.sha256(); size = 0
    try:
        with p.open("rb") as f:
            while True:
                b = f.read(CHUNK)
                if not b: break
                size += len(b)
                if size > max_bytes: return fail("file_too_large", "APK grew beyond size limit.", p)
                h.update(b)
        if not zipfile.is_zipfile(p): return fail("not_zip_apk", "Not a readable ZIP/APK.", p)
        r = {"status":"ok","tool":"apk_static_inspect","version":"1.0",
             "analysis_utc":datetime.now(timezone.utc).isoformat(),"file":p.name,
             "size_bytes":size,"sha256":h.hexdigest(),"archive_entries":0,
             "execution_performed":False,"modified":False,"extracted_to_disk":False,
             "manifest":{"present":False,"decoded":False},"dex":[],"native_libraries":[],
             "asset_clues":[],"evidence":[],"assessment":"Static indicators only; not a malware verdict.",
             "limitations":["Binary AndroidManifest.xml is not decoded.","DEX strings are not decompilation.",
             "Native string scanning is bounded and can miss obfuscated content.","No install, execution, network, patch, resigning or bypass was performed."]}
        with zipfile.ZipFile(p) as z:
            infos = z.infolist(); r["archive_entries"] = len(infos)
            if len(infos) > MAX_ENTRIES:
                r["limitations"].append("Deep scan skipped: archive entry cap exceeded.")
                return r
            names = {i.filename for i in infos}
            r["manifest"]["present"] = "AndroidManifest.xml" in names
            dexes = sorted((i for i in infos if re.fullmatch(r"classes(?:[0-9]+)?\.dex", i.filename)), key=lambda i:i.filename)
            libs = sorted((i for i in infos if i.filename.endswith(".so")), key=lambda i:i.filename)
            assets = sorted((i for i in infos if i.filename.startswith("assets/")), key=lambda i:i.filename)
            r.update(dex_count=len(dexes), native_library_count=len(libs), asset_entry_count=len(assets))
            dex_budget = 64*1024*1024
            for i in dexes:
                row = {"name":i.filename,"size_bytes":i.file_size,"status":"partial","class_descriptors":[],"relevant_strings":[]}
                if i.file_size > MAX_DEX or i.file_size > dex_budget:
                    row["status"] = "skipped_size_limit"
                else:
                    try:
                        with z.open(i.filename) as f: data = f.read(MAX_DEX+1)
                        if len(data) > MAX_DEX: raise ValueError("DEX cap exceeded")
                        ss = dex_strings(data); dex_budget -= len(data)
                        row["status"]="ok"; row["strings_scanned"]=len(ss)
                        row["class_descriptors"]=sorted({s for s in ss if CLASS_DESC.fullmatch(s)})[:300]
                        row["relevant_strings"]=[s[:240] for s in ss if any(t.lower() in s.lower() for t in TERMS)][:120]
                    except (ValueError, OSError, RuntimeError, zipfile.BadZipFile) as e:
                        row["note"]="String-table scan incomplete: "+type(e).__name__
                r["dex"].append(row)
            native_budget = MAX_NATIVE
            for i in libs:
                row={"name":i.filename,"size_bytes":i.file_size,"relevant_strings":[],"truncated":False}
                if native_budget <= 0: row["status"]="skipped_total_limit"
                else:
                    cap=min(i.file_size,native_budget)
                    try: strings, scanned, truncated = scan_strings(z,i.filename,cap)
                    except (OSError, RuntimeError, zipfile.BadZipFile): strings,scanned,truncated=[],0,True
                    native_budget-=scanned
                    row.update(relevant_strings=strings,bytes_scanned=scanned,truncated=truncated or scanned<i.file_size,
                               status="partial" if truncated or scanned<i.file_size else "ok")
                r["native_libraries"].append(row)
            asset_budget=16*1024*1024
            for i in assets:
                if asset_budget<=0: break
                if not re.search(r"\.(save|dat|data|ini|txt|json|pak)$",i.filename,re.I): continue
                if i.file_size>8*1024*1024 or i.file_size>asset_budget:
                    r["asset_clues"].append({"name":i.filename,"status":"skipped_size_limit"}); continue
                try: strings,scanned,truncated=scan_strings(z,i.filename,min(i.file_size,asset_budget))
                except (OSError,RuntimeError,zipfile.BadZipFile): strings,scanned,truncated=[],0,True
                asset_budget-=scanned
                clues=[s for s in strings if any(t.lower() in s.lower() for t in ("ShooterGame","Game.ini","GameUserSettings.ini","UE4"))]
                if clues: r["asset_clues"].append({"name":i.filename,"strings":clues[:30],"truncated":truncated})
        all_strings=[s for d in r["dex"] for s in d["relevant_strings"]]
        all_strings += [s for lib in r["native_libraries"] for s in lib["relevant_strings"]]
        all_strings += [s for a in r["asset_clues"] for s in a.get("strings",[])]
        joined="\n".join(all_strings)
        indicators=[
          ("package_integrity_hook_indicators",("spoofSigningInfo","spoofInstallSource","SignatureKiller"),
           "Names related to package-signature/install-source interception were found.",
           "May indicate altered integrity/provenance checks; confirm implementation and call path."),
          ("native_validation_path_indicators",("nativeVerifyKey","nativeIsValidated","GetURL"),
           "Names related to native validation or URL retrieval were found.",
           "Suggests a validation/network path but does not reveal the endpoint or data sent."),
          ("unreal_engine_or_ark_resource_indicators",("ShooterGame","Game.ini","GameUserSettings.ini","UE4"),
           "Strings associated with Unreal Engine/ShooterGame configuration were found.",
           "Consistent with an Unreal-based game package, not proof of active runtime behavior.")]
        for ident, terms, obs, meaning in indicators:
            if any(t in joined for t in terms):
                r["evidence"].append({"id":ident,"observation":obs,"interpretation":meaning,"confidence":"moderate string-level indicator"})
        return r
    except (OSError, zipfile.BadZipFile, RuntimeError, ValueError) as e:
        return fail("archive_read_failed","Could not inspect container: "+type(e).__name__,p)

def main(argv: Sequence[str] | None=None):
    ap=argparse.ArgumentParser(description="Read-only bounded APK inventory; no execution, extraction, patching or bypass.")
    ap.add_argument("apk"); ap.add_argument("--max-bytes",type=int,default=MAX_APK)
    ap.add_argument("--out",help="optional JSON report path; only the report is written")
    a=ap.parse_args(argv); result=inspect_apk(a.apk,a.max_bytes)
    payload=json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True)
    if a.out and result.get("status")=="ok":
        try: Path(a.out).write_text(payload+"\n",encoding="utf-8")
        except OSError as e:
            print("Could not write report: "+type(e).__name__,file=sys.stderr); return 2
    print(payload); return 0 if result.get("status")=="ok" else 2

if __name__=="__main__": raise SystemExit(main())
