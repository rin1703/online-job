import { Outlet, useLocation } from "react-router";
import { useAppSelector } from "@/hooks/redux";

import AppHeader from "./app-header";
import AppFooter from "./AppFooter";
import TaskMenu from "../job-seeker/JobSeekerTaskMenu.tsx";

function AppLayout() { 
  const location = useLocation();
  // Get authentication state from Redux store
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = !!(user && token);
  
  // Check if current path is landing page
  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";
  
  // Check if user is recruiter
  const isRecruiter = user?.role === "recruiter";
  
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main>
        <Outlet />
      </main>
      {isAuthenticated && !isRecruiter && <TaskMenu />}
      {isLandingPage && <AppFooter />}
    </div>
  );
}

export default AppLayout;
