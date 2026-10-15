import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarPlus, ImagePlus, Link2, PenSquare } from "lucide-react";
import { dashboardStats, listPosts, listSafeAccounts } from "@centum/core";
import { Badge } from "@/components/ui/badge";
import { buttonClass, Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Td, Th, Table, Tr } from "@/components/ui/table";
import { istDateTime, relative, truncate } from "@/lib/format";
import { TARGET_STATE_LABELS, PLATFORM_LABELS } from "@centum/core";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, accounts, upcoming] = await Promise.all([
    dashboardStats(),
    listSafeAccounts(),
    listPosts({ limit: 6 }),
  ]);

  const needsSetup = accounts.length === 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="What is going out, what needs your approval, and what broke — all in IST."
        action={
          <Link href="/compose" className={buttonClass("primary", "md")}>
            <PenSquare className="h-4 w-4" /> New post
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Accounts"
          value={`${stats.connectedCount}/${stats.accountCount}`}
          hint={stats.accountCount ? "connected" : "connect your first page"}
          href="/accounts"
        />
        <StatCard label="Scheduled" value={stats.scheduledCount} hint="posts in the queue" href="/queue" tone={stats.scheduledCount ? "success" : "default"} />
        <StatCard label="Needs review" value={stats.needsReviewCount} hint="waiting on you" href="/queue" tone={stats.needsReviewCount ? "warning" : "default"} />
        <StatCard
          label="Published (7d)"
          value={stats.postedLast7}
          hint={stats.failedCount ? `${stats.failedCount} failed` : "no failures"}
          href="/queue"
          tone={stats.failedCount ? "danger" : "default"}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader
            title="Recent posts"
            subtitle="Drafts, queued and published work from this studio."
            action={
              <Link href="/calendar" className={buttonClass("secondary", "sm")}>
                Open calendar <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {upcoming.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Post</Th>
                  <Th>Brand</Th>
                  <Th>State</Th>
                  <Th>When</Th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((post) => (
                  <Tr key={post.id}>
                    <Td className="max-w-[260px]">
                      <Link href={`/queue?post=${post.id}`} className="font-medium text-ink hover:text-brand">
                        {truncate(post.title || post.captionMaster, 64)}
                      </Link>
                    </Td>
                    <Td className="text-muted">{post.pillar ?? "—"}</Td>
                    <Td>
                      <Badge tone={post.state === "queued" ? "success" : post.state === "needs_review" ? "warning" : "neutral"}>
                        {post.state.replace("_", " ")}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-muted">
                      {istDateTime(post.scheduledAt ?? post.createdAt)}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <CardBody>
              <EmptyState
                icon={<CalendarPlus className="h-6 w-6" />}
                title="Nothing scheduled yet"
                description="Compose your first post, or connect an account to see the whole pipeline in action."
                action={
                  <div className="flex gap-2">
                    <Link href="/compose" className={buttonClass("primary", "sm")}>
                      <PenSquare className="h-3.5 w-3.5" /> Compose a post
                    </Link>
                    <Link href="/accounts" className={buttonClass("secondary", "sm")}>
                      <Link2 className="h-3.5 w-3.5" /> Connect accounts
                    </Link>
                  </div>
                }
              />
            </CardBody>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Next up" subtitle="The next thing this studio will publish." />
            <CardBody>
              {stats.nextUp ? (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[14px] font-medium text-ink">{truncate(stats.nextUp.title || "Untitled post", 70)}</p>
                  <p className="text-[12.5px] text-muted">
                    {PLATFORM_LABELS[stats.nextUp.platform]} · {stats.nextUp.handle} · {stats.nextUp.mediaType}
                  </p>
                  <p className="text-[12.5px] text-muted">
                    {istDateTime(stats.nextUp.runAt ?? stats.nextUp.scheduledAt)} ({relative(stats.nextUp.runAt ?? stats.nextUp.scheduledAt)})
                  </p>
                  <Badge tone="brand" className="mt-1 w-fit">
                    {TARGET_STATE_LABELS[stats.nextUp.state]}
                  </Badge>
                </div>
              ) : (
                <p className="text-[13px] text-muted">Nothing queued. Approve something and it will show up here.</p>
              )}
            </CardBody>
          </Card>

          {needsSetup ? (
            <Card className="border-amber-200 bg-amber-50/60">
              <CardBody>
                <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
                  <AlertTriangle className="h-4 w-4" /> Connect your pages first
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/80">
                  Sprint 1 ships with a <strong>demo connect</strong> so you can click through the whole flow. The real
                  Instagram and YouTube OAuth flows land in Sprint 2.
                </p>
                <Link href="/accounts" className={buttonClass("primary", "sm", "mt-3")}>
                  <Link2 className="h-3.5 w-3.5" /> Go to accounts
                </Link>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Media box" subtitle="Public, fetchable URLs for Meta and YouTube." />
            <CardBody>
              <p className="text-[13px] text-muted">
                {stats.assetsCount ? `${stats.assetsCount} assets ready.` : "No assets yet."} Drive uploads become public R2
                URLs here — Drive links themselves are rejected by Meta.
              </p>
              <Link href="/media" className={buttonClass("secondary", "sm", "mt-3")}>
                <ImagePlus className="h-3.5 w-3.5" /> Open media box
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
