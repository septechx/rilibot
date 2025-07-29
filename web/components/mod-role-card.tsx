"use client";

import React, { Suspense, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@nanostores/react";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  DefaultError,
} from "@tanstack/react-query";
import { useModRoleQuery } from "@/lib/queries";
import { Option } from "@/lib/utils";
import { useDashboardContext } from "@/lib/dashboard-context";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { DASH_URL } from "@/rilibot.config";

type ModRoleCardProps = {
  selectedGuild: string | null;
};

function useRolesQuery(props: { guildId: string | null }) {
  const query = useSuspenseQuery({
    queryKey: ["roles", props.guildId],
    queryFn: async () => {
      let res;

      if (props.guildId === null) {
        res = [];
      } else {
        res = await fetch(`${DASH_URL}/api/guild/roles`, {
          body: JSON.stringify({ guildId: props.guildId }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }).then(async (__res) => {
          if (__res.ok) {
            const body = await __res.json();
            return body.roles;
          }
          return [];
        });
      }

      return res;
    },
  });

  return [query.data as any[], query] as const;
}

function ModRoleCardContent({ selectedGuild }: ModRoleCardProps) {
  const queryClient = useQueryClient();
  const [roles] = useRolesQuery({ guildId: selectedGuild });
  const [rawModRole] = useModRoleQuery({ guildId: selectedGuild })!;
  const modRole = Option.fromJSON(rawModRole);
  const { $cardLock } = useDashboardContext();
  const cardLock = useStore($cardLock);

  const mutation = useMutation<void, DefaultError, string>({
    mutationFn: (newRoleId: string) =>
      fetch(`${DASH_URL}/api/guild/mod-role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: selectedGuild, roleId: newRoleId }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update mod role");
      }),

    onSuccess: (_, newRoleId) => {
      queryClient.invalidateQueries({ queryKey: ["modRole", selectedGuild] });

      const role: { name: string; color: number } = roles.find(
        (role) => role.id === newRoleId,
      );

      toast(
        <p>
          Moderator role has been updated to{" "}
          <span
            style={{
              color: `#${(role.color || 10070709).toString(16)}`,
            }}
          >
            {role.name}
          </span>
          .
        </p>,
      );
    },

    onError: () => {
      toast(<p className="text-red-600">Failed to update moderator role.</p>);
    },
  });

  const handleRoleChange = useCallback(
    (newValue: string) => {
      mutation.mutate(newValue);
    },
    [mutation],
  );

  return (
    <Card aria-disabled={cardLock}>
      <CardHeader className="w-full max-w-sm">
        <CardTitle className="text-sm font-medium">Moderator role</CardTitle>
        <CardDescription>
          Select a role to allow to run privileged commands.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex h-12 flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <Select
            value={modRole.isSome() ? modRole.unwrap() : undefined}
            onValueChange={handleRoleChange}
            disabled={cardLock || mutation.isPending}
          >
            <SelectTrigger className="w-48 cursor-pointer">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                {roles
                  .toSorted((a, b) => a.name.localeCompare(b.name))
                  .map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <Role role={role} />
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function Role(props: { role: { name: string; color: number } }) {
  return (
    <>
      <span
        style={{
          background: `#${(props.role.color || 10070709).toString(16)}`,
        }}
        className="mr-2 inline-block h-3 w-3 rounded-full"
      />
      {props.role.name}
    </>
  );
}

function FallbackCard() {
  return (
    <Card>
      <CardHeader className="w-full max-w-sm">
        <CardTitle className="text-sm font-medium">Moderator role</CardTitle>
        <CardDescription>
          Select a role to allow to run privileged commands.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-12 flex-col items-center space-y-4">
        <Skeleton className="h-9 w-48" />
      </CardContent>
    </Card>
  );
}

export function ModRoleCard({ selectedGuild }: ModRoleCardProps) {
  if (!selectedGuild) {
    return <FallbackCard />;
  }

  return (
    <Suspense fallback={<FallbackCard />}>
      <ModRoleCardContent selectedGuild={selectedGuild} />
    </Suspense>
  );
}
