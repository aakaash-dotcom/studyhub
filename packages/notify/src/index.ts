import { env } from "@centum/core";
import { createConsoleNotifier } from "./console";
import { createWhatsAppNotifier } from "./whatsapp-crm";
import type { Notifier } from "./types";

export * from "./types";
export { createConsoleNotifier } from "./console";
export { createWhatsAppNotifier } from "./whatsapp-crm";

let cached: Notifier | null = null;

/** WhatsApp when credentials exist (or PROVIDER_MODE=live), console otherwise. */
export function getNotifier(): Notifier {
  if (cached) return cached;
  const whatsapp = createWhatsAppNotifier();
  cached = env().PROVIDER_MODE === "live" || whatsapp.isConfigured() ? whatsapp : createConsoleNotifier();
  return cached;
}
