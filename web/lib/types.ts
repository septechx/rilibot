import { WritableAtom } from "nanostores";

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface PrimaryGuild {
  identity_guild_id: string;
  identity_enabled: false;
  tag: string;
  badge: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  primary_guild: PrimaryGuild;
}

export interface DashboardContextType {
  guilds: DiscordGuild[];
  user: DiscordUser | null;
  selectedGuild: string | null;
  setSelectedGuild: (id: string | null) => void;
  loading: boolean;
  $cardLock: WritableAtom<boolean>;
}
