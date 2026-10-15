import Link from "next/link";
import { CheckCircle2, Clock, ListChecks, RefreshCw, XCircle } from "lucide-react";
import { getPostWithTargets, listQueue, TARGET_STATE_LABELS, type QueueRow } from "@centum/core";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Td, Th, Table, Tr } from "@/components/ui/table";
import { approvePostAction } from "@/lib/actions";
import { istDateTime, relative, truncate } from "@/lib/format";

export const dynamic = "force-dynamic";

function toneFor(state: QueueRow["state"]) {
  switch (state) {
    case "posted":
      return "success" as const;
    case "failed":
      return "danger" as const;
    case "needs_review":
      return "warning" as const;
    case "queued":
    case "approved":
    case "publishing":
      return "brand" as const;
    default:
      return "neutral" as const;
  }
}

const noteText: Record<string, { text: string; tone: "success" | "warning" }> = {
  created: { text: "Post saved. Approve it to move it into the queue.", tone: "success" },
  approved: { text: "Approved — it is now queued and will publish in its window.", tone: "success" },
  missing: { text: "That post could not be found.", tone: "warning" },
};

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string; note?: string }>;
}) {
  const [{ post: focusId, note }, queue] = await Promise.all([searchParams, listQueue(80)]);
  const focused = focusId ? await getPostWithTargets(focusId) : null;
  const banner = note ? noteText[note] : undefined;
  const awaiting = queue.filter((row) => row.state === "needs_review" || row.state === "draft");

  return (
    <>
      <PageHeader
        title="Queue"
        description="Every target the studio knows about, with what it is waiting for. Publishing runs in Sprint 6 — approval already works."
        action={
          <Link href="/compose" className={buttonClass("primary", "md")}>
            <ListChecks className="h-4 w-4" /> New post
          </Link>
        }
      />

      {banner ? (
        <div
          className={
            banner.tone === "success"
              ? "mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] text-emerald-800"
              : "mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900"
          }
        >
          {banner.text}
        </div>
      ) : null}

      {focused ? (
        <Card className="mb-5 border-indigo-200">
          <CardHeader
            title={focused.title || "Untitled post"}
            subtitle={`${focused.targets.length} target(s) · state: ${focused.state}`}
            action={
              <div className="flex items-center gap-2">
                {focused.state !== "queued" ? (
                  <form action={approvePostAction}>
                    <input type="hidden" name="postId" value={focused.id} />
                    <Button type="submit" variant="success" size="sm">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve &amp; queue
                    </Button>
                  </form>
                ) : (
                  <Badge tone="success">Queued</Badge>
                )}
              </div>
            }
          />
          <CardBody>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">{focused.captionMaster}</p>
            {focused.hashtags.length ? <p className="mt-2 text-[12.5px] text-indigo-700">{focused.hashtags.join(" ")}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {focused.targets.map((target) => (
                <Badge key={target.id} tone={toneFor(target.state)}>
                  {target.platform} · {target.account.handle} · {TARGET_STATE_LABELS[target.state]}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {awaiting.length ? (
        <Card className="mb-5">
          <CardHeader title={`Waiting on you (${awaiting.length})`} subtitle="Approve to queue, or open the post to edit." />
          <CardBody className="flex flex-col gap-2">
            {awaiting.map((row) => (
              <div key={row.targetId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium">{row.title || "Untitled post"}</p>
                  <p className="text-[11.5px] text-muted">
                    {row.platform} · {row.handle} · {row.mediaType} · {istDateTime(row.scheduledAt)}
                  </p>
                </div>
                <form action={approvePostAction}>
                  <input type="hidden" name="postId" value={row.postId} />
                  <Button type="submit" variant="secondary" size="sm">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </Button>
                </form>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}

      {queue.length ? (
        <Card>
          <CardHeader title="All targets" subtitle="One row per account — the real unit of work." />
          <Table>
            <thead>
              <tr>
                <Th>Post</Th>
                <Th>Platform</Th>
                <Th>Account</Th>
                <Th>Type</Th>
                <Th>State</Th>
                <Th>When</Th>
                <Th>Attempts</Th>
              </tr>
            </thead>
            <tbody>
              {queue.map((row) => (
                <Tr key={row.targetId}>
                  <Td className="max-w-[240px]">
                    <Link href={`/queue?post=${row.postId}`} className="font-medium hover:text-brand">
                      {truncate(row.title || "Untitled post", 48)}
                    </Link>
                    {row.errorMessage ? <p className="mt-0.5 text-[11.5px] text-rose-600">{truncate(row.errorMessage, 70)}</p> : null}
                  </Td>
                  <Td className="text-muted">{row.platform}</Td>
                  <Td className="text-muted">{row.handle}</Td>
                  <Td>
                    <Badge tone={row.mediaType === "REEL" ? "brand" : row.mediaType === "SHORT" ? "danger" : "neutral"}>{row.mediaType}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={toneFor(row.state)}>
                      {row.state === "failed" ? <XCircle className="h-3 w-3" /> : row.state === "posted" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {TARGET_STATE_LABELS[row.state]}
                    </Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {istDateTime(row.runAt ?? row.scheduledAt)}
                    <span className="ml-1 text-[11.5px] text-slate-400">({relative(row.runAt ?? row.scheduledAt)})</span>
                  </Td>
                  <Td className="text-muted">
                    <span className="inline-flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> {row.attempt}
                    </span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <EmptyState
          icon={<ListChecks className="h-6 w-6" />}
          title="The queue is empty"
          description="Compose a post and approve it — it will appear here with its publish time and attempts."
          action={
            <Link href="/compose" className={buttonClass("primary", "sm")}>
              Compose a post
            </Link>
          }
        />
      )}
    </>
  );
}
