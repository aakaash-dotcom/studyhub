import { test } from "node:test";
import assert from "node:assert/strict";
import { istDateTime, istInputValue, relative, truncate } from "../apps/studio/lib/format";

test("times render in IST regardless of the server timezone", () => {
  const utcNoon = new Date("2026-10-16T06:30:00.000Z"); // 12:00 IST
  assert.match(istDateTime(utcNoon), /12:00 pm/);
});

test("datetime-local values are IST, not UTC", () => {
  const value = istInputValue(new Date("2026-10-16T14:30:00.000Z")); // 20:00 IST
  assert.equal(value, "2026-10-16T20:00");
});

test("relative times read naturally", () => {
  assert.equal(relative(new Date(Date.now() + 90 * 60 * 1000)), "in 2 h");
  assert.equal(relative(null), "not scheduled");
});

test("truncate keeps captions tidy in tables", () => {
  assert.equal(truncate("abcdefghij", 5), "abcd…");
});
