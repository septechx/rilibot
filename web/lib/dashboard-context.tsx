"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { atom } from "nanostores";

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

interface PrimaryGuild {
  identity_guild_id: string;
  identity_enabled: false;
  tag: string;
  badge: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  primary_guild: PrimaryGuild;
}

interface DashboardContextType {
  guilds: DiscordGuild[];
  user: DiscordUser | null;
  selectedGuild: string | null;
  setSelectedGuild: (id: string | null) => void;
  loading: boolean;
  $cardLock: typeof $cardLock;
}

const $cardLock = atom<boolean>(true);

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

function canManageGuild(guild: DiscordGuild) {
  const permissions = BigInt(guild.permissions);
  const MANAGE_GUILD = BigInt(0x20);
  const ADMINISTRATOR = BigInt(0x8);
  return (
    guild.owner || (permissions & (MANAGE_GUILD | ADMINISTRATOR)) !== BigInt(0)
  );
}

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/guilds");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        const managableGuilds = data.guilds.filter(canManageGuild);
        setGuilds(managableGuilds);
        if (managableGuilds.length > 0) {
          setSelectedGuild(managableGuilds[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        guilds,
        user,
        selectedGuild,
        setSelectedGuild,
        loading,
        $cardLock,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider",
    );
  return ctx;
}
