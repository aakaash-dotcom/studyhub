import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  env,
  hasGoogleCredentials,
  hasMetaCredentials,
  hasR2Credentials,
  hasWhatsAppCredentials,
  pingDb,
} from "@centum/core";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — used by Docker healthchecks, uptime monitors and the runbook.
 * Also self-diagnosing: open it in the browser to see whether your session cookie
 * survived the trip to the server ("session": "present"). If login ever loops,
 * this tells you instantly whether the problem is the cookie or the password.
 */
export async function GET(request: NextRequest) {
  const db = await pingDb();
  const e = env();
  const configured = {
    meta: hasMetaCredentials(),
    google: hasGoogleCredentials(),
    r2: hasR2Credentials(),
    whatsapp: hasWhatsAppCredentials(),
  };
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const ok = db;

  return NextResponse.json(
    {
      ok,
      version: "0.1.0",
      phase: "1 / sprint 2",
      database: db ? (e.DATABASE_URL ? "postgres" : "pglite") : "unreachable",
      providerMode: e.PROVIDER_MODE,
      configured,
      session: hasSessionCookie ? "present" : "absent",
      time: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}
