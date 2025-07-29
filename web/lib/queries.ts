import { useSuspenseQuery } from "@tanstack/react-query";
import { DASH_URL } from "@/rilibot.config";

export function useModRoleQuery(props: { guildId: string | null }) {
  const query = useSuspenseQuery({
    queryKey: ["guild", props.guildId, "mod-role"],
    queryFn: async () => {
      if (props.guildId === null) {
        return null;
      }

      const response = await fetch(`${DASH_URL}/api/guild/mod-role`, {
        body: JSON.stringify({ guildId: props.guildId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (response.status === 200) {
        const body = await response.json();
        return body.roleId as string | null;
      }
      
      if (response.status === 404) {
        return null;
      }

      throw new Error("Failed to fetch mod role");
    },
  });

  return [query.data as string | null, query] as const;
}
