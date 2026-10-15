import { NextResponse, type NextRequest } from "next/server";
import { connectMockAccount, isPlatformConfigured, startOAuth, type OAuthPlatform } from "@centum/core";

export const dynamic = "force-dynamic";

const VALID: OAuthPlatform[] = ["instagram", "youtube", "facebook"];

/**
 * GET /api/oauth/<platform>/start — the "Connect" button.
 *
 * Live: redirects to the platform's consent screen with a sealed state token.
 * Mock (no credentials yet, or PROVIDER_MODE=mock): connects a demo account
 * through the same service so the studio stays fully clickable.
 *
 * Add `?probe=1` for a dry run: it reports what a click WOULD do and connects
 * nothing. Used by `npm run smoke:app` and handy after editing .env, because a
 * health check should never mutate the database it is checking.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ platform: string }> }) {
  const { platform } = await ctx.params;
  if (!VALID.includes(platform as OAuthPlatform)) return redirect(`/accounts?error=${encodeURIComponent("Unknown platform.")}`);
  const target = platform as OAuthPlatform;

  const brandId = request.nextUrl.searchParams.get("brand");
  // The redirect_uri must match what the platform has registered, so it always
  // comes from the URL the browser is actually using (preview host, localhost or
  // the VPS domain) and is then sealed into the state token.
  const origin = `${proto(request)}://${host(request)}`;

  const result = await startOAuth({
    platform: target,
    brandId,
    redirectUri: `${origin}/api/oauth/${target}/callback`,
  });

  if (request.nextUrl.searchParams.get("probe") === "1") {
    return NextResponse.json({
      ok: true,
      platform: target,
      mode: result.mode,
      wouldConnect: result.mode === "mock",
      detail: result.mode === "live" ? "would redirect to the platform consent screen" : result.reason,
    });
  }

  if (result.mode === "live") return NextResponse.redirect(result.url);

  const account = await connectMockAccount({ platform: target, brandId });
  return redirect(
    `/accounts?note=${encodeURIComponent(`Connected ${account.handle} in mock mode — ${result.reason}. Real publishing needs credentials; see docs/setup.`)}`,
  );
}

function proto(request: NextRequest): string {
  return request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "http";
}

function host(request: NextRequest): string {
  return request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
}

function redirect(path: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { location: path } });
}

// Exported for the pages that render the same "is this configured?" logic.
export { isPlatformConfigured };
