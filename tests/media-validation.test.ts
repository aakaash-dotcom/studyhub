import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAssetFor, specFor } from "@centum/providers";

test("Instagram Reels accept a 9:16 H.264 MP4", () => {
  const result = validateAssetFor("instagram", "REEL", {
    kind: "video",
    mimeType: "video/mp4",
    bytes: 40 * 1024 * 1024,
    width: 1080,
    height: 1920,
    durationS: 42,
  });
  assert.equal(result.ok, true, result.issues.join(" "));
});

test("Instagram rejects a PNG feed image (JPEG only)", () => {
  const result = validateAssetFor("instagram", "IMAGE", {
    kind: "image",
    mimeType: "image/png",
    bytes: 500 * 1024,
    width: 1080,
    height: 1350,
  });
  assert.equal(result.ok, false);
  assert.match(result.issues.join(" "), /JPEG/);
});

test("oversized Instagram images are caught before upload", () => {
  const result = validateAssetFor("instagram", "IMAGE", {
    kind: "image",
    mimeType: "image/jpeg",
    bytes: 9 * 1024 * 1024,
    width: 1080,
    height: 1350,
  });
  assert.equal(result.ok, false);
  assert.match(result.issues.join(" "), /limit is 8 MB/);
});

test("a landscape video warns about cropping for Reels", () => {
  const result = validateAssetFor("instagram", "REEL", {
    kind: "video",
    mimeType: "video/mp4",
    bytes: 10 * 1024 * 1024,
    width: 1920,
    height: 1080,
    durationS: 30,
  });
  assert.equal(result.ok, true, result.issues.join(" "));
  assert.match(result.warnings.join(" "), /cropped or padded/);
});

test("YouTube Shorts cap at 3 minutes", () => {
  const result = validateAssetFor("youtube", "SHORT", {
    kind: "video",
    mimeType: "video/mp4",
    bytes: 50 * 1024 * 1024,
    width: 1080,
    height: 1920,
    durationS: 240,
  });
  assert.equal(result.ok, false);
  assert.match(result.issues.join(" "), /maximum is 3.0 min/);
});

test("specs exist for every combination the UI offers", () => {
  assert.ok(specFor("instagram", "CAROUSEL"));
  assert.ok(specFor("instagram", "STORY"));
  assert.ok(specFor("youtube", "VIDEO"));
});
