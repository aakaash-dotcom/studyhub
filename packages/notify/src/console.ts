import { log } from "@centum/core";
import type { Notifier, NotifyResult } from "./types";

/** Development notifier: writes messages to the log instead of sending them. */
export function createConsoleNotifier(): Notifier {
  const send = async (kind: string, text: string): Promise<NotifyResult> => {
    log.info({ kind, text }, "[notify:console] would send WhatsApp message");
    return { ok: true, skipped: true };
  };
  return {
    name: "console",
    isConfigured: () => true,
    sendText: (_to, text) => send("text", text),
    sendApprovalRequest: (_to, request) => send("approval", `Approve "${request.title}" for ${request.handles.join(", ")}? ${request.approveUrl}`),
    sendPublishReport: (_to, report) => send("published", `${report.handle} published: ${report.url ?? "(no url)"}`),
    sendFailure: (_to, failure) => send("failure", `${failure.handle} failed: ${failure.message} — ${failure.action}`),
    sendDigest: (_to, digest) => send("digest", `${digest.goingOutToday.length} posts scheduled today, ${digest.failures.length} failures.`),
    sendAlarm: (_to, alarm) => send("alarm", `${alarm.title}: ${alarm.detail}`),
  };
}
