import { countPendingWork } from "@centum/core";

/**
 * Sidebar badges. One query for the shell, and a failure here must never take the
 * whole app down — navigation is more important than a badge.
 */
export async function countsForNav(): Promise<{ review: number; queue: number }> {
  try {
    return await countPendingWork();
  } catch {
    return { review: 0, queue: 0 };
  }
}
