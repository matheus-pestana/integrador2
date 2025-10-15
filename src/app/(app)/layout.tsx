import AppHeader from "@/components/app-header";
import AppSidebar from "@/components/app-sidebar";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SegmentationProvider } from "@/context/segmentation-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SegmentationProvider>
      <SidebarProvider>
          <Sidebar>
            <AppSidebar />
          </Sidebar>
          <SidebarInset>
            <div className="flex flex-col h-full">
              <AppHeader />
              <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-background/95">
                  {children}
              </main>
            </div>
          </SidebarInset>
      </SidebarProvider>
    </SegmentationProvider>
  );
}
