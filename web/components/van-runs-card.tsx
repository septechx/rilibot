"use client";

import React, { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useStore } from "@nanostores/react";
import { useDashboardContext } from "@/lib/dashboard-context";
import { Users } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { DASH_URL } from "@/rilibot.config";
import { useSuspenseQuery } from "@tanstack/react-query";

type CommandCardProps = {
  selectedGuild: string | null;
};

function useVansQuery(props: { guildId: string | null }) {
  const query = useSuspenseQuery({
    queryKey: ["guild", props.guildId, "vans"],
    queryFn: async () => {
      if (!props.guildId) return 0;

      const res = await fetch(`${DASH_URL}/api/guild/vans/runs`, {
        body: JSON.stringify({ guildId: props.guildId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!res.ok) return 0;

      const data = await res.json();
      return data.runs;
    },
  });

  return [query.data as number, query] as const;
}

function CommandsCardContent({ selectedGuild }: CommandCardProps) {
  const [runs] = useVansQuery({ guildId: selectedGuild });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Vans</CardTitle>
        <Users className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{runs}</div>
      </CardContent>
    </Card>
  );
}

function FallbackCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Vans</CardTitle>
        <Users className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mt-2 h-9 w-24" />
      </CardContent>
    </Card>
  );
}

export function VanRunsCard({ selectedGuild }: CommandCardProps) {
  if (!selectedGuild) {
    return <FallbackCard />;
  }

  return (
    <Suspense fallback={<FallbackCard />}>
      <CommandsCardContent selectedGuild={selectedGuild} />
    </Suspense>
  );
}
