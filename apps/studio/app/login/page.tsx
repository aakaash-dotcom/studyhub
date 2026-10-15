import { redirect } from "next/navigation";
import { env } from "@centum/core";
import { LoginForm } from "./login-form";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect("/");
  const isDev = env().NODE_ENV !== "production";

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
          <LoginForm />
        </div>

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
