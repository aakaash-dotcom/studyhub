import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { accounts } from "../db/schema";
import { decryptSecret, encryptSecret } from "../crypto";
import { recordEvent } from "../audit";
import type { AccountState, AuthPath, Platform } from "../constants";
import { DEFAULT_POSTING_WINDOWS, DEFAULT_TIMEZONE } from "../constants";

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

/** Everything the UI needs — never includes tokens. */
export type SafeAccount = Omit<Account, "accessTokenEnc" | "refreshTokenEnc"> & {
  hasToken: boolean;
  tokenExpiresInDays: number | null;
};

export function toSafeAccount(account: Account): SafeAccount {
  const { accessTokenEnc, refreshTokenEnc, ...rest } = account;
  return {
    ...rest,
    hasToken: Boolean(accessTokenEnc),
    tokenExpiresInDays: account.expiresAt
      ? Math.round((account.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : null,
  };
}

export async function listAccounts(): Promise<Account[]> {
  const db = await getDb();
  return db.select().from(accounts).orderBy(asc(accounts.platform), asc(accounts.handle));
}

export async function listSafeAccounts(): Promise<SafeAccount[]> {
  return (await listAccounts()).map(toSafeAccount);
}

export async function getAccount(id: string): Promise<Account | null> {
  const db = await getDb();
  const rows = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function findAccount(platform: Platform, platformAccountId: string): Promise<Account | null> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.platform, platform), eq(accounts.platformAccountId, platformAccountId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createAccount(input: {
  platform: Platform;
  authPath: AuthPath;
  platformAccountId: string;
  handle?: string;
  displayName?: string;
  brandId?: string | null;
  accessToken?: string;
  refreshToken?: string;
  scopes?: string[];
  expiresAt?: Date | null;
  postingWindows?: string[];
  dailyCap?: number;
  language?: string;
  timezone?: string;
}): Promise<Account> {
  const db = await getDb();
  const rows = await db
    .insert(accounts)
    .values({
      platform: input.platform,
      authPath: input.authPath,
      platformAccountId: input.platformAccountId,
      handle: input.handle ?? "",
      displayName: input.displayName ?? "",
      brandId: input.brandId ?? null,
      accessTokenEnc: input.accessToken ? encryptSecret(input.accessToken) : null,
      refreshTokenEnc: input.refreshToken ? encryptSecret(input.refreshToken) : null,
      scopes: input.scopes ?? [],
      expiresAt: input.expiresAt ?? null,
      postingWindows: input.postingWindows ?? DEFAULT_POSTING_WINDOWS,
      dailyCap: input.dailyCap ?? 10,
      language: input.language ?? "ta",
      timezone: input.timezone ?? DEFAULT_TIMEZONE,
    })
    .onConflictDoUpdate({
      target: [accounts.platform, accounts.platformAccountId],
      set: {
        handle: input.handle ?? "",
        displayName: input.displayName ?? "",
        accessTokenEnc: input.accessToken ? encryptSecret(input.accessToken) : null,
        refreshTokenEnc: input.refreshToken ? encryptSecret(input.refreshToken) : null,
        scopes: input.scopes ?? [],
        expiresAt: input.expiresAt ?? null,
        status: "connected",
        lastRefreshAt: new Date(),
        lastError: null,
        updatedAt: new Date(),
      },
    })
    .returning();
  const account = rows[0]!;
  await recordEvent({
    type: "account.connected",
    subject: account.id,
    payload: { platform: account.platform, handle: account.handle, brandId: account.brandId },
  });
  return account;
}

export async function updateAccount(id: string, patch: Partial<NewAccount>): Promise<Account | null> {
  const db = await getDb();
  const rows = await db
    .update(accounts)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(accounts.id, id))
    .returning();
  if (rows[0])
    await recordEvent({ type: "account.updated", subject: id, payload: { fields: Object.keys(patch) } });
  return rows[0] ?? null;
}

export async function setAccountStatus(id: string, status: AccountState, lastError?: string | null): Promise<void> {
  const db = await getDb();
  await db
    .update(accounts)
    .set({ status, lastError: lastError ?? null, updatedAt: new Date() })
    .where(eq(accounts.id, id));
  await recordEvent({ type: "account.status", subject: id, payload: { status, lastError } });
}

export async function disconnectAccount(id: string): Promise<void> {
  const db = await getDb();
  await db
    .update(accounts)
    .set({ status: "disabled", accessTokenEnc: null, refreshTokenEnc: null, updatedAt: new Date() })
    .where(eq(accounts.id, id));
  await recordEvent({ type: "account.disconnected", subject: id });
}

/** Decrypts the access token for a single publish attempt. Never log the result. */
export async function accessTokenFor(account: Account): Promise<string | null> {
  return account.accessTokenEnc ? decryptSecret(account.accessTokenEnc) : null;
}
