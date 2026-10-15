/**
 * `npm run smoke:login` — signs in exactly the way a browser does: plain form
 * POST to /api/auth/login, then reuses the returned cookie on the dashboard.
 *
 * Set PROXY_HOST / PROXY_ORIGIN to pretend to be the hosted preview (iframe +
 * https proxy headers) and verify the cross-site cookie posture.
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PROXY_HOST = process.env.PROXY_HOST ?? "localhost:3000";
const PROXY_ORIGIN = process.env.PROXY_ORIGIN ?? `http://${PROXY_HOST}`;
const https = PROXY_ORIGIN.startsWith("https");

const browserHeaders: Record<string, string> = {
  "user-agent": "Mozilla/5.0 (smoke-test) CentumStudio",
  origin: PROXY_ORIGIN,
  host: PROXY_HOST,
  "x-forwarded-proto": https ? "https" : "http",
  "sec-fetch-dest": "iframe",
  "sec-fetch-mode": "navigate",
};

const body = new URLSearchParams({
  email: process.env.ADMIN_EMAIL ?? "ravi@centum.local",
  password: process.env.ADMIN_PASSWORD ?? "centum-admin",
});

const login = await fetch(`${BASE}/api/auth/login`, {
  method: "POST",
  headers: { ...browserHeaders, "content-type": "application/x-www-form-urlencoded" },
  body,
  redirect: "manual",
});

const setCookie = login.headers.getSetCookie?.() ?? [];
const sessionCookie = setCookie.find((c) => c.startsWith("centum_session="));

console.log(`1. POST /api/auth/login        → ${login.status} → ${login.headers.get("location")}`);
console.log(`2. session cookie issued       → ${sessionCookie ? "yes" : "NO"}`);
if (sessionCookie) {
  console.log(`   attributes                  → ${sessionCookie.split(";").slice(1).map((a) => a.trim()).join("; ")}`);
}

const home = await fetch(`${BASE}/`, {
  headers: { ...browserHeaders, cookie: sessionCookie?.split(";")[0] ?? "" },
  redirect: "manual",
});
const dashboard = home.status === 200;

console.log(`3. GET / with that cookie      → ${home.status}${home.headers.get("location") ? ` → ${home.headers.get("location")}` : ""}`);
const location = login.headers.get("location") ?? "";
console.log(`4. redirect can't leave the host → ${location.startsWith("/") ? `yes (relative "${location}")` : `NO ("${location}")`}`);

for (const path of ["/compose", "/queue", "/accounts", "/calendar", "/media", "/settings"]) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...browserHeaders, cookie: sessionCookie?.split(";")[0] ?? "" },
    redirect: "manual",
  });
  console.log(`   ${path.padEnd(11)} ${res.status}${res.status === 200 ? "" : "  ← PROBLEM"}`);
  if (res.status !== 200) process.exitCode = 1;
}

// a wrong password must be refused and must NOT set a cookie
const bad = await fetch(`${BASE}/api/auth/login`, {
  method: "POST",
  headers: { ...browserHeaders, "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ email: "ravi@centum.local", password: "not-the-password" }),
  redirect: "manual",
});
const refused = !(bad.headers.getSetCookie?.() ?? []).some((c) => c.startsWith("centum_session="));
console.log(`5. wrong password              → ${bad.status} → ${bad.headers.get("location")} (no cookie: ${refused ? "yes" : "NO"})`);

const ok = dashboard && Boolean(sessionCookie) && refused && location.startsWith("/");
console.log(ok ? "\n✓ SIGN-IN WORKS — session survives the redirect, every page opens." : "\n✗ STILL BROKEN.");
process.exit(ok ? 0 : 1);
