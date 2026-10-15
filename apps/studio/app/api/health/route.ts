import { NextResponse } from "next/server";
import { env, pingDb, hasGoogleCredentials, hasMetaCredentials, hasR2Credentials, hasWhatsAppCredentials } from "@centum/core";

export const dynamic = "force-dynamic";

/** GET /api/health — used by Docker healthchecks, uptime monitors and the runbook. */
export async function GET() {
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
      phase: "1 / sprint 1",
      database: db ? (e.DATABASE_URL ? "postgres" : "pglite") : "unreachable",
      providerMode: e.PROVIDER_MODE,
      configured,
      time: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}
