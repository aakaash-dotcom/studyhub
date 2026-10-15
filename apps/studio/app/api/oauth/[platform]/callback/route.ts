import { NextResponse, type NextRequest } from "next/server";
import { completeOAuth, log, type OAuthPlatform } from "@centum/core";

export const dynamic = "force-dynamic";

/**
 * GET /api/oauth/<platform>/callback — where the platform sends the user back.
 *
 * Never throws at the user: every failure becomes a readable note on /accounts,
 * because a dead end here looks like "the app is broken" when it is almost always
 * a missing tester invite, a wrong redirect URI or an unapproved scope.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ platform: string }> }) {
  const { platform } = await ctx.params;

  const params = request.nextUrl.searchParams;
  const platformError = params.get("error");
  if (platformError) {
    const description = params.get("error_description") ?? params.get("error_reason") ?? "";
    return redirect(`/accounts?error=${encodeURIComponent(`${platformError}: ${description}`.trim())}`);
  }

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) return redirect(`/accounts?error=${encodeURIComponent("The platform sent no authorization code.")}`);

  try {
    const account = await completeOAuth({ platform: platform as OAuthPlatform, code, state });
    return redirect(`/accounts?note=${encodeURIComponent(`Connected ${account.handle}.`)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error({ platform, message }, "oauth callback failed");
    return redirect(`/accounts?error=${encodeURIComponent(message)}`);
  }
}

function redirect(path: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { location: path } });
}
