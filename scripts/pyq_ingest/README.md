# PYQ ingest (Agent W lane)

Keeps `src/data/catalogue.json` true. Nothing here is imported by the app —
Vite only bundles `src/`, so this folder is build-invisible.

## Files
- `gaps_2026-09-21.json` — verified 10th English-medium A5 PYQ gaps (source folder/file/drive id
  + the exact catalogue row each becomes). Verified 2026-09-21 against single-folder bridge listings.
- `bridge_client.py` — Drive bridge wrapper with the verified payload contract
  (per-file truth checks + re-list verification; the bridge returns `success:true` on silent no-ops).
- `make_preview.py` — full A5 PDF → 2-page watermarked preview (pypdf + reportlab).
- `ingest.py` — the loop: get_file → make_preview → upload to
  `Study Materials/Website Preview` → append row → rewrite JSON (byte-compatible formatting).

## Run (from repo root, needs egress to script.google.com)
```
pip install requests pypdf reportlab
python3 scripts/pyq_ingest/ingest.py --dry-run
python3 scripts/pyq_ingest/ingest.py --only 10-social-science-english-quarterly-2026
python3 scripts/pyq_ingest/ingest.py
# or, if previews were already made elsewhere (e.g. another agent with egress):
python3 scripts/pyq_ingest/ingest.py --append-only --preview-ids previews.json
```
The script never commits or pushes. Review the diff, then commit
`catalogue: add <n> 10th PYQ previews` and push.

## Rules baked in
- New rows: `resource_type=QuestionPaper`, `price_tier=free`, non-empty
  `drive_file_id` of the **2-page preview** (anyone-with-link) — never the A5 vault id.
- No 2UP/Booklet, no 10th Biology/Chemistry/Physics (Science only), no fake Tamil-English rows.
- Pro/Topper files (ImpQ/models/keys) are NOT ₹49 singles — they belong to the Topper Pack;
  do not add premium singles here.
- `pending_medium_verification` files (Unknown-medium 2022/2025/2026 Annuals) must be opened by a
  human before any of them gets a row.
