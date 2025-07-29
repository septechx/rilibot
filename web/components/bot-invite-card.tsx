import React, { Suspense, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useDashboardContext } from "@/lib/dashboard-context";
import { DASH_URL } from "@/rilibot.config";

type BotInviteCardProps = {
  selectedGuild: string | null;
};

function useHasBotQuery(props: { guildId: string | null }) {
  const query = useSuspenseQuery({
    queryKey: ["hasBot", props.guildId],
    queryFn: async () => {
      let res;

      if (!props.guildId) {
        res = false;
      } else {
        res = await fetch(`${DASH_URL}/api/guild/has-bot`, {
          body: JSON.stringify({ guildId: props.guildId }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }).then(async (__res) => {
          if (__res.ok) {
            const body = await __res.json();
            return body.hasBot;
          }
          return false;
        });
      }

      return res;
    },
  });

  return [query.data, query] as const;
}

function BotInviteCardContent({ selectedGuild }: BotInviteCardProps) {
  const [hasBot] = useHasBotQuery({ guildId: selectedGuild });
  const { $cardLock } = useDashboardContext();

  useEffect(() => {
    $cardLock.set(!hasBot);
  }, [hasBot]);

  const inviteUrl = selectedGuild
    ? `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!}&guild_id=${selectedGuild}`
    : "#";

  return (
    <Card>
      <CardHeader className="w-full max-w-sm">
        <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
        <CardDescription>
          Invite the bot if it's not in your server yet.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex h-12 flex-col items-center space-y-4">
        {selectedGuild && hasBot && (
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">
              Bot is already in this server
            </span>
          </div>
        )}

        {selectedGuild && !hasBot && (
          <Button asChild variant="link" className="mt-[-8px]">
            <a href={inviteUrl} target="_blank" rel="noreferrer">
              Add bot to server
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function FallbackCard() {
  return (
    <Card>
      <CardHeader className="w-full max-w-sm">
        <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
        <CardDescription>
          Invite the bot if it's not in your server yet.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex h-12 flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          <span className="text-muted-foreground text-sm">Checking...</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function BotInviteCard({ selectedGuild }: BotInviteCardProps) {
  if (!selectedGuild) {
    return <FallbackCard />;
  }

  return (
    <Suspense fallback={<FallbackCard />}>
      <BotInviteCardContent selectedGuild={selectedGuild} />
    </Suspense>
  );
}
