export async function fetchGuilds(accessToken: string) {
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

  return { user, guilds };
}
