import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Code,
  FileText,
  FolderOpen,
  GraduationCap,
  LockKeyhole,
  Settings,
  User,
} from "lucide-react";

import { IconBox } from "@/components/ui/IconBox.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx";

import logo from "@/assets/logo.png";

const scrollSections = [
  { id: "account", title: "Account", icon: User },
  { id: "cv", title: "CV", icon: FileText },
  { id: "work-experience", title: "Work Experience", icon: Briefcase },
  { id: "education", title: "Education", icon: GraduationCap },
  { id: "projects", title: "Projects", icon: FolderOpen },
  { id: "skills", title: "Skills", icon: Code },
];

export default function JobSeekerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("account");
  const isSettingsPage = location.pathname === "/job-seeker/settings";
  // const isSecurityPage = location.pathname === '/job-seeker/settings/security';

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    // Navigate to settings page first if not already there
    if (!isSettingsPage) {
      navigate("/job-seeker/settings");
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveSection(sectionId);
        }
      }, 300);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  };

  // Detect active section on scroll
  useEffect(() => {
    if (!isSettingsPage) return;

    const handleScroll = () => {
      const container = document.getElementById("settings-content");
      if (!container) return;

      // const scrollTop = container.scrollTop;
      const containerTop = container.getBoundingClientRect().top;

      // Find which section is currently in view
      for (let i = scrollSections.length - 1; i >= 0; i--) {
        const section = scrollSections[i];
        const element = document.getElementById(section.id);
        if (element) {
          const elementTop = element.getBoundingClientRect().top;
          const relativeTop = elementTop - containerTop;

          // If section is at or above 200px from container top, it's active
          if (relativeTop <= 200) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    const container = document.getElementById("settings-content");
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [isSettingsPage]);

  return (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-fit w-fit hover:bg-inherit active:bg-inherit">
                <IconBox variant="default" className="hover:bg-default hover:text-white">
                  <Settings className="h-6 w-6" />
                </IconBox>
                <span className="text-black font-bold font-default text-2xl">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Scroll sections - only active on main settings page */}
                {scrollSections.map((section) => (
                  <SidebarMenuItem key={section.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-orange-100 ${
                        isSettingsPage && activeSection === section.id
                          ? "bg-orange-500 text-white"
                          : "text-gray-700 hover:text-orange-600"
                      }`}
                    >
                      <section.icon className="h-4 w-4" />
                      <span>{section.title}</span>
                    </button>
                  </SidebarMenuItem>
                ))}

                {/* Security - separate route */}
                <SidebarMenuItem>
                  <NavLink
                    to="/job-seeker/settings/security"
                    className={({ isActive }) =>
                      `flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-orange-100 ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : "text-gray-700 hover:text-orange-600"
                      }`
                    }
                  >
                    <LockKeyhole className="h-4 w-4" />
                    <span>Security</span>
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link to="/">
                <div className="flex items-center gap-3 w-52">
                  <div className="flex items-center h-9 w-auto">
                    <img src={logo} alt="Logo" className="h-full w-full" />
                  </div>

                  <span className="font-default text-base text-primary font-bold">Job Portal</span>
                </div>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
