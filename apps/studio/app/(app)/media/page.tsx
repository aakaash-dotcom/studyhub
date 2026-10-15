import { HardDrive, Image as ImageIcon, Info, Video } from "lucide-react";
import { env, hasR2Credentials, listAssets } from "@centum/core";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Td, Th, Table, Tr } from "@/components/ui/table";
import { istDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const assets = await listAssets();
  const r2Ready = hasR2Credentials();

  return (
    <>
      <PageHeader
        title="Media box"
        description="Meta and YouTube fetch your media from a public URL — Drive share links do not work. This is where uploads become fetchable."
      />

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-[12px] font-medium uppercase tracking-wide text-muted">Public media host</p>
            <p className="mt-1.5 flex items-center gap-2 text-[14px] font-medium">
              <HardDrive className="h-4 w-4 text-slate-400" />
              {r2Ready ? "Cloudflare R2 configured" : "R2 not configured yet"}
            </p>
            <p className="mt-1 text-[12px] text-muted">
              {r2Ready ? env().R2_PUBLIC_BASE_URL : "Add R2 keys in .env — see docs/setup/r2.md"}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-[12px] font-medium uppercase tracking-wide text-muted">One vertical master</p>
            <p className="mt-1.5 text-[14px] font-medium">1080×1920 · H.264 · AAC</p>
            <p className="mt-1 text-[12px] text-muted">
              A file that satisfies Instagram Reels satisfies YouTube Shorts — one export, many platforms.
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-[12px] font-medium uppercase tracking-wide text-muted">In the box</p>
            <p className="mt-1.5 text-[14px] font-medium">{assets.length} assets</p>
            <p className="mt-1 text-[12px] text-muted">Upload + Drive import + ffmpeg validation arrive in Sprint 3.</p>
          </CardBody>
        </Card>
      </div>

      <Card className="mb-5 border-indigo-200 bg-indigo-50/50">
        <CardBody className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <div className="text-[12.5px] leading-relaxed text-indigo-900/90">
            <p className="font-semibold text-indigo-900">What Sprint 3 adds</p>
            <p className="mt-1">
              Drag-and-drop upload, Drive folder import, <code className="rounded bg-white/70 px-1">ffprobe</code> validation
              (ratio, duration, codec, size), <code className="rounded bg-white/70 px-1">ffmpeg</code> normalisation to 9:16, PNG/HEIC
              → JPEG conversion for Instagram, upload to R2 at a random immutable path, then a <code className="rounded bg-white/70 px-1">HEAD</code>{" "}
              check that the URL really resolves before any platform ever sees it.
            </p>
          </div>
        </CardBody>
      </Card>

      {assets.length ? (
        <Card>
          <CardHeader title="Assets" subtitle="Validation results and public URLs." />
          <Table>
            <thead>
              <tr>
                <Th>File</Th>
                <Th>Kind</Th>
                <Th>Size</Th>
                <Th>Validation</Th>
                <Th>Public URL</Th>
                <Th>Added</Th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <Tr key={asset.id}>
                  <Td className="font-medium">{asset.fileName || asset.id.slice(0, 8)}</Td>
                  <Td>
                    <Badge tone={asset.kind === "video" ? "brand" : "neutral"}>
                      {asset.kind === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                      {asset.kind}
                    </Badge>
                  </Td>
                  <Td className="text-muted">{asset.bytes ? `${(asset.bytes / 1048576).toFixed(1)} MB` : "—"}</Td>
                  <Td>
                    {asset.validation ? (
                      <Badge tone={asset.validation.ok ? "success" : "danger"}>{asset.validation.ok ? "valid" : "issues"}</Badge>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </Td>
                  <Td className="max-w-[220px] truncate text-muted">{asset.publicUrl ?? "not uploaded"}</Td>
                  <Td className="whitespace-nowrap text-muted">{istDateTime(asset.createdAt)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <EmptyState icon={<ImageIcon className="h-6 w-6" />} title="No media yet" description="Your uploads and Drive imports will appear here with their validation results." />
      )}
    </>
  );
}
