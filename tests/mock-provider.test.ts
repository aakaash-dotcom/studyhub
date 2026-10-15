import { test } from "node:test";
import assert from "node:assert/strict";
import { createMockAdapter } from "@centum/providers";

const baseInput = {
  platform: "instagram" as const,
  mediaType: "REEL" as const,
  accessToken: "demo",
  account: { id: "a1", platformAccountId: "ig_1", handle: "@demo", authPath: "instagram_login" },
  caption: "இன்றைய கணக்கம்",
  hashtags: ["#centumapp"],
  assets: [
    {
      id: "asset1",
      kind: "video" as const,
      publicUrl: "https://media.example.com/reel.mp4",
      mimeType: "video/mp4",
      width: 1080,
      height: 1920,
      durationS: 30,
      bytes: 20 * 1024 * 1024,
    },
  ],
  options: {},
};

test("mock adapter publishes a valid reel and returns an id + url", async () => {
  const adapter = createMockAdapter("instagram");
  const result = await adapter.publish(baseInput);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.match(result.remoteId, /^instagram_mock_/);
    assert.ok(result.remoteUrl?.startsWith("https://"));
  }
});

test("mock adapter refuses a reel with no media", async () => {
  const adapter = createMockAdapter("instagram");
  const result = await adapter.publish({ ...baseInput, assets: [] });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.code, "media_rejected");
    assert.equal(result.retryable, false);
    assert.ok(result.action.length > 0, "failures must tell the human what to do");
  }
});

test("mock adapter reports quota like the live one will", async () => {
  const adapter = createMockAdapter("instagram");
  const quota = await adapter.quota!(baseInput.account, "demo");
  assert.deepEqual(quota, { used: 3, total: 25 });
});
