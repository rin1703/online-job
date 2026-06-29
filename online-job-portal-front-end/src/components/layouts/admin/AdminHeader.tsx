import { Bell, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/admin/button-custom";
import {  useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@/redux/features/auth/authApi.ts";
import { logout as logoutAction } from "@/features/auth/api/auth.slice.ts";
import { baseApi } from "@/redux/baseApi.ts";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux.ts";

interface AdminHeaderProps {
  title: string;
  onTabChange?: (tab: string) => void; 
}


export default function AdminHeader({ title, onTabChange }: AdminHeaderProps) {

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();
  
  const userName = user ? `${user.firstName} ${user.lastName}` : "Admin User";
  const userEmail = user?.email || "admin@jobportal.com";

  const handleAdminLogout = async () => {
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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Tìm kiếm..." className="pl-10 w-64" />
          </div> */}

          {/* Notifications */}
          <Button
            size="sm"
            className="relative"
            onClick={() => onTabChange && onTabChange("notifications")} 
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Admin Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/avatars/admin.png" alt="Admin" />
                  <AvatarFallback className="bg-orange-500 text-white">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleAdminLogout}>
                <LogOut className="w-4 h-4 mr-2 text-red-600" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
