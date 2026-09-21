"""Agent W ingest loop — A5 (vault) -> 2-page watermarked preview -> Website Preview -> catalogue.json.

Per the website split doc (AGENT SYNC/W_WEBSITE_SPLIT.md):
  1. Full A5 paper already lives in 'Question Papers/10th/<exam>/<year>'.
  2. Make a 2-page watermarked copy and upload it to 'Study Materials/Website Preview'
     (the only anyone-with-link folder).
  3. Append ONE row to src/data/catalogue.json with drive_file_id = the PREVIEW id.
  4. Commit + push (human reviews the diff first; this script never commits/pushes).

Usage (needs egress to script.google.com — blocked in some sandboxes):
    pip install requests pypdf reportlab
    python3 scripts/pyq_ingest/ingest.py --dry-run
    python3 scripts/pyq_ingest/ingest.py --only 10-social-science-english-quarterly-2026
    python3 scripts/pyq_ingest/ingest.py            # all gaps
    python3 scripts/pyq_ingest/ingest.py --append-only   # skip Drive, use pre-made preview ids

The script validates every row against the same contract as src/data/catalogue.ts
before writing, and re-writes the JSON byte-compatible with the existing file
(indent=2, ensure_ascii=False, trailing newline).
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent
CATALOGUE = REPO_ROOT / "src" / "data" / "catalogue.json"
GAPS = HERE / "gaps_2026-09-21.json"

# Mirror of catalogue.ts REQUIRED_FIELDS (do not drift).
REQUIRED_FIELDS = [
    "id", "class", "subject", "subject_ta", "medium", "exam", "year",
    "resource_type", "resource_type_ta", "title_en", "title_ta", "description_en",
    "pages", "size", "marks_pattern", "total_marks", "question_count", "duration",
    "price_tier", "price_inr", "preview_pages", "file_pdf", "tags", "status",
]
VALID_EXAMS = {"Quarterly", "Half-yearly", "Annual"}
VALID_TIERS = {"free", "premium", "paid"}


def fail(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def validate_row(row: dict) -> None:
    for f in REQUIRED_FIELDS:
        if f not in row:
            fail(f"row {row.get('id')!r} missing field {f!r}")
    if row["resource_type"] != "QuestionPaper":
        fail(f"{row['id']}: PYQ rows must have resource_type=QuestionPaper")
    if row["price_tier"] not in VALID_TIERS:
        fail(f"{row['id']}: bad price_tier {row['price_tier']}")
    if row["exam"] not in VALID_EXAMS:
        fail(f"{row['id']}: bad exam {row['exam']!r}")
    if not isinstance(row["year"], int):
        fail(f"{row['id']}: year must be a number")
    if row["status"] == "published" and not row.get("drive_file_id"):
        fail(f"{row['id']}: published row needs a non-empty drive_file_id")
    # Lane guard: new public rows must point at the 2-page preview, never the vault A5.
    if row["id"].startswith("10-") and row["status"] == "published":
        if row.get("drive_file_id") and "preview" not in str(row.get("_preview_file", "")).lower():
            print(f"NOTE: {row['id']} — confirm drive_file_id is the PREVIEW id, not the A5 vault id")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--gaps", default=str(GAPS))
    ap.add_argument("--only", help="row_id to process (repeatable)", action="append")
    ap.add_argument("--dry-run", action="store_true", help="print the plan, touch nothing")
    ap.add_argument("--append-only", action="store_true",
                    help="skip the Drive round-trip; requires --preview-ids file "
                         "mapping row_id -> preview drive id (e.g. previews made by another agent)")
    ap.add_argument("--preview-ids", help="JSON file: {row_id: preview_drive_id}")
    args = ap.parse_args()

    gaps = json.loads(Path(args.gaps).read_text(encoding="utf-8"))
    catalogue = json.loads(CATALOGUE.read_text(encoding="utf-8"))
    existing = {r["id"] for r in catalogue}

    todo = []
    for g in gaps["gaps"]:
        if args.only and g["row_id"] not in args.only:
            continue
        if g["row_id"] in existing:
            print(f"skip  {g['row_id']} (already in catalogue)")
            continue
        todo.append(g)

    print(f"\n{len(todo)} gap(s) to process\n")
    if args.dry_run:
        for g in todo:
            print(f"  {g['row_id']}")
            print(f"    src  : {g['source_folder']}/{g['source_file']}  (id {g['source_drive_id']})")
            print(f"    prev : {g['preview_file']} -> {gaps['preview_folder']}")
        return

    preview_ids: dict[str, str] = {}
    if args.append_only:
        if not args.preview_ids:
            fail("--append-only requires --preview-ids <json>")
        preview_ids = json.loads(Path(args.preview_ids).read_text(encoding="utf-8"))

    added = 0
    for g in todo:
        row = json.loads(json.dumps(g["row"]))  # deep copy
        rid = row["id"]

        if args.append_only:
            pid = preview_ids.get(rid)
            if not pid:
                fail(f"{rid}: no preview id in --preview-ids")
        else:
            from bridge_client import Bridge, PREVIEW_FOLDER
            from make_preview import make_preview

            b = Bridge()
            print(f"[{rid}] fetching A5 from Drive ({g['source_file']}) ...")
            a5 = b.get_file(g["source_folder"], g["source_file"])
            if len(a5) != g["source_bytes"]:
                print(f"  note: size {len(a5)} != recorded {g['source_bytes']} (file changed?)")
            print(f"[{rid}] making 2-page watermarked preview ...")
            preview = make_preview(a5)
            print(f"[{rid}] uploading {g['preview_file']} ({len(preview)} bytes) ...")
            entry = b.upload(PREVIEW_FOLDER, g["preview_file"], preview)
            pid = entry["id"]
            print(f"[{rid}] uploaded + verified in listing: {entry['link']}")

        row["drive_file_id"] = pid
        row["status"] = "published"
        row["_preview_file"] = g["preview_file"]  # transient, used by guard, stripped below
        validate_row(row)
        row.pop("_preview_file", None)
        catalogue.append(row)
        added += 1
        print(f"[{rid}] row appended (published, drive_file_id={pid})\n")

    if added:
        out = json.dumps(catalogue, indent=2, ensure_ascii=False) + "\n"
        CATALOGUE.write_text(out, encoding="utf-8")
        print(f"catalogue.json rewritten: {len(catalogue)} rows total")
        print("\nNext (human/AW): review `git diff src/data/catalogue.json`, then")
        print('  git add src/data/catalogue.json && git commit -m "catalogue: add <n> 10th PYQ previews" && git push')
    else:
        print("nothing to do")


if __name__ == "__main__":
    main()
