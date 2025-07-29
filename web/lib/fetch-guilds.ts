const guildsCache = new Map<string, { data: any; expires: number }>();

export async function fetchGuilds(accessToken: string) {
  const cacheKey = accessToken;
  const now = Date.now();
  const cached = guildsCache.get(cacheKey);
  if (cached && cached.expires > now) {
    return cached.data;
  }

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userRes.ok) {
    throw new Error("Failed to fetch user info");
  }

  const user = await userRes.json();

  const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!guildsRes.ok) {
    throw new Error("Failed to fetch guilds");
  }

  const guilds = await guildsRes.json();

  const data = { user, guilds };
  guildsCache.set(cacheKey, { data, expires: now + 30_000 }); // cache for 30s
  return data;
}
