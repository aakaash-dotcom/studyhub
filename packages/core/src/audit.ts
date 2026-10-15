import { events } from "./db/schema";
import { getDb } from "./db/client";
import { log } from "./logger";

/**
 * Append-only audit trail. Every state change in the app writes one of these —
 * it is what makes a 3am failure diagnosable at breakfast (PLAN.md §5).
 */
export type EventActor = `human:${string}` | `agent:${string}` | "system";

export async function recordEvent(input: {
  type: string;
  actor?: EventActor;
  subject?: string | null;
  payload?: Record<string, unknown>;
}): Promise<void> {
  try {
    const db = await getDb();
    await db.insert(events).values({
      type: input.type,
      actor: input.actor ?? "system",
      subject: input.subject ?? null,
      payload: input.payload ?? {},
    });
  } catch (error) {
    // Auditing must never break the operation it is describing.
    log.error({ err: error, type: input.type }, "failed to record audit event");
  }
}
