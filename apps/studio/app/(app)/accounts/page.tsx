import Link from "next/link";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  KeyRound,
  Link2,
  MonitorPlay,
  Plus,
  Settings2,
  Unplug,
} from "lucide-react";
import { dashboardAnalytics, env, hasGoogleCredentials, hasMetaCredentials, listBrands, listSafeAccounts, type Platform } from "@centum/core";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/chart";
import { deleteAccountAction, disconnectAccountAction } from "@/lib/actions";
import { DEFAULT_POSTING_WINDOWS } from "@centum/core";
import { relative } from "@/lib/format";

export const dynamic = "force-dynamic";

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook Page",
};

/**
 * Accounts is the screen that decides whether the rest of the studio works: no
 * connected account means nothing to publish to, and an expired token means a
 * failure at 8pm. So it leads with health (token, cap, next run) rather than a
 * bare list of handles.
 */
export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ note?: string; error?: string }>;
}) {
  const [{ note, error }, analytics, brands, allAccounts] = await Promise.all([
    searchParams,
    dashboardAnalytics(7),
    listBrands(),
    listSafeAccounts(),
  ]);
  // analytics already excludes disabled accounts; this is the "kept for history" list.
  const accounts = analytics.accounts;
  const disabled = allAccounts.filter((account) => account.status === "disabled");

  const metaReady = hasMetaCredentials();
  const googleReady = hasGoogleCredentials();
  const expiring = accounts.filter((account) => account.tokenDaysLeft !== null && account.tokenDaysLeft < 14);

  return (
    <>
      <PageHeader
        title="Accounts"
        description="Every Instagram page and YouTube channel this studio can publish to. Tokens are sealed with AES-256-GCM before they touch the database, and the 60-day Instagram token is refreshed well before it lapses."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/api/oauth/instagram/start" className={buttonClass("secondary", "md")}>
              <Camera className="h-4 w-4" /> Connect Instagram
            </Link>
            <Link href="/api/oauth/youtube/start" className={buttonClass("secondary", "md")}>
              <MonitorPlay className="h-4 w-4" /> Connect YouTube
            </Link>
          </div>
        }
      />

      {error ? (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[13px] text-rose-800">
          Could not connect: {error}
        </div>
      ) : null}
      {note ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] text-emerald-800">{note}</div>
      ) : null}

      {expiring.length ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            {expiring.length} {expiring.length === 1 ? "account needs" : "accounts need"} reconnecting soon
          </p>
          <p className="mt-1 text-[12.5px]">
            {expiring.map((account) => `${account.handle} (${account.tokenDaysLeft} days)`).join(", ")}. Instagram tokens last 60 days and are
            extended automatically; if an extension ever fails the account turns amber here rather than failing silently at publish time.
          </p>
        </div>
      ) : null}

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className={metaReady ? "border-emerald-200" : "border-amber-200"}>
          <CardBody className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-ink">Instagram (Meta app)</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {metaReady ? "App credentials present — connections are real." : "No META_APP_ID yet, so Connect creates a demo account."}
              </p>
            </div>
            <Badge tone={metaReady ? "success" : "warning"}>{metaReady ? "configured" : "missing keys"}</Badge>
          </CardBody>
        </Card>
        <Card className={googleReady ? "border-emerald-200" : "border-amber-200"}>
          <CardBody className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-ink">YouTube (Google OAuth)</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {googleReady ? "Client ID and secret present." : "No GOOGLE_CLIENT_ID yet — Connect creates a demo channel."}
              </p>
            </div>
            <Badge tone={googleReady ? "success" : "warning"}>{googleReady ? "configured" : "missing keys"}</Badge>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-ink">Publishing mode</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {env().PROVIDER_MODE === "live"
                  ? "Live — approved posts go to the real platforms."
                  : "Mock — approved posts are simulated end to end."}
              </p>
            </div>
            <Badge tone={env().PROVIDER_MODE === "live" ? "success" : "info"}>{env().PROVIDER_MODE}</Badge>
          </CardBody>
        </Card>
      </div>

      {accounts.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {accounts.map((account) => {
            const capUsed = account.dailyCap > 0 ? account.postedToday / account.dailyCap : 0;
            const brandName = brands.find((brand) => brand.name === account.brandName)?.name ?? account.brandName;
            return (
              <Card key={account.id}>
                <CardHeader
                  title={
                    <span className="inline-flex items-center gap-2">
                      {account.platform === "youtube" ? (
                        <MonitorPlay className="h-4 w-4 text-red-600" />
                      ) : (
                        <Camera className="h-4 w-4 text-pink-600" />
                      )}
                      {account.handle}
                    </span>
                  }
                  subtitle={`${PLATFORM_LABEL[account.platform]} · ${brandName}`}
                  action={
                    <Badge tone={account.status === "connected" ? "success" : account.status === "needs_reauth" ? "warning" : "neutral"}>
                      {account.status.replace(/_/g, " ")}
                    </Badge>
                  }
                />
                <CardBody className="flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Stat label="Queued" value={account.queuedCount} />
                    <Stat label="Posted today" value={account.postedToday} />
                    <Stat label="Daily cap" value={account.dailyCap} />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11.5px] text-muted">
                      <span>Today's usage</span>
                      <span>
                        {account.postedToday}/{account.dailyCap}
                      </span>
                    </div>
                    <ProgressBar
                      value={account.postedToday}
                      max={account.dailyCap}
                      tone={capUsed >= 1 ? "danger" : capUsed > 0.5 ? "warning" : "brand"}
                    />
                    <p className="mt-1 text-[11px] text-muted">
                      The cap exists to keep accounts looking human: five pages posting the same clip in the same minute is the fastest way to
                      get flagged.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {account.nextRunAt ? `next run ${relative(account.nextRunAt)}` : "nothing scheduled"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5" />
                      {account.tokenDaysLeft !== null ? `token valid ${account.tokenDaysLeft} more days` : "token expiry unknown"}
                    </span>
                  </div>

                  {account.lastError ? (
                    <p className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11.5px] text-rose-700">{account.lastError}</p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                    <Link href="/compose" className={buttonClass("secondary", "sm")}>
                      <Plus className="h-3.5 w-3.5" /> Post to this
                    </Link>
                    <Link href={`/queue?q=${encodeURIComponent(account.handle)}`} className={buttonClass("ghost", "sm")}>
                      <Settings2 className="h-3.5 w-3.5" /> Its queue
                    </Link>
                    <form action={disconnectAccountAction} className="ml-auto">
                      <input type="hidden" name="accountId" value={account.id} />
                      <button
                        type="submit"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        <Unplug className="h-3.5 w-3.5" /> Disconnect
                      </button>
                    </form>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Link2 className="h-4 w-4" />}
              title="No accounts connected"
              description="Connect the tuition centre's page, the Centum App page and the faceless pages. Without credentials the Connect buttons create demo accounts, so you can try the whole studio first."
            />
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/api/oauth/instagram/start" className={buttonClass("primary", "md")}>
                <Camera className="h-4 w-4" /> Connect Instagram
              </Link>
              <Link href="/api/oauth/youtube/start" className={buttonClass("secondary", "md")}>
                <MonitorPlay className="h-4 w-4" /> Connect YouTube
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      {disabled.length ? (
        <Card className="mt-5">
          <CardHeader
            title={`Disconnected (${disabled.length})`}
            subtitle="Kept so their published history still shows on the calendar and dashboard — nothing is scheduled for them any more."
          />
          <div className="divide-y divide-line">
            {disabled.map((account) => (
              <div key={account.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-2.5">
                  {account.platform === "youtube" ? (
                    <MonitorPlay className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Camera className="h-4 w-4 text-slate-400" />
                  )}
                  <div>
                    <p className="text-[12.5px] font-medium text-muted">{account.handle || account.displayName || "unnamed"}</p>
                    <p className="text-[11px] text-muted">
                      {PLATFORM_LABEL[account.platform]} · tokens deleted, no publishing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/api/oauth/${account.platform === "youtube" ? "youtube" : "instagram"}/start`} className={buttonClass("secondary", "sm")}>
                    Reconnect
                  </Link>
                  <form action={deleteAccountAction}>
                    <input type="hidden" name="accountId" value={account.id} />
                    <button
                      type="submit"
                      className="inline-flex h-8 items-center rounded-lg px-2.5 text-[12.5px] font-medium text-rose-600 transition-colors hover:bg-rose-50"
                      title="Delete this account and its history permanently"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="mt-5">
        <CardHeader
          title="How posting rules are applied"
          subtitle="Per account, so one page's habits never leak into another's."
        />
        <CardBody className="grid gap-3 text-[12.5px] text-muted sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p>
              <strong className="font-medium text-ink">Posting windows.</strong> Defaults are {DEFAULT_POSTING_WINDOWS.join(", ")} IST —
              when Tamil Nadu students are actually scrolling.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p>
              <strong className="font-medium text-ink">Jitter and spacing.</strong> Scheduled times get a few minutes of variation so posts
              never land at identical minutes.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p>
              <strong className="font-medium text-ink">Per-account caps.</strong> Counted per IST day, read from the live publishing limit where
              the platform exposes one.
            </p>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-slate-50/60 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[16px] font-semibold text-ink">{value}</p>
    </div>
  );
}
