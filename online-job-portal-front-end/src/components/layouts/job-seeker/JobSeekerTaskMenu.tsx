import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Briefcase, Settings, User, Heart, MessageSquare, Calendar, Flag, FileText, Building2 } from "lucide-react";

import { IconBox } from "@/components/ui/IconBox";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";

// 🚀 Định nghĩa type cho menu item cho rõ ràng
type MenuItem = {
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  id?: string; // dùng cho item có hash (#cv)
};

// ✅ Cập nhật các path cho đúng router + thêm Favorites
const menuItems: MenuItem[] = [
  { path: "/jobs", icon: Briefcase, label: "Jobs" },
  { path: "/companies", icon: Building2, label: "Companies" },
  { path: "/job-seeker/favorites", icon: Heart, label: "Favorites" },
  { path: "/job-seeker/interviews", icon: Calendar, label: "Interviews" },
  { path: "/chat", icon: MessageSquare, label: "Chat" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/job-seeker/applications", icon: FileText, label: "Applications" },
  { path: "/job-seeker/my-reports", icon: Flag, label: "Reports" },
  { path: "/job-seeker/settings", icon: Settings, label: "Settings" },
];

// Dùng path **không hash** để xác định có phải menu page hay không
const menuPaths = menuItems.map((item) => item.path.split("#")[0]);

// Key để lưu vào sessionStorage
const PREV_LOCATION_KEY = "prevJobSeekerLocation";

function JobSeekerTaskMenu() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);

  // Chỉ hiển thị cho job_seeker (ẩn với admin và recruiter)
  if (user?.role !== "job_seeker") return null;

  const isMenuPage = menuPaths.some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    // Nếu trang hiện tại KHÔNG thuộc menu -> lưu lại làm "trang trước đó"
    if (!isMenuPage) {
      sessionStorage.setItem(PREV_LOCATION_KEY, location.pathname + location.hash);
    }
  }, [location.pathname, location.hash, isMenuPage]);

  const handleNavigation = (path: string) => {
    const prevLocation = sessionStorage.getItem(PREV_LOCATION_KEY) || "/jobs";
    const fullCurrentPath = location.pathname + location.hash;

    // Nếu đang ở đúng trang (cả path + hash) -> back về trang trước
    if (fullCurrentPath === path) {
      navigate(prevLocation);
    } else {
      navigate(path);
    }
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-section",
        "sticky md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:h-fit md:w-fit md:rounded-xl md:border-0 md:shadow-lg",
      )}
    >
      <div className="mx-auto flex h-full items-center justify-around md:space-x-6 md:p-2">
        {menuItems.map((item) => {
          const [pathWithoutHash, hashFromPath] = item.path.split("#");

          const hasHash = Boolean(hashFromPath);
          const isActive = hasHash
            ? location.pathname === pathWithoutHash && location.hash === `#${hashFromPath}`
            : location.pathname.startsWith(pathWithoutHash);

          return (
            <IconBox
              key={item.path}
              type="button"
              variant="primary"
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "group inline-flex flex-col items-center justify-center text-black w-14 h-14 transition-all duration-300 overflow-visible",
                "md:bg-white/50 md:shadow-2xl md:hover:-translate-y-3 md:hover:scale-110 md:hover:shadow-xl",
                isActive ? "text-primary md:bg-primary md:text-white" : "hover:text-primary hover:md:text-white",
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium md:hidden">{item.label}</span>
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-black font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden md:block whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </IconBox>
          );
        })}
      </div>
    </nav>
  );
}

export default JobSeekerTaskMenu;
