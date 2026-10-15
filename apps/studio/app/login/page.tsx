import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, env } from "@centum/core";
import { LoginForm } from "./login-form";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  credentials: "That email and password don't match. Use the development sign-in details below.",
  missing: "Enter both your email and your password.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await currentUser();
  if (user) redirect("/");
  // A session cookie that no longer resolves means an expired or wiped session —
  // say so instead of silently showing a blank login form.
  const sessionExpired = Boolean((await cookies()).get(SESSION_COOKIE)?.value);
  const { error } = await searchParams;
  const isDev = env().NODE_ENV !== "production";

  // The hosted preview runs this page inside a cross-site iframe. Cookies work
  // there now (SameSite=None + Secure over https), but if a browser or privacy
  // extension refuses third-party cookies outright, sign-in cannot stick — so
  // tell people the one thing that always fixes it: open the app in its own tab.
  const requestHeaders = await headers();
  const embedded = requestHeaders.get("sec-fetch-dest") === "iframe";

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-base font-bold text-white">CS</span>
          <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Centum Studio</h1>
          <p className="max-w-[340px] text-[13px] text-muted">
            Plan, approve and publish across every Instagram page and YouTube channel — from one calendar.
          </p>
        </div>

        <div className="card p-6">
          {sessionExpired ? (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              Your session expired. Sign in again to continue.
            </p>
          ) : null}
          <LoginForm error={error ? (ERRORS[error] ?? "Sign-in failed. Try again.") : undefined} />
        </div>

        {embedded ? (
          <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[12px] text-sky-900">
            <p className="font-medium">Sign in bounces you straight back here?</p>
            <p className="mt-0.5">
              Your browser is refusing cookies inside this embedded frame (Safari and hardened privacy modes do that).
              Use Chrome or Edge, or allow cookies for this site, and it will stick. Opening this address in a plain tab
              can never work — the sandbox only serves it through the Arena preview panel, and it needs an access token
              a browser tab has no way to send.
            </p>
          </div>
        ) : null}

        {isDev ? (
          <div className="mt-4 rounded-xl border border-dashed border-line bg-white/70 px-4 py-3 text-[12px] text-muted">
            <p className="font-medium text-ink">Development sign-in</p>
            <p className="mt-0.5">
              {env().ADMIN_EMAIL} · {env().ADMIN_PASSWORD}
            </p>
            <p className="mt-1">Change these in <code className="rounded bg-slate-100 px-1">.env</code> before going live.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
