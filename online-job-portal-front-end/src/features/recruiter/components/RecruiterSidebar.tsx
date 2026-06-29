import logo from "@/assets/logo.png";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutGrid,
  FileText,
  Package,
  UserPlus,
  Bell,
  Calendar,
  MessageCircle,
  BriefcaseBusiness,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  icon: LucideIcon;
  path: string;
}

const platformItems: NavItem[] = [
  {
    title: "Overview",
    icon: LayoutGrid,
    path: "/recruiter/overview",
  },
  {
    title: "Job Management",
    icon: FileText,
    path: "/recruiter/jobs",
  },
  {
    title: "Company Management",
    icon: BriefcaseBusiness,
    path: "/recruiter/companies",
  },
  {
    title: "Messenger",
    icon: MessageCircle,
    path: "/chat",
  },
  {
    title: "Package Management",
    icon: Package,
    path: "/recruiter/packages",
  },
  {
    title: "Application Management",
    icon: UserPlus,
    path: "/recruiter/applications",
  },
  {
    title: "Interview Management",
    icon: Calendar,
    path: "/recruiter/interviews",
  },

  {
    title: "Notifications",
    icon: Bell,
    path: "/recruiter/notifications",
  },
];

export default function RecruiterSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50 bg-card shadow-sm z-30"
      style={
        {
          "--sidebar-width": "240px",
          "--sidebar-width-icon": "80px",
        } as React.CSSProperties
      }
    >
      <SidebarHeader className="h-16 flex justify-center items-center border-b border-border/40 px-6">
        <Link
          to="/"
          className="flex items-center gap-3 group transition-opacity hover:opacity-90 w-full overflow-hidden"
        >
          <div className="flex items-center justify-center min-w-8 h-8 w-8 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <img src={logo} alt="Logo" className="h-5 w-5 object-contain" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-foreground tracking-tight truncate">
              Job Portal
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              <TooltipProvider delayDuration={0}>
                {platformItems.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className={isCollapsed ? "flex justify-center" : ""}
                  >
                    <NavLink to={item.path} className="w-full flex justify-center">
                      {({ isActive }) => (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              className={`
                                ${isCollapsed ? "w-12 h-12 !p-0" : "w-full h-11 px-3"}
                                flex items-center justify-center
                                transition-all duration-200 rounded-lg group
                                ${
                                  isActive
                                    ? "bg-primary text-primary-foreground shadow-md font-semibold"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                }
                              `}
                            >
                              <span
                                className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3 justify-start w-full"}`}
                              >
                                <item.icon
                                  className={`h-5 w-5 ${isCollapsed ? "" : "min-w-[20px]"} transition-transform duration-200 ${
                                    isActive ? "" : "opacity-70 group-hover:opacity-100"
                                  }`}
                                />
                                {!isCollapsed && (
                                  <span className="text-sm truncate">{item.title}</span>
                                )}
                              </span>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          {isCollapsed && (
                            <TooltipContent side="right" className="font-medium">
                              {item.title}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
