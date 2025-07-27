"use client";

import type * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Crown } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboardContext } from "@/lib/dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { guilds, user, selectedGuild, setSelectedGuild, loading } =
    useDashboardContext();
  const router = useRouter();

  const getServerIcon = (guild: any) => {
    if (guild.icon) {
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`;
    }
    return null;
  };

  const getUserAvatar = (user: any) => {
    if (user && user.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`;
    }
    return null;
  };

  const handleLogout = () => {
    document.cookie =
      "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax";
    document.cookie =
      "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax";
    router.push("/");
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5865F2]">
                <img
                  src="/beaver.png"
                  alt="logo"
                  className="h-full w-full rounded-lg object-cover"
                />
              </div>
              <span className="text-foreground font-semibold">
                Rilibot Dashboard
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your Servers </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                new Array(5).fill(0).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton className="w-full cursor-pointer justify-start">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="ml-2 h-4 w-32" />
                      {((i >= 0 && i < 3) || i === 4) && (
                        <Crown className="ml-auto h-3 w-3 text-yellow-500" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : guilds.length === 0 ? (
                <div className="text-muted-foreground px-2 py-4 text-sm">
                  No manageable servers found
                </div>
              ) : (
                guilds.map((guild) => (
                  <SidebarMenuItem key={guild.id}>
                    <SidebarMenuButton
                      onClick={() => setSelectedGuild(guild.id)}
                      isActive={selectedGuild === guild.id}
                      className="w-full cursor-pointer justify-start"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={getServerIcon(guild) || undefined} />
                        <AvatarFallback className="bg-[#5865F2] text-xs text-white">
                          {guild.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{guild.name} </span>
                      {guild.owner && (
                        <Crown className="ml-auto h-3 w-3 text-yellow-500" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                >
                  {!user ? (
                    <>
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <Skeleton className="mb-1 h-4 w-24" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={getUserAvatar(user)!} />
                        <AvatarFallback className="rounded-lg bg-[#5865F2] text-white">
                          {user!.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user.username}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          {`#${user.discriminator}`}
                        </span>
                      </div>
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
