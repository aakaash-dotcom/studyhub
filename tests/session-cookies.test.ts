import { test } from "node:test";
import assert from "node:assert/strict";
import { cookieSecurity, requestIsHttps, sessionCookieOptionsFor } from "@centum/core";

/**
 * Regression guard for the sign-in loop.
 *
 * The hosted preview serves the studio inside a CROSS-SITE IFRAME. With the old
 * `SameSite=Lax` cookie the browser stored the session and then never sent it
 * back on iframe requests, so signing in bounced forever:
 *   POST /login 303 -> GET / -> no cookie -> 307 /login
 * Over https the cookie must be SameSite=None + Secure. Over plain http it must
 * stay Lax, because browsers reject `None` without `Secure`.
 */

test("https requests get a cross-site capable cookie (preview/iframe, VPS behind TLS)", () => {
  assert.deepEqual(cookieSecurity(true), { sameSite: "none", secure: true });
  const options = sessionCookieOptionsFor(true);
  assert.equal(options.sameSite, "none");
  assert.equal(options.secure, true);
  assert.equal(options.httpOnly, true);
  assert.equal(options.path, "/");
});

test("plain http keeps SameSite=Lax (localhost dev must still work)", () => {
  assert.deepEqual(cookieSecurity(false), { sameSite: "lax", secure: false });
  assert.equal(sessionCookieOptionsFor(false).sameSite, "lax");
});

test("https is read from the proxy header, first value wins", () => {
  assert.equal(requestIsHttps("https"), true);
  assert.equal(requestIsHttps("https, http"), true);
  assert.equal(requestIsHttps("http"), false);
  assert.equal(requestIsHttps(null, false), false);
  assert.equal(requestIsHttps(undefined, true), true); // production fallback
});
