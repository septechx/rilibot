import { fetchGuilds } from "./fetch-guilds";
import { DiscordGuild } from "./types";

export function canManageGuild(guild: DiscordGuild) {
  const permissions = BigInt(guild.permissions);
  const MANAGE_GUILD = BigInt(0x20);
  const ADMINISTRATOR = BigInt(0x8);
  return (
    guild.owner || (permissions & (MANAGE_GUILD | ADMINISTRATOR)) !== BigInt(0)
  );
}

export async function authorize(guildId: string, accessToken: string) {
  let guilds: DiscordGuild[] | undefined = undefined;

  // Discord's api isn't consistent at ALL so try 50 times to get the information
  for (let i = 0; i < 50; ++i) {
    try {
      guilds = await fetchGuilds(accessToken).then((res) => res.guilds);
      break;
    } catch {
      continue;
    }
  }

  if (!guilds) {
    return false;
  }

  return (
    guilds.filter(canManageGuild).filter((guild) => guild.id == guildId)
      .length === 1
  );
}
