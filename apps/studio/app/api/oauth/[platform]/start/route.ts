import { NextResponse, type NextRequest } from "next/server";
import { connectMockAccount, isPlatformConfigured, startOAuth, type OAuthPlatform } from "@centum/core";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const VALID: OAuthPlatform[] = ["instagram", "youtube", "facebook"];

/**
 * GET /api/oauth/<platform>/start — the "Connect" button.
 *
 * Live: redirects to the platform's consent screen with a sealed state token.
 * Mock (no credentials yet, or PROVIDER_MODE=mock): connects a demo account
 * through the same service so the studio stays fully clickable.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ platform: string }> }) {
  const user = await currentUser();
  if (!user) return redirect("/login");

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
