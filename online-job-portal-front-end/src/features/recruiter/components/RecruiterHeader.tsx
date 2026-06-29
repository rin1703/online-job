import { Link, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CircleUser, LockKeyhole, LogOut, ChevronDown, Wallet } from "lucide-react";
import { useState } from "react";
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import { logout as logoutAction } from "@/features/auth/api/auth.slice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toast } from "sonner";
import { useGetWalletBalanceQuery } from "@/features/recruiter/api/recruiter.service";

export default function RecruiterHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();
  const user = useAppSelector((state) => state.auth.user);
  const { data: walletData } = useGetWalletBalanceQuery();

  const userName = user ? `${user.firstName} ${user.lastName}` : "Recruiter Name";
  const userEmail = user?.email || "recruiter@company.com";
  const walletBalance = walletData?.balance || 0;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logoutAction());
      toast.success("Logged out successfully");
      navigate("/auth/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <header className="bg-background/95 border-b border-border/40 sticky z-10 top-0  w-full shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 ml-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-accent rounded-md transition-colors" />
          <div className="hidden sm:block">
            <h2 className="font-semibold text-xl text-foreground tracking-tight">
              Recruiter Dashboard
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your recruitment process</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border/40 bg-card hover:bg-accent/50 transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <CircleUser className="w-5 h-5" />
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="font-medium text-sm text-foreground">{userName}</span>
              <span className="text-xs text-muted-foreground">{userEmail}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {isMenuOpen && (
            <div
              onMouseDown={(e) => e.preventDefault()}
              className="absolute right-0 top-full mt-2 w-72 bg-card border border-border/40 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="p-4 border-b border-border/40 bg-accent/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                    <CircleUser className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                <Link
                  to="/recruiter/settings/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <CircleUser className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Company Profile</p>
                    <p className="text-xs text-muted-foreground">Manage your company info</p>
                  </div>
                </Link>

                <Link
                  to="/companies"
                  className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <CircleUser className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Company List</p>
                    <p className="text-xs text-muted-foreground">List</p>
                  </div>
                </Link>

                <Link
                  to="/auth/forgot"
                  className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <LockKeyhole className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Change Password</p>
                    <p className="text-xs text-muted-foreground">Reset your password</p>
                  </div>
                </Link>

                <div
                  className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-accent transition-colors group cursor-default"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Wallet Balance</p>
                    <p className="text-xs text-muted-foreground">{walletBalance.toLocaleString()}đ</p>
                  </div>
                </div>

                <div className="h-px bg-border/40 my-2 mx-2" />

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-destructive/10 transition-colors w-full group cursor-pointer"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-destructive/10 text-destructive group-hover:bg-destructive/20 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-destructive">Logout</p>
                    <p className="text-xs text-destructive/70">Sign out of your account</p>
                  </div>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
