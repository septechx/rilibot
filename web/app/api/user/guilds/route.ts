import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateToken } from "@/lib/crypto";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const token = cookieStore.get("refresh_token")?.value;
  const encryptedToken = cookieStore.get("api_token")?.value;
  const iv = cookieStore.get("iv")?.value;

  if (
    !token ||
    !encryptedToken ||
    !iv ||
    !accessToken ||
    !validateToken(encryptedToken, iv, token)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 401 },
    );
  }

  const user = await userRes.json();

  const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!guildsRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch guilds" },
      { status: 401 },
    );
  }

  const guilds = await guildsRes.json();

  return NextResponse.json({ user, guilds });
}
