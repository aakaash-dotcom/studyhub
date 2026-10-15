import Link from "next/link";
import { AlertTriangle, Camera, CircleCheck, Clock, Link2, MonitorPlay, Unplug } from "lucide-react";
import { env, listBrands, listSafeAccounts, hasMetaCredentials, hasGoogleCredentials } from "@centum/core";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Td, Th, Table, Tr } from "@/components/ui/table";
import { disconnectAccountAction } from "@/lib/actions";
import { istDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const notes: Record<string, { tone: "success" | "warning" | "danger"; text: string }> = {
  "demo-connected": { tone: "success", text: "Demo account connected. It publishes to nothing real." },
  "demo-exists": { tone: "warning", text: "A demo account is already connected." },
  disconnected: { tone: "warning", text: "Account disconnected and its tokens were deleted." },
  "not-found": { tone: "danger", text: "That account no longer exists." },
};

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ note?: string; error?: string }>;
}) {
  const [{ note, error }, accounts, brands] = await Promise.all([searchParams, listSafeAccounts(), listBrands()]);
  // The OAuth routes return free-text notes/explanations, older actions return
  // known keys — support both so a message is never swallowed.
  const banner = error
    ? { tone: "danger" as const, text: `Could not connect: ${error}` }
    : note
      ? (notes[note] ?? { tone: "success" as const, text: note })
      : undefined;
  const brandName = (id: string | null) => brands.find((b) => b.id === id)?.name ?? "Unassigned";
  const configured = env().PROVIDER_MODE === "live" && (hasMetaCredentials() || hasGoogleCredentials());

  return (
    <>
      <PageHeader
        title="Accounts"
        description="Every Instagram page and YouTube channel this studio can publish to. Tokens are encrypted at rest and refreshed automatically."
        action={
          <div className="flex gap-2">
            <a className={buttonClass("secondary", "md")} href="/api/oauth/instagram/start">
              <Camera className="h-4 w-4" /> Connect Instagram
            </a>
            <a className={buttonClass("secondary", "md")} href="/api/oauth/youtube/start">
              <MonitorPlay className="h-4 w-4" /> Connect YouTube
            </a>
          </div>
        }
      />

      {banner ? (
        <div
          className={
            banner.tone === "success"
              ? "mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] text-emerald-800"
              : banner.tone === "warning"
                ? "mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900"
                : "mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[13px] text-rose-800"
          }
        >
          {banner.text}
        </div>
      ) : null}

      <Card className="mb-5 border-indigo-200 bg-indigo-50/50">
        <CardBody className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[13.5px] font-semibold text-indigo-900">How connecting works</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-indigo-900/80">
              Instagram connects through <strong>Instagram Login</strong> — no Facebook Page needed, and no App Review
              while the Meta app stays in Development Mode (each account just has to accept the tester invite once).
              YouTube connects through Google OAuth. Tokens are sealed with AES-256-GCM before they touch the database,
              and the long-lived Instagram token is refreshed well before its 60-day expiry.
              {configured ? null : " Until the credentials exist, Connect creates a mock account so you can exercise the composer, calendar and queue today."}
            </p>
          </div>
          <Link href="/settings" className={buttonClass("secondary", "sm")}>
            Setup status <Link2 className="h-3.5 w-3.5" />
          </Link>
        </CardBody>
      </Card>

      {accounts.length ? (
        <Card>
          <CardHeader title={`${accounts.length} connected`} subtitle="Handle, brand, token health and posting rules." />
          <Table>
            <thead>
              <tr>
                <Th>Account</Th>
                <Th>Brand</Th>
                <Th>Status</Th>
                <Th>Token</Th>
                <Th>Daily cap</Th>
                <Th>Windows (IST)</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <Tr key={account.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      {account.platform === "instagram" ? (
                        <Camera className="h-4 w-4 text-pink-600" />
                      ) : account.platform === "youtube" ? (
                        <MonitorPlay className="h-4 w-4 text-red-600" />
                      ) : null}
                      <div>
                        <p className="font-medium">{account.handle || account.platformAccountId}</p>
                        <p className="text-[11.5px] text-muted">{account.displayName}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-muted">{brandName(account.brandId)}</Td>
                  <Td>
                    <Badge tone={account.status === "connected" ? "success" : account.status === "needs_reauth" ? "warning" : "danger"}>
                      {account.status === "connected" ? <CircleCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {account.status.replace("_", " ")}
                    </Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    {account.expiresAt ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {istDate(account.expiresAt)}
                        <span className={account.tokenExpiresInDays !== null && account.tokenExpiresInDays < 7 ? "text-amber-600" : ""}>
                          ({account.tokenExpiresInDays} d)
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td className="text-muted">{account.dailyCap}/day</Td>
                  <Td className="text-[12px] text-muted">{account.postingWindows.join(" · ") || "—"}</Td>
                  <Td>
                    <form action={disconnectAccountAction}>
                      <input type="hidden" name="accountId" value={account.id} />
                      <Button variant="ghost" size="sm" type="submit">
                        <Unplug className="h-3.5 w-3.5" /> Disconnect
                      </Button>
                    </form>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <EmptyState
          icon={<Link2 className="h-6 w-6" />}
          title="No accounts connected"
          description="Connect Instagram or YouTube above. Without credentials the Connect buttons create a mock account, so the composer, calendar and queue all work today."
        />
      )}
    </>
  );
}
