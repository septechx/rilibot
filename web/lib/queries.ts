import { useSuspenseQuery } from "@tanstack/react-query";
import { OptionJSON, Option } from "./utils";
import { url } from "./consts";

export function useModRoleQuery(props: { guildId: string | null }) {
  const query = useSuspenseQuery({
    queryKey: ["modRole", props.guildId],
    queryFn: async () => {
      let res: OptionJSON<string>;

      if (props.guildId === null) {
        res = Option.none<string>().toJSON();
      } else {
        res = await fetch(`${url}/api/guild/mod-role`, {
          body: JSON.stringify({ guildId: props.guildId }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        })
          .then(async (__res) => {
            if (__res.status === 200) {
              const body = await __res.json();
              return Option.some<string>(body.roleId!);
            }
            return Option.none<string>();
          })
          .then((opt) => opt.toJSON());
      }

      return res;
    },
  });

  return [query.data as OptionJSON<string>, query] as const;
}
