// src/components/layouts/job-seeker/SettingLayout.tsx
import { Outlet } from "react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import JobSeekerSidebar from "@/features/job-seeker/components/settings/JobSeekerSidebar.tsx";
import JobSeekerTaskMenu from "@/components/layouts/job-seeker/JobSeekerTaskMenu.tsx";

export default function SettingLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <JobSeekerSidebar />
        <main className="flex flex-col w-full h-full">
          <div className="bg-white p-4 w-full sticky top-0 z-10 flex-shrink-0">
            <SidebarTrigger />
          </div>
          <div className="flex-1 w-full overflow-hidden">
            <Outlet />
            <JobSeekerTaskMenu />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
