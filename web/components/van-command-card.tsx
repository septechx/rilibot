"use client";

import React, { Suspense, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { useStore } from "@nanostores/react";
import { useDashboardContext } from "@/lib/dashboard-context";
import { useVanChanceQuery } from "@/hooks/use-van-chance-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DASH_URL } from "@/rilibot.config";
import { toast } from "sonner";

type CommandCardProps = {
  selectedGuild: string | null;
};

function CommandsCardContent({ selectedGuild }: CommandCardProps) {
  const { cardLock } = useDashboardContext();
  const $cardLock = useStore(cardLock);
  const queryClient = useQueryClient();
  const [chance] = useVanChanceQuery({ guildId: selectedGuild });

  const mutation = useMutation({
    mutationFn: async (newChance: number) => {
      const res = await fetch(`${DASH_URL}/api/guild/vans/chance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: selectedGuild, chance: newChance }),
      });

      if (!res.ok) {
        throw new Error("Failed to update van chance");
      }
    },
    onSuccess: (_, newChance) => {
      queryClient.invalidateQueries({
        queryKey: ["guild", selectedGuild, "van-chance"],
      });
      toast(<p>Van chance has been updated to {newChance}%.</p>);
    },
    onError: () => {
      toast(<p className="text-red-600">Failed to update van chance.</p>);
    },
  });

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChance = parseInt(event.target.value, 10);
      if (!isNaN(newChance) && newChance >= 1 && newChance <= 100) {
        mutation.mutate(newChance);
      }
    },
    [mutation],
  );

  return (
    <Card className="p-4" aria-disabled={$cardLock}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Van chance</h3>
            <p className="text-muted-foreground text-xs">
              Change the ban chance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="100"
            value={chance ?? 1}
            onChange={handleChange}
            className="bg-background h-6 w-16 rounded border px-2 text-xs"
            disabled={$cardLock || mutation.isPending}
          />
          <span className="text-muted-foreground text-xs">%</span>
        </div>
      </div>
    </Card>
  );
}

function FallbackCard() {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Van chance</h3>
            <p className="text-muted-foreground text-xs">
              Change the ban chance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="100"
            defaultValue="1"
            className="bg-background h-6 w-16 rounded border px-2 text-xs"
            disabled
          />
          <span className="text-muted-foreground text-xs">%</span>
        </div>
      </div>
    </Card>
  );
}

export function VanCommandCard({ selectedGuild }: CommandCardProps) {
  if (!selectedGuild) {
    return <FallbackCard />;
  }

  return (
    <Suspense fallback={<FallbackCard />}>
      <CommandsCardContent selectedGuild={selectedGuild} />
    </Suspense>
  );
}
