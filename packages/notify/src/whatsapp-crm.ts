import { env, log } from "@centum/core";
import type { ApprovalRequest, Alarm, DailyDigest, FailureReport, Notifier, NotifyResult, PublishReport } from "./types";

/**
 * Adapter for YOUR WhatsApp CRM's REST API (PLAN.md §2.4).
 *
 * Written generically on purpose: base URL, auth header and send path all come
 * from .env, so it works with Interakt / Wati / Gupshup / Baileys-based tools
 * and anything else that exposes a "send message" endpoint. When you tell me
 * the provider, only `buildSendPayload` needs to change.
 *
 * Approvals are two-way: this adapter calls your CRM to send the message, and
 * the Studio exposes /api/webhooks/whatsapp for the CRM to POST the user's tap
 * back to us.
 */
export function createWhatsAppNotifier(): Notifier {
  const send = async (text: string, kind: string): Promise<NotifyResult> => {
    const e = env();
    if (!e.WHATSAPP_CRM_BASE_URL || !e.WHATSAPP_CRM_API_KEY) {
      return { ok: false, error: "WhatsApp CRM is not configured." };
    }
    const to = e.WHATSAPP_CRM_APPROVER_NUMBER;
    if (!to) return { ok: false, error: "WHATSAPP_CRM_APPROVER_NUMBER is not set." };

    try {
      const response = await fetch(`${e.WHATSAPP_CRM_BASE_URL.replace(/\/$/, "")}${e.WHATSAPP_CRM_SEND_PATH}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [e.WHATSAPP_CRM_AUTH_HEADER]: e.WHATSAPP_CRM_AUTH_HEADER.toLowerCase() === "authorization" ? `Bearer ${e.WHATSAPP_CRM_API_KEY}` : e.WHATSAPP_CRM_API_KEY,
        },
        body: JSON.stringify(buildSendPayload(to, text)),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        log.warn({ status: response.status, body: body.slice(0, 200), kind }, "whatsapp send failed");
        return { ok: false, error: `CRM responded ${response.status}` };
      }
      const data = (await response.json().catch(() => ({}))) as { id?: string; messageId?: string };
      return { ok: true, id: data.id ?? data.messageId };
    } catch (error) {
      log.warn({ err: error, kind }, "whatsapp send error");
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  return {
    name: "whatsapp-crm",
    isConfigured: () => Boolean(env().WHATSAPP_CRM_BASE_URL && env().WHATSAPP_CRM_API_KEY),
    sendText: (_to, text) => send(text, "text"),
    sendApprovalRequest: (_to, request: ApprovalRequest) => send(renderApproval(request), "approval"),
    sendPublishReport: (_to, report: PublishReport) =>
      send(`✅ Published to ${report.platform} (${report.handle})${report.url ? `\n${report.url}` : ""}`, "published"),
    sendFailure: (_to, failure: FailureReport) =>
      send(
        `⚠️ Failed: ${failure.platform} (${failure.handle})\n${failure.message}\nWhat to do: ${failure.action}\nRetry: ${failure.retryUrl}`,
        "failure",
      ),
    sendDigest: (_to, digest: DailyDigest) => send(renderDigest(digest), "digest"),
    sendAlarm: (_to, alarm: Alarm) => send(`🔔 ${alarm.title}\n${alarm.detail}${alarm.actionUrl ? `\n${alarm.actionUrl}` : ""}`, "alarm"),
  };
}

/**
 * The provider-specific part. Override this once you tell me which CRM you use;
 * the rest of the adapter stays identical.
 */
export function buildSendPayload(to: string, text: string): Record<string, unknown> {
  return { to, type: "text", text: { body: text } };
}

function renderApproval(request: ApprovalRequest): string {
  const when = request.scheduledAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  return [
    `📝 Approval needed — ${request.brandName}`,
    `“${request.title}”`,
    `Platforms: ${request.platforms.join(", ")} → ${request.handles.join(", ")}`,
    `When: ${when} IST`,
    ``,
    request.captionExcerpt,
    ``,
    `✅ Approve: ${request.approveUrl}`,
    `❌ Reject: ${request.rejectUrl}`,
    `👀 Preview: ${request.previewUrl}`,
  ].join("\n");
}

function renderDigest(digest: DailyDigest): string {
  const lines: string[] = [`📅 Centum Studio — ${digest.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`];
  lines.push(``, `Going out today: ${digest.goingOutToday.length}`);
  for (const item of digest.goingOutToday.slice(0, 8)) lines.push(`  ${item.time} · ${item.brandName} · ${item.platforms.join("/")}`);
  lines.push(``, `Published yesterday: ${digest.wentOutYesterday.length}`);
  if (digest.failures.length) {
    lines.push(``, `⚠️ Needs attention: ${digest.failures.length}`);
    for (const failure of digest.failures.slice(0, 5)) lines.push(`  ${failure.handle}: ${failure.message}`);
  }
  lines.push(``, `Open Studio: ${digest.studioUrl}`);
  return lines.join("\n");
}
