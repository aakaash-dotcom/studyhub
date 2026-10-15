import Link from "next/link";
import {
  AlertTriangle,
  Camera,
  CircleCheck,
  Clock,
  Filter,
  ListChecks,
  MonitorPlay,
  Search,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { getPostWithTargets, listQueue, env, type Platform, type TargetState } from "@centum/core";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Td, Th, Table, Tr } from "@/components/ui/table";
import { approvePostAction, cancelPostAction } from "@/lib/actions";
import { istDateTime, relative, truncate } from "@/lib/format";

export const dynamic = "force-dynamic";

type QueueFilter = { key: string; label: string; states: TargetState[] | null };

const FILTERS: QueueFilter[] = [
  { key: "all", label: "Everything", states: null },
  { key: "review", label: "Needs review", states: ["needs_review"] },
  { key: "queued", label: "Queued", states: ["queued", "approved", "publishing"] },
  { key: "posted", label: "Published", states: ["posted"] },
  { key: "failed", label: "Failed", states: ["failed"] },
];

const STATE_TONE: Record<TargetState, "neutral" | "brand" | "success" | "warning" | "danger" | "info"> = {
  draft: "neutral",
  needs_review: "warning",
  approved: "brand",
  queued: "brand",
  publishing: "info",
  posted: "success",
  failed: "danger",
  skipped: "neutral",
};

const STATE_LABEL: Record<TargetState, string> = {
  draft: "Draft",
  needs_review: "Needs review",
  approved: "Approved",
  queued: "Queued",
  publishing: "Publishing",
  posted: "Published",
  failed: "Failed",
  skipped: "Skipped",
};

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string; state?: string; q?: string; note?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [rows, focused] = await Promise.all([
    listQueue(400),
    params.post ? getPostWithTargets(params.post) : Promise.resolve(null),
  ]);

  const activeFilter: QueueFilter = FILTERS.find((filter) => filter.key === (params.state ?? "all")) ?? FILTERS[0]!;
  const query = (params.q ?? "").trim().toLowerCase();

  const filtered = rows.filter((row) => {
    const matchesState = !activeFilter.states || activeFilter.states.includes(row.state);
    const matchesQuery =
      !query || row.title.toLowerCase().includes(query) || row.handle.toLowerCase().includes(query) || row.platform.includes(query);
    return matchesState && matchesQuery;
  });

  const counts = {
    all: rows.length,
    review: rows.filter((row) => row.state === "needs_review").length,
    queued: rows.filter((row) => ["queued", "approved", "publishing"].includes(row.state)).length,
    posted: rows.filter((row) => row.state === "posted").length,
    failed: rows.filter((row) => row.state === "failed").length,
  };

  return (
    <>
      <PageHeader
        title="Queue"
        description="Every target, in the order the scheduler will handle it. Approve, reschedule or cancel — one row per account, so a post going to five pages is five rows you can reason about."
        action={
          <Link href="/compose" className={buttonClass("primary", "md")}>
            New post
          </Link>
        }
      />

      {params.error ? (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[13px] text-rose-800">{params.error}</div>
      ) : null}
      {params.note === "created" ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] text-emerald-800">
          Post saved. Approve it here when you are happy with it.
        </div>
      ) : null}
      {params.note === "approved" ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] text-emerald-800">
          Approved and queued. Each target now has its own run time.
        </div>
      ) : null}
      {params.note === "cancelled" ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900">
          Cancelled. Nothing will be sent for that post.
        </div>
      ) : null}

      {focused ? <FocusedPost post={focused} /> : null}

      <Card className="mb-5">
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 pr-1 text-[12px] text-muted">
              <Filter className="h-3.5 w-3.5" /> Filter
            </span>
            {FILTERS.map((filter) => {
              const active = filter.key === activeFilter.key;
              const count = counts[filter.key as keyof typeof counts] ?? 0;
              const href = filter.key === "all" ? "/queue" : `/queue?state=${filter.key}`;
              return (
                <Link
                  key={filter.key}
                  href={href}
                  className={
                    active
                      ? "inline-flex items-center gap-1.5 rounded-lg bg-brand px-2.5 py-1.5 text-[12.5px] font-medium text-white"
                      : "inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
                  }
                >
                  {filter.label}
                  <span className={active ? "text-white/80" : "text-muted"}>{count}</span>
                </Link>
              );
            })}
          </div>

          <form className="relative" action="/queue">
            {activeFilter.key !== "all" ? <input type="hidden" name="state" value={activeFilter.key} /> : null}
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search title or account…"
              className="h-9 w-full rounded-lg border border-line bg-white pl-8 pr-3 text-[13px] text-ink placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none sm:w-[240px]"
            />
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={`${filtered.length} ${filtered.length === 1 ? "target" : "targets"}`}
          subtitle={query ? `Matching “${params.q}”` : "Newest run time first within each state group."}
        />
        {filtered.length ? (
          <Table>
            <thead>
              <tr>
                <Th>Post</Th>
                <Th>Account</Th>
                <Th>Type</Th>
                <Th>When</Th>
                <Th>State</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <Tr key={row.targetId}>
                  <Td className="max-w-[280px]">
                    <Link href={`/queue?post=${row.postId}`} className="font-medium text-ink hover:text-brand">
                      {truncate(row.title || "(untitled)", 54)}
                    </Link>
                    {row.errorMessage ? (
                      <p className="mt-0.5 flex items-start gap-1 text-[11.5px] text-rose-600">
                        <TriangleAlert className="mt-px h-3 w-3 shrink-0" />
                        {truncate(row.errorMessage, 68)}
                      </p>
                    ) : null}
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5">
                      <PlatformIcon platform={row.platform} />
                      <span className="text-[12.5px]">{row.handle || "—"}</span>
                    </span>
                  </Td>
                  <Td>
                    <Badge tone="neutral">{row.mediaType}</Badge>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <span className="text-[12.5px] text-ink">{istDateTime(row.runAt ?? row.scheduledAt)}</span>
                    <span className="block text-[11.5px] text-muted">{relative(row.runAt ?? row.scheduledAt)}</span>
                  </Td>
                  <Td>
                    <Badge tone={STATE_TONE[row.state]}>{STATE_LABEL[row.state]}</Badge>
                    {row.attempt > 0 && row.state !== "posted" ? (
                      <span className="ml-1 text-[11px] text-muted">try {row.attempt}</span>
                    ) : null}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      {row.state === "needs_review" ? (
                        <form action={approvePostAction}>
                          <input type="hidden" name="postId" value={row.postId} />
                          <Button variant="primary" size="sm" type="submit">
                            <CircleCheck className="h-3.5 w-3.5" /> Approve
                          </Button>
                        </form>
                      ) : null}
                      {["queued", "approved", "needs_review"].includes(row.state) ? (
                        <form action={cancelPostAction}>
                          <input type="hidden" name="postId" value={row.postId} />
                          <Button variant="ghost" size="sm" type="submit" title="Cancel this post">
                            <XCircle className="h-3.5 w-3.5" /> Cancel
                          </Button>
                        </form>
                      ) : null}
                      <Link href={`/queue?post=${row.postId}`} className="text-[12px] font-medium text-brand hover:underline">
                        Details
                      </Link>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <CardBody>
            <EmptyState
              icon={<ListChecks className="h-4 w-4" />}
              title={query ? "No target matches that search" : "Nothing in this view"}
              description={
                query
                  ? "Try a shorter search, or clear the filter to see everything."
                  : "Compose a post and approve it — each account it targets will appear here with its own run time."
              }
            />
          </CardBody>
        )}
      </Card>

      <p className="mt-4 text-[12px] text-muted">
        Retries: a failed target retries up to three times with a widening gap; after that it stops and waits for you. Publishing is
        idempotent per target — the unique index on (post, account) means a retry can never double-post.
        {env().PROVIDER_MODE === "mock" ? " Publishers are in mock mode, so runs are simulated." : null}
      </p>
    </>
  );
}

function FocusedPost({ post }: { post: NonNullable<Awaited<ReturnType<typeof getPostWithTargets>>> }) {
  return (
    <Card className="mb-5 border-indigo-200">
      <CardHeader
        title={post.title || "(untitled)"}
        subtitle={`${post.captionMaster.split("\n")[0]?.slice(0, 90)}…`}
        action={
          <Link href="/queue" className="text-[12.5px] font-medium text-brand hover:underline">
            Close
          </Link>
        }
      />
      <CardBody className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={post.state === "posted" ? "success" : post.state === "needs_review" ? "warning" : "brand"}>
            {post.state.replace(/_/g, " ")}
          </Badge>
          {post.pillar ? <Badge tone="neutral">{post.pillar}</Badge> : null}
          {post.approvedBy ? <Badge tone="info">approved by {post.approvedBy}</Badge> : null}
          <span className="text-[12px] text-muted">scheduled {istDateTime(post.scheduledAt)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {post.hashtags.length ? (
            <p className="text-[12.5px] text-muted">{post.hashtags.join(" ")}</p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {post.targets.map((target) => (
            <div key={target.id} className="rounded-xl border border-line bg-slate-50/60 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
                  <PlatformIcon platform={target.platform} />
                  {target.account.handle || target.accountId.slice(0, 8)}
                </span>
                <Badge tone={STATE_TONE[target.state]}>{STATE_LABEL[target.state]}</Badge>
              </div>
              <p className="mt-1 text-[11.5px] text-muted">
                {target.mediaType} · {istDateTime(target.scheduledAt)}
                {target.attempts > 0 ? ` · ${target.attempts} attempt(s)` : ""}
              </p>
              {target.errorMessage ? (
                <p className="mt-1.5 rounded-lg bg-rose-50 px-2 py-1.5 text-[11.5px] text-rose-700">{target.errorMessage}</p>
              ) : null}
              {target.remoteUrl ? (
                <a href={target.remoteUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-[11.5px] font-medium text-brand hover:underline">
                  View on {target.platform} →
                </a>
              ) : null}
            </div>
          ))}
        </div>

        {post.state === "needs_review" ? (
          <div className="flex gap-2">
            <form action={approvePostAction}>
              <input type="hidden" name="postId" value={post.id} />
              <Button variant="primary" size="md" type="submit">
                <CircleCheck className="h-4 w-4" /> Approve and queue
              </Button>
            </form>
            <form action={cancelPostAction}>
              <input type="hidden" name="postId" value={post.id} />
              <Button variant="secondary" size="md" type="submit">
                <XCircle className="h-4 w-4" /> Cancel
              </Button>
            </form>
          </div>
        ) : null}

        {post.state === "partially_failed" || post.targets.some((target) => target.state === "failed") ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12.5px] text-rose-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Some targets did not go out</p>
              <p className="mt-0.5">
                The accounts that succeeded keep their post — retrying only touches the ones that failed. Fix the cause (often a token
                or a quota) and the row can be retried without duplicating what is already live.
              </p>
            </div>
          </div>
        ) : null}

        <p className="text-[11.5px] text-muted">
          <Clock className="mr-1 inline h-3 w-3" />
          Created {istDateTime(post.createdAt)} · id {post.id.slice(0, 8)}
        </p>
      </CardBody>
    </Card>
  );
}

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "youtube") return <MonitorPlay className="h-3.5 w-3.5 text-red-600" />;
  if (platform === "facebook") return <CircleCheck className="h-3.5 w-3.5 text-blue-600" />;
  return <Camera className="h-3.5 w-3.5 text-pink-600" />;
}
