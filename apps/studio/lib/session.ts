import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, getSessionUser, type SessionUser } from "@centum/core";

/** Server-side session helpers. Every protected page calls requireUser(). */

export async function currentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return getSessionUser(store.get(SESSION_COOKIE)?.value);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
