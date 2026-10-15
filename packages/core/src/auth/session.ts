import { and, eq, gt } from "drizzle-orm";
import { getDb } from "../db/client";
import { sessions, users } from "../db/schema";
import { newOpaqueToken, sha256 } from "../crypto";
import { recordEvent } from "../audit";

export const SESSION_COOKIE = "centum_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

/** Creates a session row and returns the raw token to put in the cookie. */
export async function createSession(userId: string, userAgent?: string): Promise<{ token: string; expiresAt: Date }> {
  const db = await getDb();
  const token = newOpaqueToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    userId,
    tokenHash: sha256(token),
    userAgent: userAgent?.slice(0, 300) ?? null,
    expiresAt,
  });
  return { token, expiresAt };
}

export async function getSessionUser(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const db = await getDb();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, sha256(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  const db = await getDb();
  await db.delete(sessions).where(eq(sessions.tokenHash, sha256(token)));
}

export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const { verifyPassword } = await import("../crypto");
  const db = await getDb();
  const rows = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  const user = rows[0];
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) {
    await recordEvent({ type: "auth.login_failed", actor: "system", subject: user.email });
    return null;
  }
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await recordEvent({ type: "auth.login", actor: `human:${user.name || user.email}`, subject: user.email });
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};
