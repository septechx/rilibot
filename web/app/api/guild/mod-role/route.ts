import { modRoles } from "@/db/schema";
import { authorize } from "@/lib/auth";
import { validateToken } from "@/lib/crypto";
import { db } from "@/lib/server/db";
import { eq } from "drizzle-orm";
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

  const rows = await db
    .select({ roleId: modRoles.roleId })
    .from(modRoles)
    .where(eq(modRoles.guildId, guildId))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { roleId } = rows[0];
  return NextResponse.json({ roleId }, { status: 200 });
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("refresh_token")?.value;
  const accessToken = cookieStore.get("access_token")?.value;
  const encryptedToken = cookieStore.get("api_token")?.value;
  const iv = cookieStore.get("iv")?.value;
  const { guildId, roleId } = await request.json();
  const authorized = await authorize(guildId, accessToken ?? "");

  if (
    !token ||
    !encryptedToken ||
    !iv ||
    !accessToken ||
    !authorized ||
    !validateToken(encryptedToken, iv, token)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!guildId || !roleId) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  await db.insert(modRoles).values({ guildId, roleId }).onConflictDoUpdate({
    target: modRoles.guildId,
    set: { roleId },
  });

  return NextResponse.json("OK", { status: 200 });
}
