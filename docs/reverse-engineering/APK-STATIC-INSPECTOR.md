# APK Static Inspector

This read-only Python utility complements the browser-based Analizador Pro Móvil. The browser skill is convenient for quick local checks; this tool adds bounded APK/ZIP inventory, DEX string-table inspection, streamed native-library strings, and Unreal/ShooterGame configuration clues.

## Usage

    python scripts/apk_static_inspect.py ./FreeARK4Fun.apk --out ./FreeARK4Fun_static.json
    python scripts/apk_static_inspect.py ./sample.apk --max-bytes 78643200

## Limits and safety

- Does not install, execute, patch, resign, connect to servers, bypass a key/license gate, or extract archive entries to disk.
- Default APK limit: 75 MiB; archive-entry limit: 5,000.
- DEX scan: at most 16 MiB per entry and 64 MiB total; reads the string table only.
- Native libraries: streamed, bounded to 128 MiB total; scans printable strings.
- Selected asset files: at most 8 MiB per entry and 16 MiB total.
- AndroidManifest.xml is not decoded; permission-like strings are not confirmed manifest permissions.
- String indicators are hypotheses to validate, not malware verdicts or proof of runtime behavior.
- Automated tests use synthetic fixtures, never execute APK samples.

## Existing FreeARK4Fun case

The sample's SHA-256 is `11e73046f39a60c1d4b66c29c74f4817a24692b276e0c165ba4d39f81131aa6b`. Previous inventory recorded 233 archive entries, 69 DEX files, four native libraries and 18 asset entries. These values identify the analyzed sample; they are not a safety verdict.

The tool does not recover access keys or recreate validation/signature-spoofing mechanisms. It supports independent analysis utilities and evidence-based understanding of the package.
