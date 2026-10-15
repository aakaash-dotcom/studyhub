import Link from "next/link";
import {
  AlertTriangle,
  CircleCheck,
  CloudUpload,
  Film,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  Plus,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { hasR2Credentials, hasGoogleCredentials, listAssets, env } from "@centum/core";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { istDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * The media box exists because neither Meta nor YouTube will fetch a Google Drive
 * link: Meta answers "Media download has failed" and YouTube refuses the upload.
 * Every asset therefore has to end up at a public, immutable URL (Cloudflare R2).
 * This screen is where that either happened or did not.
 */
export default async function MediaPage() {
  const assets = await listAssets();
  const r2Ready = hasR2Credentials();
  const driveReady = hasGoogleCredentials();
  const mirrored = assets.filter((asset) => asset.publicUrl);
  const pending = assets.filter((asset) => !asset.publicUrl);

  return (
    <>
      <PageHeader
        title="Media box"
        description="Every asset the studio can publish, with the checks that matter: dimensions, duration, aspect ratio, codec and — most importantly — a public URL both platforms can actually fetch."
        action={
          <Link href="/compose" className={buttonClass("primary", "md")}>
            <Plus className="h-4 w-4" /> Use in a post
          </Link>
        }
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr]">
        <Card className={r2Ready ? "border-emerald-200" : "border-amber-200"}>
          <CardBody className="flex items-start gap-3">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${r2Ready ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              <HardDrive className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">Cloudflare R2</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                {r2Ready
                  ? "Configured. Uploads land at immutable paths and are public, so Instagram and YouTube can fetch them."
                  : "Not configured yet. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_PUBLIC_BASE_URL to .env."}
              </p>
              <Badge tone={r2Ready ? "success" : "warning"} className="mt-2">
                {r2Ready ? "ready" : "waiting on credentials"}
              </Badge>
            </div>
          </CardBody>
        </Card>

        <Card className={driveReady ? "border-emerald-200" : "border-line"}>
          <CardBody className="flex items-start gap-3">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${driveReady ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"}`}>
              <FolderOpen className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">Google Drive inbox</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                Drop files in the folder and the studio pulls them, normalises 9:16 video with ffmpeg, then mirrors to R2. Agents can use
                the same folder.
              </p>
              <Badge tone={driveReady ? "success" : "info"} className="mt-2">
                {driveReady ? "connected" : "watcher lands in sprint 12"}
              </Badge>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">Checks before upload</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                JPEG-only stills at 4:5–1.91:1 and ≤8 MB, Reels 9:16 H.264/AAC, Shorts ≤3 minutes. Validation runs before a quota unit is
                spent, so rejections never cost you a publishing slot.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mb-5 border-dashed">
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-500">
              <CloudUpload className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">Upload or drop a file</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {r2Ready
                  ? "Chunked upload, ffprobe, normalise, mirror — the sprint 3 pipeline is next on the list."
                  : "Uploads switch on with the R2 credentials above; the pipeline itself ships in sprint 3."}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`inline-flex h-9 items-center rounded-lg px-3 text-[13px] font-medium ${r2Ready ? "bg-brand text-white" : "cursor-not-allowed bg-slate-100 text-slate-400"}`}>
              Choose a file
            </span>
            <span className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-slate-400">
              Pull from Drive
            </span>
          </div>
        </CardBody>
      </Card>

      {assets.length ? (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
            <span>{assets.length} assets</span>
            <span className="text-slate-300">·</span>
            <span>{mirrored.length} with a public URL</span>
            {pending.length ? (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-amber-700">{pending.length} waiting to be mirrored</span>
              </>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => {
              const warnings = asset.validation?.warnings ?? [];
              const issues = asset.validation?.issues ?? [];
              return (
                <Card key={asset.id}>
                  <div className="flex h-[132px] items-center justify-center rounded-t-xl border-b border-line bg-slate-50">
                    {asset.kind === "video" ? <Film className="h-8 w-8 text-slate-300" /> : <ImageIcon className="h-8 w-8 text-slate-300" />}
                  </div>
                  <CardBody className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink" title={asset.fileName}>
                        {asset.fileName || "(unnamed)"}
                      </p>
                      <Badge tone={asset.publicUrl ? "success" : "warning"}>{asset.publicUrl ? "public" : "not mirrored"}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <Badge tone="neutral">{asset.kind === "video" ? "video" : "image"}</Badge>
                      <Badge tone="neutral">{asset.source}</Badge>
                      {asset.width && asset.height ? (
                        <Badge tone="neutral">
                          <Ruler className="h-3 w-3" />
                          {asset.width}×{asset.height}
                        </Badge>
                      ) : null}
                      {asset.durationS ? <Badge tone="neutral">{asset.durationS.toFixed(1)}s</Badge> : null}
                      {asset.bytes ? <Badge tone="neutral">{(asset.bytes / 1024 / 1024).toFixed(1)} MB</Badge> : null}
                    </div>

                    {issues.length ? (
                      <p className="flex items-start gap-1.5 rounded-lg bg-rose-50 px-2 py-1.5 text-[11.5px] text-rose-700">
                        <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
                        {issues.join(" ")}
                      </p>
                    ) : null}
                    {warnings.length ? (
                      <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-[11.5px] text-amber-800">
                        <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
                        {warnings.join(" ")}
                      </p>
                    ) : null}
                    {asset.validation?.ok && !issues.length && !warnings.length ? (
                      <p className="flex items-center gap-1.5 text-[11.5px] text-emerald-700">
                        <CircleCheck className="h-3 w-3" /> Passes Instagram and YouTube checks
                      </p>
                    ) : null}

                    {asset.publicUrl ? (
                      <a
                        href={asset.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-[11.5px] font-medium text-brand hover:underline"
                        title={asset.publicUrl}
                      >
                        {asset.publicUrl}
                      </a>
                    ) : (
                      <p className="text-[11.5px] text-muted">Drive links are rejected by Meta — mirror to R2 first.</p>
                    )}

                    <p className="text-[11px] text-muted">Added {istDateTime(asset.createdAt)}</p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card>
          <CardBody>
            <EmptyState
              icon={<ImageIcon className="h-4 w-4" />}
              title="No media yet"
              description={
                r2Ready
                  ? "Upload a video or an image and the studio will check, normalise and mirror it before it can be published."
                  : "Once R2 credentials are in place, this is where every asset lands — with its dimensions, duration and public URL."
              }
            />
          </CardBody>
        </Card>
      )}

      <p className="mt-5 text-[12px] text-muted">
        Publishing is {env().PROVIDER_MODE === "mock" ? "simulated right now" : "live"}. Assets are stored at random immutable paths, so
        replacing a file never changes what an already-published post points at.
      </p>
    </>
  );
}
