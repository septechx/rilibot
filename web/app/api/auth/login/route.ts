import { CLIENT_ID, DASH_URL } from "@/rilibot.config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let state = request.cookies.get("state")?.value;

  if (!state) {
    return NextResponse.json("Bad request", { status: 400 });
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: `${DASH_URL}/api/auth/callback`,
    response_type: "code",
    prompt: "consent",
    scope: "identify guilds",
    state,
  });

  return NextResponse.redirect(
    `https://discord.com/oauth2/authorize?${params.toString()}`,
  );
}
