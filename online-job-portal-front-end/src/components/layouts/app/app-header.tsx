import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  FileText,
  GlobeIcon,
  LayoutGrid,
  LogOut,
  Menu,
  MoveLeft,
  Package,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Btn";

import logo from "@/assets/logo.png";
import { logout as logoutAction } from "@/features/auth/api/auth.slice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import { NotificationDropdown } from "@/components/shared/NotificationDropdown.tsx";
import { baseApi } from "@/redux/baseApi.ts";

// Role-based menu items
const getMenuItemsByRole = (role: string) => {
  switch (role) {
    case "recruiter":
      return [
        { icon: LayoutGrid, label: "Dashboard", path: "/recruiter/overview" },
        { icon: FileText, label: "Job Posts", path: "/recruiter/posts" },
        { icon: Users, label: "Applications", path: "/recruiter/applications" },
        { icon: Package, label: "Packages", path: "/recruiter/packages" },
        { icon: Settings, label: "Settings", path: "/recruiter/setting" },
      ];
    case "admin":
      return [
        { icon: LayoutGrid, label: "Dashboard", path: "/admin/dashboard" },
        { icon: Users, label: "Users", path: "/admin/users" },
        { icon: FileText, label: "Posts", path: "/admin/posts" },
        { icon: Bell, label: "Notifications", path: "/admin/notifications" },
        { icon: ShieldCheck, label: "Settings", path: "/admin/settings" },
      ];
    default:
      return [];
  }
};

// Component UserMenu with role-based items
const UserMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();
  const user = useAppSelector((state) => state.auth.user);

  const userName = user ? `${user.firstName} ${user.lastName}` : "User";
  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "U";

  const menuItems = user ? getMenuItemsByRole(user.role) : [];

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logoutAction());
      dispatch(baseApi.util.resetApiState()); // Clear RTK Query cache
      toast.success("Logged out successfully");
      navigate("/auth/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        onBlur={() => setIsMenuOpen(false)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={userName}
            className="w-8 h-8 rounded-full border-2 border-primary object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">{userInitials}</span>
          </div>
        )}
        <span className="hidden md:block font-medium text-sm text-gray-800">{userName}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-700 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isMenuOpen && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute right-0 top-full mt-2 w-56 bg-white border border-stroke rounded-lg shadow-xl z-50 overflow-hidden"
        >
          <nav className="p-2">
            {/* Role-based menu items */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {user?.role !== "job_seeker" && (
              <div className="h-px bg-stroke my-2" />
            )}

            {/* Logout Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              onMouseDown={(e) => e.preventDefault()}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 w-full text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get authentication state from Redux store
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = !!(user && token);

  // Check if recruiter on chat page
  const isRecruiterOnChat = user?.role === "recruiter" && location.pathname === "/chat";

  // Logout functionality for mobile menu
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();

  const handleMobileLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logoutAction());
      dispatch(baseApi.util.resetApiState()); // Clear RTK Query cache
      toast.success("Logged out successfully");
      setIsMenuOpen(false);
      navigate("/auth/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  const handleSectionScroll = (sectionId: string, event: React.MouseEvent) => {
    event.preventDefault();

    // Navigate to home page if not already there
    if (window.location.pathname === "/") {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate("/");
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }

    // Close mobile menu if open
    setIsMenuOpen(false);
  };

  const navTitles = [
    { title: "Home", href: "/", type: "route" as const },
    { title: "Job", href: "/#jobs", type: "section" as const, sectionId: "jobs" },
    { title: "About", href: "/#about", type: "section" as const, sectionId: "about" },
    { title: "Contact", href: "/#contact", type: "section" as const, sectionId: "contact" },
    { title: "Company", href: "/companies" },
  ];

  return (
    <div className="w-full fixed self-center top-6 z-50">
      <header className="bg-white w-[80%] xl:w-256 mx-auto py-3 px-6 rounded-xl shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 w-52 cursor-pointer">
            <div className="flex items-center h-9 w-auto">
              <img src={logo} alt="Logo" className="h-full w-full" />
            </div>
            <span className="font-default text-base text-primary font-bold">Job Portal</span>
          </Link>

          <div className="hidden lg:flex justify-between gap-10">
            {isRecruiterOnChat && (
              <button
                onClick={() => navigate("/recruiter/jobs")}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium cursor-pointer"
              >
                <MoveLeft className="w-4 h-4"/>
                Back to Dashboard
              </button>
            )}
            {!isAuthenticated && (
              <nav className="flex items-center gap-9">
                {navTitles.map((navItem) =>
                  navItem.type === "section" ? (
                    <a
                      key={navItem.title}
                      href={navItem.href}
                      onClick={(e) => handleSectionScroll(navItem.sectionId!, e)}
                      className="group relative font-bold text-sm font-default transition-all duration-300 text-text-blur cursor-pointer"
                    >
                      {navItem.title}
                      <span className="absolute left-0 -bottom-1 h-0.5 bg-primary transition-all duration-300 w-0 group-hover:w-full"></span>
                    </a>
                  ) : (
                    <NavLink
                      key={navItem.title}
                      to={navItem.href}
                      className={({ isActive }) =>
                        `group relative font-bold text-sm font-default transition-all duration-300 ${
                          isActive ? "text-primary" : "text-text-blur"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {navItem.title}
                          <span
                            className={`absolute left-0 -bottom-1 h-0.5 bg-primary transition-all duration-300 ${
                              isActive ? "w-full" : "w-0 group-hover:w-full"
                            }`}
                          ></span>
                        </>
                      )}
                    </NavLink>
                  )
                )}
              </nav>
            )}
            <div className="flex content-center items-center gap-3">
              <GlobeIcon className="flex w-6 h-6 hover:scale-120 cursor-pointer" />
              {isAuthenticated ? (
                <>
                  {/* ✅ THÊM NOTIFICATION DROPDOWN */}
                  <NotificationDropdown />
                  <UserMenu />
                </>
              ) : (
                <>
                  <Link to="/auth/sign-up">
                    <Button variant="primary">Sign up</Button>
                  </Link>
                  <Link to="/auth/sign-in">
                    <Button variant="default">Sign in</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 lg:hidden">
            <GlobeIcon className="w-6 h-6 hover:scale-120 cursor-pointer" />
            {/* ✅ THÊM NOTIFICATION CHO MOBILE */}
            {isAuthenticated && <NotificationDropdown />}
            <Button onClick={() => setIsMenuOpen((prev) => !prev)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {isMenuOpen && (
            <div className="absolute top-16 left-0 right-0 rounded-b-xl lg:hidden shadow-md bg-white">
              <nav className="flex flex-col text-center items-center py-4 gap-3">
                {isRecruiterOnChat && (
                  <>
                    <Button
                      onClick={() => {
                        navigate("/recruiter/jobs");
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-[calc(100%-32px)] flex items-center justify-center gap-2"
                    >
                      ← Back to Jobs
                    </Button>
                    <div className="w-full h-px bg-stroke my-2" />
                  </>
                )}
                {!isAuthenticated && navTitles.map((navItem) =>
                  navItem.type === "section" ? (
                    <a
                      key={navItem.title}
                      href={navItem.href}
                      onClick={(e) => handleSectionScroll(navItem.sectionId!, e)}
                      className="text-sm font-medium hover:text-primary px-4 py-2 cursor-pointer"
                    >
                      {navItem.title}
                    </a>
                  ) : (
                    <Link
                      key={navItem.title}
                      to={navItem.href}
                      className="text-sm font-medium hover:text-primary px-4 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {navItem.title}
                    </Link>
                  ),
                )}
                {isAuthenticated ? (
                  <>
                    {/* Role-based mobile menu items */}
                    {user &&
                      getMenuItemsByRole(user.role).map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="w-full px-4"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Button
                              variant="outline"
                              className="w-full flex items-center justify-center gap-2"
                            >
                              <Icon className="w-4 h-4" />
                              {item.label}
                            </Button>
                          </Link>
                        );
                      })}
                    {/* Logout button */}
                    <div className="w-full px-4">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                        onClick={handleMobileLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/auth/sign-up" className="w-full px-4">
                      <Button variant="primary" className="w-full">
                        Sign up
                      </Button>
                    </Link>
                    <Link to="/auth/sign-in" className="w-full px-4">
                      <Button variant="default" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
