"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDashboardContext } from "@/lib/dashboard-context";
import { BotInviteCard } from "./bot-invite-card";
import { ModRoleCard } from "./mod-role-card";
import { VanCommandCard } from "./van-command-card";
import { VanRunsCard } from "./van-runs-card";

export function DashboardContent() {
  const { selectedGuild, guilds } = useDashboardContext();
  const selectedGuildName = guilds?.find((g) => g.id === selectedGuild)
    ?.name || <Skeleton className="ml-2 h-4 w-32" />;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 cursor-pointer" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedGuildName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <BotInviteCard selectedGuild={selectedGuild} />
          <ModRoleCard selectedGuild={selectedGuild} />
          <VanRunsCard selectedGuild={selectedGuild} />
        </div>
        <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <VanCommandCard selectedGuild={selectedGuild} />
        </div>
      </div>
    </>
  );
}
