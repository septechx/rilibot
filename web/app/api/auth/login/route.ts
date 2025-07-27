import { url } from "@/lib/consts";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let state = request.cookies.get("state")?.value;

  if (!state) {
    return NextResponse.json("Bad request", { status: 400 });
  }

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
    redirect_uri: `${url}/api/auth/callback`,
    response_type: "code",
    prompt: "consent",
    scope: "identify guilds",
    state,
  });

  return NextResponse.redirect(
    `https://discord.com/oauth2/authorize?${params.toString()}`,
  );
}
