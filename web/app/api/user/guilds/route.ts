import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateToken } from "@/lib/crypto";
import { fetchGuilds } from "@/lib/fetch-guilds";

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

  let res: any;

  try {
    res = await fetchGuilds(accessToken);
  } catch (err) {
    return NextResponse.json(err, { status: 401 });
  }

  return NextResponse.json(res);
}
