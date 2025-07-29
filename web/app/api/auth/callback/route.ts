import { encryptToken } from "@/lib/crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let params = request.nextUrl.searchParams;
  let cookiesStrore = await cookies();

  let code = params.get("code");
  let state = params.get("state");
  let client_state = cookiesStrore.get("state")?.value;

  // Check that we got everything
  if (!client_state || !code || !state) {
    return NextResponse.json("Bad request", { status: 400 });
  }

  // If these don't match there probably was a CSRF attack
  if (client_state !== state) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  // Now we can exchange the code for a token
  const token_params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: `${process.env.NEXT_PUBLIC_URL!}/api/auth/callback`,
  });

  const basicAuth = Buffer.from(
    `${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!}:${process.env.DISCORD_CLIENT_SECRET!}`,
  ).toString("base64");

  const token = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: token_params.toString(),
  });

  let { access_token, refresh_token, expires_in } = await token.json();

  // This should never happen
  if (!access_token || !refresh_token) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  // Generate signature so that we can validate api calls
  const apiSecret = process.env.API_SECRET!;
  const { encryptedToken, iv } = encryptToken(refresh_token, apiSecret);

  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_URL!}/dashboard`,
  );
  response.headers.append(
    "Set-Cookie",
    `access_token=${access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${expires_in}`,
  );
  response.headers.append(
    "Set-Cookie",
    `refresh_token=${refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${
      60 * 60 * 24 * 30
    }`,
  );
  response.headers.append(
    "Set-Cookie",
    `api_token=${encryptedToken}; Path=/; HttpOnly; Secure; SameSite=Lax;  Max-Age=${
      60 * 60 * 24 * 30
    }`,
  );
  response.headers.append(
    "Set-Cookie",
    `iv=${iv}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${
      60 * 60 * 24 * 30
    }`,
  );
  return response;
}
