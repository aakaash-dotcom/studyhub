import { NextResponse, type NextRequest } from "next/server";
import {
  env,
  hasGoogleCredentials,
  hasMetaCredentials,
  hasR2Credentials,
  hasWhatsAppCredentials,
  pingDb,
  requestIsHttps,
} from "@centum/core";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — used by Docker healthchecks, uptime monitors and the runbook.
 * Also self-diagnosing: it reports whether the request arrived over TLS and
 * whether publishing is live or mocked, so a screenshot of this one URL answers
 * most "is it set up right?" questions.
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
  const ok = db;

  return NextResponse.json(
    {
      ok,
      version: "0.1.0",
      phase: "1 / sprint 2",
      auth: "open (single-operator studio — no login page)",
      https: requestIsHttps(request.headers.get("x-forwarded-proto")),
      database: db ? (e.DATABASE_URL ? "postgres" : "pglite") : "unreachable",
      providerMode: e.PROVIDER_MODE,
      configured,
        time: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}
