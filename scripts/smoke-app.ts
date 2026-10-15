/**
 * `npm run smoke:app` — proves the studio has no door to get stuck behind.
 *
 * Every page and every route the human touches is requested with NO cookies at
 * all, exactly like a first-time visitor, and must answer 200 in one hop. This is
 * the check that would have caught the sign-in loop, and now it also guards the
 * decision to have no login page: if someone re-introduces a redirect to /login,
 * this fails immediately.
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const PAGES = ["/", "/accounts", "/compose", "/calendar", "/queue", "/media", "/settings"];

const results: string[] = [];
const check = (label: string, ok: boolean, detail = "") => {
  results.push(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  console.log(results.at(-1));
  if (!ok) process.exitCode = 1;
};

// 1. Pages load with no cookies and no redirect.
for (const path of PAGES) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const location = res.headers.get("location");
  check(
    `GET ${path}`.padEnd(18),
    res.status === 200,
    res.status === 200 ? "" : `${res.status}${location ? ` → ${location}` : ""}`,
  );
}

// 2. Nothing redirects anywhere else — that is how a login wall announces itself.
const home = await fetch(`${BASE}/`, { redirect: "manual" });
check("dashboard is not a redirect", home.status === 200, `status ${home.status}`);

// 3. The routes that used to form the login wall are gone, not merely hidden.
for (const path of ["/login", "/api/auth/login", "/api/auth/logout", "/api/auth/ping"]) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  check(`${path} removed`.padEnd(24), res.status === 404, `status ${res.status}`);
}

// 4. Connecting an account works unauthenticated (mock path).
const start = await fetch(`${BASE}/api/oauth/instagram/start`, { redirect: "manual" });
const location = start.headers.get("location") ?? "";
check(
  "Connect Instagram works with no session",
  start.status === 303 && !location.includes("/login"),
  `${start.status} → ${location.split("?")[0] || "(no redirect)"}`,
);

// 5. Health answers and reports the posture honestly.
const health = await fetch(`${BASE}/api/health`);
const body = (await health.json()) as { ok: boolean; auth?: string; providerMode?: string };
check("health ok", body.ok === true, `providerMode=${body.providerMode}`);
check("health reports auth as open", /open/i.test(body.auth ?? ""), body.auth);

console.log(results.every((r) => r.startsWith("✓")) ? "\n✓ STUDIO IS OPEN — no login, no cookie, no redirect" : "\n✗ SOMETHING IS IN THE WAY");
process.exit(process.exitCode ?? 0);
