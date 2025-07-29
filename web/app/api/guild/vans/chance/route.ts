import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { authorize } from "@/lib/auth";
import { validateToken } from "@/lib/crypto";
import { db } from "@/lib/server/db";
import { vanCommandData } from "@/db/schema";

export async function POST(request: NextRequest) {
    try {
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
            return NextResponse.json(
                { error: "Invalid parameters" },
                { status: 400 }
            );
        }

        const rows = await db
            .select({ chance: vanCommandData.chance })
            .from(vanCommandData)
            .where(eq(vanCommandData.guildId, guildId))
            .limit(1);

        if (rows.length === 0) {
            return NextResponse.json({ chance: 1 }, { status: 404 });
        }


        return NextResponse.json({ chance: rows[0].chance ?? 1 });
    } catch (error) {
        console.error("Error fetching van chance:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("refresh_token")?.value;
        const accessToken = cookieStore.get("access_token")?.value;
        const encryptedToken = cookieStore.get("api_token")?.value;
        const iv = cookieStore.get("iv")?.value;
        const { guildId, chance } = await request.json();
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

        if (!guildId || typeof chance !== "number" || chance < 1 || chance > 100) {
            return NextResponse.json(
                { error: "Invalid parameters" },
                { status: 400 }
            );
        }

        await db
            .insert(vanCommandData)
            .values({ guildId, chance })
            .onConflictDoUpdate({
                target: vanCommandData.guildId,
                set: { chance },
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating van chance:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
