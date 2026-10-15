import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Camera,
  CircleCheck,
  Clock,
  Flame,
  Images,
  ListChecks,
  MonitorPlay,
  Plus,
  Sparkles,
  TrendingUp,
  Upload,
} from "lucide-react";
import {
  DEFAULT_POSTING_WINDOWS,
  dashboardAnalytics,
  env,
  hasMetaCredentials,
  hasGoogleCredentials,
  hasR2Credentials,
  listSafeAccounts,
  reviewQueue,
  type Platform,
  type TargetState,
} from "@centum/core";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart, DonutRing, ProgressBar, Sparkline } from "@/components/ui/chart";
import { approvePostAction } from "@/lib/actions";
import { istTime, relative, truncate } from "@/lib/format";

export const dynamic = "force-dynamic";

const PLATFORM_META: Record<Platform, { label: string; icon: typeof Camera; className: string; dot: string }> = {
  instagram: { label: "Instagram", icon: Camera, className: "text-pink-600", dot: "fill-pink-500 stroke-pink-500" },
  youtube: { label: "YouTube", icon: MonitorPlay, className: "text-red-600", dot: "fill-red-500 stroke-red-500" },
  facebook: { label: "Facebook", icon: CircleCheck, className: "text-blue-600", dot: "fill-blue-500 stroke-blue-500" },
};

const TARGET_LABELS: Record<TargetState, string> = {
  draft: "Draft",
  needs_review: "Needs review",
  approved: "Approved",
  queued: "Queued",
  publishing: "Publishing",
  posted: "Published",
  failed: "Failed",
  skipped: "Skipped",
};

export default async function DashboardPage() {
  const [analytics, toReview, accounts] = await Promise.all([dashboardAnalytics(14), reviewQueue(5), listSafeAccounts()]);

  const { kpis, activity, pipeline, platformMix, brands, activityFeed, upcoming, topPosts, todayPlan, accounts: accountCards } = analytics;
  const delta = kpis.publishedLast7 - kpis.publishedPrev7;
  const publishedSeries = activity.map((day) => day.published);
  const setup = [
    { done: hasMetaCredentials(), label: "Meta app credentials", href: "/settings", hint: "Instagram Login — no App Review needed" },
    { done: hasGoogleCredentials(), label: "Google credentials", href: "/settings", hint: "YouTube upload + Drive read" },
    { done: hasR2Credentials(), label: "Cloudflare R2 storage", href: "/settings", hint: "Public media URLs for Meta & YouTube" },
    { done: accounts.length > 0, label: "First account connected", href: "/accounts", hint: "Mock accounts work today" },
  ];
  const setupDone = setup.filter((item) => item.done).length;
  const nextUp = upcoming[0];
  const nothingYet = kpis.publishedLast7 === 0 && kpis.scheduledNext7 === 0 && toReview.length === 0;

  return (
    <div className="flex flex-col gap-5">
      {/* ── header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}
          </p>
          <h1 className="mt-0.5 text-[26px] font-semibold tracking-[-0.02em] text-ink">
            {greeting()}, Ravi
          </h1>
          <p className="mt-1 text-[13.5px] text-muted">
            {nextUp
              ? `Next post goes out ${relative(nextUp.scheduledAt)} — ${nextUp.title} to ${PLATFORM_META[nextUp.platform].label}.`
              : "Nothing scheduled yet. The calendar is yours to fill."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/compose" className={buttonClass("primary", "md")}>
            <Plus className="h-4 w-4" /> New post
          </Link>
          <Link href="/media" className={buttonClass("secondary", "md")}>
            <Upload className="h-4 w-4" /> Upload media
          </Link>
          <Link href="/calendar" className={buttonClass("secondary", "md")}>
            <CalendarClock className="h-4 w-4" /> Calendar
          </Link>
        </div>
      </div>

      {/* ── what needs you now ─────────────────────────────────────────── */}
      {kpis.needsReview > 0 || kpis.failed > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {kpis.needsReview > 0 ? (
            <Card className="border-amber-200 bg-amber-50/60">
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-semibold text-amber-900">
                      {kpis.needsReview} {kpis.needsReview === 1 ? "post needs" : "posts need"} your review
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-amber-800/80">Nothing publishes until you approve it.</p>
                  </div>
                </div>
                <Link href="/queue" className={buttonClass("secondary", "sm")}>
                  Review now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardBody>
            </Card>
          ) : null}

          {kpis.failed > 0 ? (
            <Card className="border-rose-200 bg-rose-50/60">
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-100 text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-semibold text-rose-900">
                      {kpis.failed} {kpis.failed === 1 ? "target failed" : "targets failed"} to publish
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-rose-800/80">Each failure comes with the platform's own words and a fix.</p>
                  </div>
                </div>
                <Link href="/queue" className={buttonClass("secondary", "sm")}>
                  See failures <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardBody>
            </Card>
          ) : null}
        </div>
      ) : null}

      {/* ── KPIs ───────────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Going out next 7 days"
          value={kpis.scheduledNext7}
          href="/calendar"
          hint={kpis.scheduledNext7 ? "Across every connected account" : "Nothing queued — schedule something"}
          icon={<CalendarClock className="h-4 w-4" />}
        />
        <KpiCard
          label="Published last 7 days"
          value={kpis.publishedLast7}
          href="/queue"
          trend={delta}
          chart={publishedSeries.some((value) => value > 0) ? <Sparkline values={publishedSeries} /> : undefined}
          hint={delta === 0 ? "Same as the week before" : `${delta > 0 ? "+" : ""}${delta} vs the week before`}
          icon={<CircleCheck className="h-4 w-4" />}
        />
        <KpiCard
          label="Reach last 7 days"
          value={kpis.reachLast7.toLocaleString("en-IN")}
          hint={`${kpis.engagementLast7.toLocaleString("en-IN")} likes, comments & saves`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          label="Media in the box"
          value={kpis.assetCount}
          href="/media"
          hint={kpis.assetCount ? "Ready-to-publish assets" : "Upload a video or image to start"}
          icon={<Images className="h-4 w-4" />}
          tone={kpis.assetCount === 0 ? "warning" : "default"}
        />
      </div>

      {/* ── first-run guidance, only while it is actually empty ────────── */}
      {nothingYet ? (
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-ink">Start with one post</p>
                <p className="mt-0.5 max-w-xl text-[12.5px] leading-relaxed text-muted">
                  Write a caption, pick the accounts, choose a time — the studio publishes it through the official APIs and reports back.
                  With <strong className="font-medium text-ink">mock publishers</strong> on, the whole path works before any credential exists:
                  connect a demo account, compose, approve, and watch the queue move.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link href="/accounts" className={buttonClass("secondary", "md")}>
                Connect an account
              </Link>
              <Link href="/compose" className={buttonClass("primary", "md")}>
                <Plus className="h-4 w-4" /> Compose
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* ── main grid ──────────────────────────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader
              title="Publishing activity"
              subtitle="Last 14 days — what was planned against what actually went out."
              action={
                <div className="hidden gap-1.5 sm:flex">
                  <Badge tone="brand">Scheduled</Badge>
                  <Badge tone="success">Published</Badge>
                </div>
              }
            />
            <CardBody>
              <BarChart
                data={activity.map((day) => ({ label: day.label, values: [day.scheduled, day.published] }))}
                series={[
                  { name: "Scheduled", className: "bg-indigo-300" },
                  { name: "Published", className: "bg-emerald-500" },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Needs your decision"
              subtitle={toReview.length ? "Approve to queue it for every selected account." : "Nothing waiting on you."}
              action={
                <Link href="/queue" className="text-[12.5px] font-medium text-brand hover:underline">
                  Open queue
                </Link>
              }
            />
            {toReview.length ? (
              <div className="divide-y divide-line">
                {toReview.map((post) => (
                  <div key={post.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/queue?post=${post.id}`} className="text-[13.5px] font-medium text-ink hover:text-brand">
                          {truncate(post.title, 62)}
                        </Link>
                        <Badge tone="neutral">{post.brandName}</Badge>
                        {post.pillar ? <Badge tone="brand">{post.pillar}</Badge> : null}
                      </div>
                      <p className="mt-1 line-clamp-1 text-[12.5px] text-muted">{truncate(post.caption, 120)}</p>
                      <p className="mt-1 text-[12px] text-muted">
                        {post.targetCount} {post.targetCount === 1 ? "account" : "accounts"} · {relative(post.scheduledAt)}
                      </p>
                    </div>
                    <form action={approvePostAction} className="shrink-0">
                      <input type="hidden" name="postId" value={post.id} />
                      <Button variant="primary" size="sm" type="submit">
                        <CircleCheck className="h-3.5 w-3.5" /> Approve
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <CardBody>
                <EmptyState
                  icon={<CircleCheck className="h-4 w-4" />}
                  title="All clear"
                  description="Nothing is waiting for approval. Compose a post and it will land here for a one-click review."
                />
              </CardBody>
            )}
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader title="Today's plan" subtitle="Everything going out today, in IST." />
              {todayPlan.length ? (
                <div className="divide-y divide-line">
                  {todayPlan.map((item, index) => (
                    <TimelineRow key={`${item.postId}-${index}`} item={item} />
                  ))}
                </div>
              ) : (
                <CardBody>
                  <p className="text-[13px] text-muted">Nothing scheduled today.</p>
                  <Link href="/compose" className="mt-2 inline-flex text-[12.5px] font-medium text-brand hover:underline">
                    Fill a slot <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </CardBody>
              )}
            </Card>

            <Card>
              <CardHeader title="Best performing" subtitle="Last 30 days, by reach." />
              {topPosts.length ? (
                <div className="divide-y divide-line">
                  {topPosts.map((post) => (
                    <div key={`${post.postId}-${post.platform}`} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <PlatformDot platform={post.platform} />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-medium text-ink">{truncate(post.title, 40)}</p>
                          <p className="text-[11.5px] text-muted">
                            {post.reach.toLocaleString("en-IN")} reach · {post.likes.toLocaleString("en-IN")} likes
                          </p>
                        </div>
                      </div>
                      {post.permalink ? (
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-[11.5px] font-medium text-brand hover:underline"
                        >
                          Open
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <CardBody>
                  <p className="text-[13px] text-muted">
                    No published posts yet. Metrics arrive once real accounts are connected, and this list becomes your
                    best-time-to-post guide.
                  </p>
                </CardBody>
              )}
            </Card>
          </div>
        </div>

        {/* ── right column ─────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader
              title="Accounts"
              subtitle={kpis.accountCount ? `${kpis.connectedCount} connected` : "None yet"}
              action={
                <Link href="/accounts" className="text-[12.5px] font-medium text-brand hover:underline">
                  Manage
                </Link>
              }
            />
            {accountCards.length ? (
              <div className="divide-y divide-line">
                {accountCards.slice(0, 5).map((account) => (
                  <div key={account.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <PlatformDot platform={account.platform} />
                        <p className="truncate text-[12.5px] font-medium text-ink">{account.handle}</p>
                      </div>
                      <Badge tone={account.status === "connected" ? "success" : account.status === "needs_reauth" ? "warning" : "neutral"}>
                        {account.status === "connected" ? "connected" : account.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="w-24 shrink-0 text-[11px] text-muted">Today</span>
                      <ProgressBar
                        value={account.postedToday}
                        max={account.dailyCap}
                        tone={account.postedToday >= account.dailyCap ? "danger" : account.postedToday > 0 ? "warning" : "brand"}
                        showLabel
                      />
                    </div>
                    <p className="mt-1.5 text-[11.5px] text-muted">
                      {account.queuedCount} queued
                      {account.nextRunAt ? ` · next ${relative(account.nextRunAt)}` : ""}
                      {account.tokenDaysLeft !== null && account.tokenDaysLeft < 14 ? ` · token expires in ${account.tokenDaysLeft} d` : ""}
                    </p>
                    {account.lastError ? <p className="mt-1 text-[11.5px] text-rose-600">{truncate(account.lastError, 80)}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <CardBody>
                <p className="text-[13px] text-muted">No accounts connected yet.</p>
                <Link href="/accounts" className={buttonClass("primary", "sm", "mt-3")}>
                  <Plus className="h-3.5 w-3.5" /> Connect Instagram or YouTube
                </Link>
              </CardBody>
            )}
          </Card>

          <Card>
            <CardHeader title="Where posts go" subtitle="All-time by platform." />
            <CardBody className="flex items-center gap-5">
              <DonutRing
                segments={platformMix.map((mix) => ({
                  value: mix.published + mix.queued,
                  className: PLATFORM_META[mix.platform].dot,
                  label: mix.platform,
                }))}
                center={`${platformMix.reduce((sum, mix) => sum + mix.published + mix.queued, 0)}`}
              />
              <div className="flex flex-col gap-2">
                {platformMix.map((mix) => (
                  <div key={mix.platform} className="flex items-center gap-2 text-[12.5px]">
                    <PlatformDot platform={mix.platform} />
                    <span className="text-ink">{PLATFORM_META[mix.platform].label}</span>
                    <span className="text-muted">
                      {mix.published} posted · {mix.queued} queued
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Pipeline" subtitle="Every post, by state." />
            <CardBody className="flex flex-col gap-2.5">
              {pipeline.map((row) => {
                const total = pipeline.reduce((sum, item) => sum + item.count, 0) || 1;
                return (
                  <div key={row.state} className="flex items-center gap-3">
                    <span className="w-[104px] shrink-0 text-[12px] text-muted">{row.label}</span>
                    <div className="h-4 flex-1 overflow-hidden rounded bg-slate-100">
                      <div
                        className={`h-full rounded ${STATE_BAR[row.state] ?? "bg-slate-300"}`}
                        style={{ width: `${Math.max(row.count === 0 ? 0 : 6, (row.count / total) * 100)}%` }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-[12px] font-medium tabular-nums text-ink">{row.count}</span>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Brands" subtitle="This month at a glance." />
            <div className="divide-y divide-line">
              {brands.map((brand) => (
                <div key={brand.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: brand.colorHex ?? "#4f46e5" }} />
                      <p className="truncate text-[12.5px] font-medium text-ink">{brand.name}</p>
                    </div>
                    <span className="shrink-0 text-[11.5px] text-muted">{brand.reach30.toLocaleString("en-IN")} reach</span>
                  </div>
                  <p className="mt-1 text-[11.5px] text-muted">
                    {brand.scheduled} scheduled · {brand.published30} published · {brand.needsReview} awaiting review
                  </p>
                  {brand.pillars.length ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {brand.pillars.slice(0, 4).map((pillar) => (
                        <span key={pillar} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] text-slate-600">
                          {pillar}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Activity" subtitle="Everything the studio did, newest first." />
            {activityFeed.length ? (
              <div className="max-h-[320px] overflow-y-auto scroll-thin">
                <div className="divide-y divide-line">
                  {activityFeed.map((item, index) => (
                    <div key={`${item.at.toISOString()}-${index}`} className="flex items-start gap-3 px-5 py-2.5">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[item.tone]}`} />
                      <div className="min-w-0">
                        <p className="text-[12.5px] leading-snug text-ink">{item.summary}</p>
                        <p className="text-[11px] text-muted">
                          {istTime(item.at)} · {item.actor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <CardBody>
                <p className="text-[13px] text-muted">Nothing has happened yet.</p>
              </CardBody>
            )}
          </Card>

          <Card className={setupDone === setup.length ? "border-emerald-200" : "border-indigo-200"}>
            <CardHeader
              title="Setup"
              subtitle={`${setupDone} of ${setup.length} done`}
              action={<Badge tone={setupDone === setup.length ? "success" : "warning"}>{env().PROVIDER_MODE === "live" ? "live" : "mock"}</Badge>}
            />
            <CardBody className="flex flex-col gap-2.5">
              {setup.map((item) => (
                <Link key={item.label} href={item.href} className="flex items-start gap-2.5 rounded-lg px-1 py-0.5 hover:bg-slate-50">
                  {item.done ? (
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-dashed border-slate-300" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-[12.5px] font-medium ${item.done ? "text-muted line-through" : "text-ink"}`}>{item.label}</p>
                    <p className="text-[11px] text-muted">{item.hint}</p>
                  </div>
                </Link>
              ))}
              <p className="mt-1 border-t border-line pt-3 text-[11.5px] leading-relaxed text-muted">
                Posting windows: {DEFAULT_POSTING_WINDOWS.join(", ")} IST. The scheduler keeps a gap between accounts so five pages never
                post the same clip in the same minute.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── pieces ──────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  hint,
  href,
  icon,
  trend,
  chart,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  href?: string;
  icon?: React.ReactNode;
  trend?: number;
  chart?: React.ReactNode;
  tone?: "default" | "warning";
}) {
  const body = (
    <div className="card h-full px-4 py-4 transition-colors hover:border-indigo-200">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium uppercase tracking-wide text-muted">{label}</p>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500">{icon}</span>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <p className={`text-[26px] font-semibold leading-none ${tone === "warning" ? "text-amber-600" : "text-ink"}`}>{value}</p>
        {typeof trend === "number" && trend !== 0 ? (
          <span className={`pb-0.5 text-[12px] font-medium ${trend > 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {trend > 0 ? "+" : ""}
            {trend}
          </span>
        ) : null}
      </div>
      {chart ? <div className="mt-2">{chart}</div> : null}
      {hint ? <p className="mt-1.5 text-[11.5px] leading-snug text-muted">{hint}</p> : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

function PlatformDot({ platform }: { platform: Platform }) {
  const Icon = PLATFORM_META[platform].icon;
  return <Icon className={`h-4 w-4 shrink-0 ${PLATFORM_META[platform].className}`} />;
}

function TimelineRow({ item }: { item: { title: string; platform: Platform; brandName: string; scheduledAt: Date | null; state: TargetState; postId: string } }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className="w-[70px] shrink-0 text-[12px] font-medium tabular-nums text-ink">{istTime(item.scheduledAt)}</span>
      <PlatformDot platform={item.platform} />
      <div className="min-w-0 flex-1">
        <Link href={`/queue?post=${item.postId}`} className="truncate text-[12.5px] font-medium text-ink hover:text-brand">
          {truncate(item.title, 42)}
        </Link>
        <p className="text-[11px] text-muted">{item.brandName}</p>
      </div>
      <Badge tone={item.state === "posted" ? "success" : item.state === "failed" ? "danger" : "neutral"}>{TARGET_LABELS[item.state]}</Badge>
    </div>
  );
}

const STATE_BAR: Record<string, string> = {
  draft: "bg-slate-300",
  needs_review: "bg-amber-400",
  approved: "bg-indigo-400",
  queued: "bg-indigo-500",
  publishing: "bg-sky-500",
  posted: "bg-emerald-500",
  partially_failed: "bg-orange-500",
  failed: "bg-rose-500",
};

const TONE_DOT: Record<string, string> = {
  neutral: "bg-slate-300",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  brand: "bg-indigo-500",
};

function greeting(): string {
  const hour = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
