"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { atom } from "nanostores";
import { DashboardContextType, DiscordGuild, DiscordUser } from "./types";
import { canManageGuild } from "./auth";
import { url } from "./consts";

const $cardLock = atom<boolean>(true);

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

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
      const response = await fetch(`${url}/api/user/guilds`);
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
