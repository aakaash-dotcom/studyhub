import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  authenticate,
  createSession,
  cookieSecurity,
  requestIsHttps,
  sessionCookieOptions,
} from "@centum/core";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login — a plain HTML form endpoint, deliberately NOT a Server
 * Action.
 *
 * Sign-in is the one flow that must work in every context: inside the cross-site
 * preview iframe, behind a proxy, with JavaScript blocked. Server Actions add a
 * second protocol (action ids, origin checks, RSC payloads) on top of HTTP, and
 * every one of those layers had to be debugged before anyone could log in. A
 * route handler is just HTTP: a form posts, a cookie comes back, a redirect
 * follows. That is also why this file is testable from the command line.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!email || !password) return redirectTo("/login?error=missing");

  const user = await authenticate(email, password);
  if (!user) return redirectTo("/login?error=credentials");

  const { token } = await createSession(user.id, request.headers.get("user-agent") ?? undefined);
  // https ⇒ SameSite=None so the cookie is sent back inside the preview iframe.
  const https = requestIsHttps(request.headers.get("x-forwarded-proto"));

  const response = redirectTo("/");
  response.cookies.set(SESSION_COOKIE, token, { ...sessionCookieOptions, ...cookieSecurity(https) });
  return response;

  /**
   * Relative Location on purpose. Proxies rewrite Host and x-forwarded-host, and
   * an absolute redirect built from the wrong one sends the browser to an
   * unreachable internal address. "/" is always correct: the browser resolves it
   * against the URL it actually used.
   */
  function redirectTo(path: string) {
    return new NextResponse(null, { status: 303, headers: { location: path } });
  }
}
