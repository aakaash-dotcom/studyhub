import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, destroySession } from "@centum/core";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout — plain form endpoint, matching /api/auth/login. */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) await destroySession(token);

  // Relative Location — see the note in the login route.
  const response = new NextResponse(null, { status: 303, headers: { location: "/login" } });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
