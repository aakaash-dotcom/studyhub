"use server";

import { redirect } from "next/navigation";
import {
  approvePost,
  cancelPost,
  createAccount,
  deleteAccount,
  createBrand,
  createPost,
  getAccount,
  listAccounts,
  recordEvent,
  type PostState,
} from "@centum/core";

/**
 * Server actions = the human's write path. The agent API (Phase 2) will call
 * the exact same core service functions, so the two can never drift apart.
 */

export type ActionState = { error?: string; success?: string } | null;

// ── auth ────────────────────────────────────────────────────────────────────
// Sign-in and sign-out are plain HTTP route handlers (app/api/auth/*) on purpose:
// see the note in apps/studio/app/api/auth/login/route.ts.

export async function disconnectAccountAction(formData: FormData): Promise<void> {
  const id = String(formData.get("accountId") ?? "");
  const account = await getAccount(id);
  if (!account) redirect("/accounts?note=not-found");
  const { disconnectAccount } = await import("@centum/core");
  await disconnectAccount(id);
  redirect("/accounts?note=disconnected");
}

// ── brands ──────────────────────────────────────────────────────────────────
export async function createBrandAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Give the brand a name." };
  const pillars = String(formData.get("pillars") ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const hashtags = String(formData.get("hashtags") ?? "")
    .split(/[,\s]+/)
    .map((h) => h.trim().replace(/^#/, ""))
    .filter(Boolean)
    .map((h) => `#${h}`);

  await createBrand({
    name,
    targetAudience: String(formData.get("audience") ?? ""),
    toneGuide: String(formData.get("tone") ?? ""),
    pillars,
    hashtagSets: hashtags.length ? { default: hashtags } : {},
  });
  return { success: `“${name}” created.` };
}

// ── posts ───────────────────────────────────────────────────────────────────
export async function createPostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const brandId = String(formData.get("brandId") ?? "");
  const caption = String(formData.get("caption") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const accountIds = formData.getAll("accountIds").map(String).filter(Boolean);
  const whenRaw = String(formData.get("scheduledAt") ?? "");
  const intent = String(formData.get("intent") ?? "draft") as "draft" | "review" | "schedule";

  if (!brandId) return { error: "Pick a brand." };
  if (!caption) return { error: "Write a caption — even a rough one." };
  if (!accountIds.length) return { error: "Choose at least one account to post to." };

  const accounts = (await listAccounts()).filter((account) => accountIds.includes(account.id));
  if (!accounts.length) return { error: "Those accounts no longer exist." };

  const scheduledAt = whenRaw ? new Date(whenRaw) : null;
  if (intent === "schedule" && (!scheduledAt || Number.isNaN(scheduledAt.getTime()))) {
    return { error: "Pick a date and time before scheduling." };
  }

  const state: PostState = intent === "schedule" ? "queued" : intent === "review" ? "needs_review" : "draft";
  const hashtags = String(formData.get("hashtags") ?? "")
    .split(/[,\s]+/)
    .map((h) => h.trim().replace(/^#/, ""))
    .filter(Boolean)
    .map((h) => `#${h}`);

  const post = await createPost({
    brandId,
    title: title || caption.split("\n")[0]!.slice(0, 80),
    caption,
    hashtags,
    scheduledAt: state === "queued" ? scheduledAt : scheduledAt,
    state,
    createdBy: "human",
    targets: accounts.map((account) => ({
      accountId: account.id,
      mediaType: account.platform === "youtube" ? ("SHORT" as const) : ("REEL" as const),
    })),
  });

  await recordEvent({
    type: "post.created_from_ui",
    actor: "human:studio",
    subject: post.id,
    payload: { intent, accounts: accounts.length },
  });

  redirect(`/queue?note=created&post=${post.id}`);
}

export async function deleteAccountAction(formData: FormData): Promise<void> {
  const accountId = String(formData.get("accountId") ?? "");
  if (!accountId) redirect("/accounts?error=" + encodeURIComponent("That account no longer exists."));
  await deleteAccount(accountId);
  redirect("/accounts?note=" + encodeURIComponent("Account removed, along with its queue history."));
}

export async function cancelPostAction(formData: FormData): Promise<void> {
  const postId = String(formData.get("postId") ?? "");
  if (!postId) redirect("/queue?error=" + encodeURIComponent("That post no longer exists."));
  await cancelPost(postId, "human:owner");
  redirect("/queue?note=cancelled");
}

export async function approvePostAction(formData: FormData): Promise<void> {
  const postId = String(formData.get("postId") ?? "");
  if (!postId) redirect("/queue?note=missing");
  await approvePost(postId, "human:studio", "ui");
  redirect("/queue?note=approved");
}
