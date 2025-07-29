import { DASH_URL } from "@/rilibot.config";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useVanChanceQuery(props: { guildId: string | null }) {
  const query = useSuspenseQuery({
    queryKey: ["guild", props.guildId, "van-chance"],
    queryFn: async () => {
      if (!props.guildId) return null;

      const res = await fetch(`${DASH_URL}/api/guild/vans/chance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: props.guildId }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      return typeof data.chance === "number" ? data.chance : 1;
    },
  });

  return [query.data as number | null, query] as const;
}
