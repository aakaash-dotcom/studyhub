import { Badge } from "@/components/ui/badge";
import { BrandForm } from "@/components/brand-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { eq } from "drizzle-orm";
import { env, getDb, hasGoogleCredentials, hasMetaCredentials, hasR2Credentials, hasWhatsAppCredentials, listBrands, tables } from "@centum/core";

export const dynamic = "force-dynamic";

async function demoDataInfo(): Promise<{ version: string; seededAt: string } | null> {
  try {
    const db = await getDb();
    const rows = await db.select().from(tables.settings).where(eq(tables.settings.key, "demo.data")).limit(1);
    const value = rows[0]?.value as { version?: string; seededAt?: string } | undefined;
    return value?.version ? { version: value.version, seededAt: value.seededAt ?? "" } : null;
  } catch {
    return null;
  }
}

/** True while `npm run demo:data` rows are in the database — the studio says so rather than pretending. */
async function demoData(): Promise<{ version: string; seededAt: string } | null> {
  return demoDataInfo();
}

export default async function SettingsPage() {
  const [brands, demo] = await Promise.all([listBrands(), demoData()]);
  const e = env();

  const checks: Array<{ label: string; ok: boolean; detail: string }> = [
    {
      label: "Meta app (Instagram)",
      ok: hasMetaCredentials(),
      detail: "META_APP_ID + META_APP_SECRET · add each page as an Instagram Tester, keep the app in Development Mode (no App Review needed).",
    },
    {
      label: "Google (YouTube)",
      ok: hasGoogleCredentials(),
      detail: "GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET · uploads stay private until the YouTube compliance audit passes.",
    },
    {
      label: "Cloudflare R2 (public media)",
      ok: hasR2Credentials(),
      detail: "R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY + R2_PUBLIC_BASE_URL · Meta and YouTube fetch media from here.",
    },
    {
      label: "WhatsApp CRM (notifications)",
      ok: hasWhatsAppCredentials(),
      detail: "WHATSAPP_CRM_BASE_URL + WHATSAPP_CRM_API_KEY · approvals and alerts. Never in the publishing path.",
    },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Brands, credentials and the studio's own configuration."
        action={
          demo ? (
            <Badge tone="info" className="h-7 px-3">
              Demo data loaded (v{demo.version}) — clear it with npm run db:reset
            </Badge>
          ) : undefined
        }
      />

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Setup status" subtitle="What is wired up and what is still missing." />
          <CardBody className="flex flex-col gap-3">
            {checks.map((check) => (
              <div key={check.label} className="flex items-start justify-between gap-3 border-b border-line/70 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-[13.5px] font-medium">{check.label}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{check.detail}</p>
                </div>
                <Badge tone={check.ok ? "success" : "warning"}>{check.ok ? "configured" : "missing"}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Publishing mode" subtitle="Mock publishers are safe: nothing leaves this machine." />
            <CardBody className="flex flex-col gap-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-muted">PROVIDER_MODE</span>
                <Badge tone={e.PROVIDER_MODE === "live" ? "success" : "info"}>{e.PROVIDER_MODE}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">App URL (OAuth redirects)</span>
                <span className="font-medium">{e.APP_URL}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Time zone</span>
                <span className="font-medium">Asia/Kolkata (IST)</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Platform rules this studio obeys" subtitle="Hard-coded guardrails, not preferences." />
            <CardBody className="flex flex-col gap-1.5 text-[12.5px] leading-relaxed text-muted">
              <p>· Official APIs only — no browser automation, ever.</p>
              <p>· Nothing publishes without approval unless a brand has autopublish on.</p>
              <p>· Instagram carousels capped at 10 items (API limit); images must be JPEG.</p>
              <p>· YouTube uploads stay private until the compliance audit passes.</p>
              <p>· Fresh Instagram quota is read live before every batch.</p>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="mb-5">
        <CardHeader title={`Brands (${brands.length})`} subtitle="Each page is a brand: tone, hashtag sets, pillar list and funnel link." />
        <CardBody>
          {brands.length ? (
            <div className="mb-5 grid gap-3 md:grid-cols-2">
              {brands.map((brand) => (
                <div key={brand.id} className="rounded-lg border border-line px-3.5 py-3">
                  <p className="text-[13.5px] font-semibold">{brand.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted">/{brand.slug}</p>
                  {brand.pillars.length ? <p className="mt-1.5 text-[12px] text-slate-600">{brand.pillars.join(" · ")}</p> : null}
                  {brand.hashtagSets?.default?.length ? (
                    <p className="mt-1 text-[11.5px] text-indigo-600">{brand.hashtagSets.default.join(" ")}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-5 text-[13px] text-muted">No brands yet — create the first one below.</p>
          )}
          <BrandForm />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Coming next" subtitle="Phase 1 sprint order (see BUILD_PLAN.md §D)." />
        <CardBody className="grid gap-2 text-[12.5px] text-muted md:grid-cols-2">
          <p>✅ S1 · Foundation, auth, schema, dashboard</p>
          <p>→ S2 · Real Instagram + YouTube OAuth, token refresh</p>
          <p>→ S3 · Media box (upload, Drive, ffmpeg, R2)</p>
          <p>→ S4/S5 · Instagram + YouTube publishers</p>
          <p>→ S6 · Scheduler, windows, retries</p>
          <p>→ S7 · Composer overrides, calendar drag, failures inbox</p>
          <p>→ S8 · WhatsApp approvals, digest, hardening</p>
          <p>→ Phase 2 · REST API, MCP server, Notion, Drive drops</p>
        </CardBody>
      </Card>
    </>
  );
}
