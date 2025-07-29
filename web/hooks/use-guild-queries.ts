import { useQueryClient } from "@tanstack/react-query";
import { DASH_URL } from "@/rilibot.config";

export function useGuildQueries() {
  const queryClient = useQueryClient();

  const prefetchGuildData = async (guildId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["guild", guildId, "has-bot"],
        queryFn: () =>
          fetch(`${DASH_URL}/api/guild/has-bot`, {
            method: "POST",
            body: JSON.stringify({ guildId }),
          }).then((res) => res.json()),
      }),
      queryClient.prefetchQuery({
        queryKey: ["guild", guildId, "roles"],
        queryFn: async () => {
          const res = await fetch(`${DASH_URL}/api/guild/roles`, {
            method: "POST",
            body: JSON.stringify({ guildId }),
            headers: { "Content-Type": "application/json" },
          });
          
          if (!res.ok) return [];
          
          const data = await res.json();
          return Array.isArray(data.roles) ? data.roles : [];
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["guild", guildId, "mod-role"],
        queryFn: async () => {
          const res = await fetch(`${DASH_URL}/api/guild/mod-role`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guildId }),
          });
          
          if (res.status === 404) {
            return null;
          }

          if (!res.ok) {
            throw new Error("Failed to fetch mod role");
          }

          const data = await res.json();
          return data.roleId as string | null;
        },
      }),
    ]);
  };

  return { prefetchGuildData };
}