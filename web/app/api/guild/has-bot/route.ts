import { authorize } from "@/lib/auth";
import { validateToken } from "@/lib/crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("refresh_token")?.value;
  const accessToken = cookieStore.get("access_token")?.value;
  const encryptedToken = cookieStore.get("api_token")?.value;
  const iv = cookieStore.get("iv")?.value;
  const { guildId } = await request.json();
  const authorized = await authorize(guildId, accessToken ?? "");

  if (
    !token ||
    !encryptedToken ||
    !iv ||
    !authorized ||
    !accessToken ||
    !validateToken(encryptedToken, iv, token)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!guildId) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!}`,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN!}`,
      },
      method: "GET",
    },
  );

  switch (res.status) {
    case 200:
      return NextResponse.json({ hasBot: true }, { status: 200 });
    case 404:
      return NextResponse.json({ hasBot: false }, { status: 200 });
    default:
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
  }
}
