
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export function AppLayout() {
  return (
    <ThemeProvider defaultTheme="system">
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default AppLayout; // Adding default export as well for backward compatibility
