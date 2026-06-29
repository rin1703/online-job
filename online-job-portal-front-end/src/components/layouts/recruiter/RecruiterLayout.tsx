import { Outlet } from "react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import RecruiterSidebar from "@/features/recruiter/components/RecruiterSidebar";
import RecruiterHeader from "@/features/recruiter/components/RecruiterHeader";

export default function RecruiterLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full ">
        <RecruiterSidebar />
        <main className="flex flex-col w-full min-w-0 relative">
          <RecruiterHeader />
          <div className="w-full p-4 md:p-8 bg-gray-50 flex-1">
              <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
