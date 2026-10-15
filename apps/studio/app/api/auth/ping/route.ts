import { NextResponse, type NextRequest } from "next/server";
import { cookieSecurity, requestIsHttps } from "@centum/core";

export const dynamic = "force-dynamic";

const PING_COOKIE = "centum_ping";

/**
 * GET /api/auth/ping — connectivity + cookie round-trip check for the hosted
 * preview and for agent setups.
 *
 * First visit answers `"state": "set"` (and plants a short-lived cookie); any
 * later visit answers `"state": "echoed"` if the browser sent it back. If it
 * never reaches "echoed", the client is refusing cookies (usually a cross-site
 * iframe or a privacy extension) and the app must be opened in a normal tab.
 */
export async function GET(request: NextRequest) {
  const https = requestIsHttps(request.headers.get("x-forwarded-proto"));
  const existing = request.cookies.get(PING_COOKIE)?.value;

  const response = NextResponse.json({
    ok: true,
    state: existing ? "echoed" : "set",
    https,
    cookieSecurity: cookieSecurity(https),
    note: existing
      ? "Cookies work from this client — sign-in will stick."
      : "Reload this URL: if it still says 'set', this client is dropping cookies.",
  });

  if (!existing) {
    response.cookies.set(PING_COOKIE, crypto.randomUUID(), {
      path: "/",
      httpOnly: true,
      maxAge: 600,
      ...cookieSecurity(https),
    });
  }
  return response;
}
