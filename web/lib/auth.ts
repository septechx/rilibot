import { DiscordGuild } from "./types";

export function canManageGuild(guild: DiscordGuild) {
  const permissions = BigInt(guild.permissions);
  const MANAGE_GUILD = BigInt(0x20);
  const ADMINISTRATOR = BigInt(0x8);
  return (
    guild.owner || (permissions & (MANAGE_GUILD | ADMINISTRATOR)) !== BigInt(0)
  );
}

export async function authorize(guildId: string) {
  const response = await fetch("/api/user/guilds");
  if (!response.ok) {
    return false;
  }
  let data = await response.json();
  (data.guilds as DiscordGuild[])
    .filter(canManageGuild)
    .filter((guild) => guild.id == guildId).length === 1;
}
