import { authorize } from "@/lib/auth";
import { validateToken } from "@/lib/crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("refresh_token")?.value;
  const encryptedToken = cookieStore.get("api_token")?.value;
  const iv = cookieStore.get("iv")?.value;
  const { guildId } = await request.json();
  const authorized = await authorize(guildId);

  if (
    !token ||
    !encryptedToken ||
    !iv ||
    !authorized ||
    !validateToken(encryptedToken, iv, token)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!guildId) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const rolesRes = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/roles`,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN!}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    },
  );

  if (!rolesRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 401 },
    );
  }

  const roles = await rolesRes.json();

  return NextResponse.json({ roles }, { status: 200 });
}
