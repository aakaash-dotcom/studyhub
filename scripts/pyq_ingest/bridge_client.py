"""Drive bridge client for the Agent W catalogue lane.

Implements the VERIFIED payload contract from AGENT SYNC/BRIDGE_CONTRACT.md
(proven live 2026-09-20 by Agent B).

Two hard lessons baked in:
1. The bridge returns top-level {"success": true} EVEN when every file in a
   batch failed. Per-file results carry the truth — this client checks them.
2. Silent no-ops happen with wrong key names. Every mutating call here is
   followed by a re-list to verify the file actually exists.

Actions used by this lane: list, get_file, upload.
NEVER call move/delete/rename from this lane, and never send the secret to
anywhere except the bridge URL below (it is already in the team's sync docs).
"""
from __future__ import annotations

import base64
import json

import requests

URL = (
    "https://script.google.com/macros/"
    "s/AKfycbzHxBZNaYTfwBdSZ8uRGmo0xuMCWkVtnI7Ms1ynkmSPXP0XR5x8AwRrNoCCZAcJz6dg/exec"
)
SECRET = "ravis-agent-9T4kX2mP8qW7zR5vN3jH"

PREVIEW_FOLDER = "Study Materials/Website Preview"  # the ONLY folder that may be anyone-with-link


class BridgeError(RuntimeError):
    pass


class Bridge:
    def __init__(self, url: str = URL, secret: str = SECRET, timeout: int = 300):
        self.url = url
        self.secret = secret
        self.timeout = timeout
        self.session = requests.Session()

    # -- transport ---------------------------------------------------------
    def _call(self, payload: dict) -> dict:
        body = dict(payload)
        body["secret"] = self.secret
        r = self.session.post(
            self.url,
            data=json.dumps(body),
            headers={"Content-Type": "text/plain"},
            allow_redirects=False,
            timeout=self.timeout,
        )
        if r.status_code in (301, 302, 303, 307, 308):
            r = self.session.get(r.headers["Location"], timeout=self.timeout)
        try:
            return r.json()
        except ValueError:
            raise BridgeError(
                f"non-JSON response (HTTP {r.status_code}): {r.text[:200]!r}"
            )

    # -- read --------------------------------------------------------------
    def list(self, folder_path: str) -> list[dict]:
        """List direct files in a folder. Verified: single folders only (bulk tree calls time out)."""
        out = self._call({"action": "list", "folder_path": folder_path})
        if not out.get("success"):
            raise BridgeError(f"list failed for {folder_path!r}: {out}")
        return out.get("files", [])

    def get_file(self, folder_path: str, filename: str) -> bytes:
        out = self._call(
            {"action": "get_file", "folder_path": folder_path, "filename": filename}
        )
        if not out.get("file_base64"):
            raise BridgeError(f"get_file returned no data for {filename!r}: {out}")
        return base64.b64decode(out["file_base64"])

    # -- write -------------------------------------------------------------
    def upload(self, folder_path: str, filename: str, data: bytes,
               mime_type: str = "application/pdf") -> dict:
        """Upload and VERIFY. Returns the listing entry (with id + link)."""
        out = self._call({
            "action": "upload",
            "files": [{
                "filename": filename,
                "mime_type": mime_type,
                "file_base64": base64.b64encode(data).decode("ascii"),
                "folder_path": folder_path,
            }],
        })
        files = out.get("files") or []
        if not files or not files[0].get("id"):
            # The bridge lies about success — treat a missing per-file id as failure.
            raise BridgeError(
                "upload reported success but no per-file id (silent no-op): "
                + json.dumps(out)[:300]
            )
        new_id = files[0]["id"]
        found = [f for f in self.list(folder_path) if f.get("id") == new_id]
        if not found:
            raise BridgeError(
                f"upload reported id {new_id} but {folder_path!r} listing does not contain it"
            )
        return found[0]
