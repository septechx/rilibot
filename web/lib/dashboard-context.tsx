"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { atom } from "nanostores";
import { DashboardContextType, DiscordGuild } from "./types";
import { canManageGuild } from "./auth";
import { DASH_URL } from "@/rilibot.config";
import { useQuery } from "@tanstack/react-query";

export const cardLock = atom<boolean>(true);

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);

  const {
    isLoading: loadingGuilds,
    error: guildsError,
    data: guildsData,
    isSuccess: guildsSuccess,
  } = useQuery<{ guilds: DiscordGuild[]; user: any }>({
    queryKey: ["guilds"],
    queryFn: () =>
      fetch(`${DASH_URL}/api/user/guilds`).then((res) => res.json()),
  });

  useEffect(() => {
    if (guildsSuccess && guildsData?.guilds) {
      const manageables = guildsData.guilds.filter(canManageGuild);
      setSelectedGuild(manageables.length ? manageables[0].id : null);
    }
  }, [guildsSuccess]);

  if (guildsError) {
    console.error("Dashboard loading error:", guildsError);
  }

  const contextValue: DashboardContextType = {
    guilds: guildsData?.guilds?.filter(canManageGuild) || null,
    user: guildsData?.user,
    selectedGuild,
    setSelectedGuild,
    loading: loadingGuilds,
    cardLock,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error(
      "useDashboardContext must be used within DashboardProvider",
    );
  return ctx;
}
