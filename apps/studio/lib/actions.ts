"use server";

import { redirect } from "next/navigation";
import {
  approvePost,
  createAccount,
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

// ── accounts (demo path until the real OAuth flows land in Sprint 2) ────────
export async function connectDemoAccountAction(formData: FormData): Promise<void> {
  const platform = String(formData.get("platform") ?? "instagram") as "instagram" | "youtube";
  const existing = await listAccounts();
  if (existing.some((account) => account.platformAccountId.startsWith("demo_"))) {
    redirect("/accounts?note=demo-exists");
  }

  const suffix = Math.random().toString(36).slice(2, 6);
  await createAccount({
    platform,
    authPath: platform === "instagram" ? "instagram_login" : "google",
    platformAccountId: `demo_${platform}_${suffix}`,
    handle: platform === "instagram" ? `@demo.centum.${suffix}` : `Demo Centum Channel ${suffix}`,
    displayName: platform === "instagram" ? "Centum App (demo)" : "Centum App Shorts (demo)",
    accessToken: `demo-token-${suffix}`,
    scopes: platform === "instagram" ? ["instagram_business_basic", "instagram_business_content_publish"] : ["youtube.upload"],
    expiresAt: new Date(Date.now() + 60 * 864e5),
    dailyCap: 10,
  });
  redirect("/accounts?note=demo-connected");
}

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

export async function approvePostAction(formData: FormData): Promise<void> {
  const postId = String(formData.get("postId") ?? "");
  if (!postId) redirect("/queue?note=missing");
  await approvePost(postId, "human:studio", "ui");
  redirect("/queue?note=approved");
}
