import { DashboardContent } from "@/components/dashboard-content";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardProvider } from "@/lib/dashboard-context";

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardContent />
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  );
}
