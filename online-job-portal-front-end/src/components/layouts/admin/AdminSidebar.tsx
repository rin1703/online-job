import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Users,
  Package,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  Wallet,
  Flag,
  Bell,
  BriefcaseBusiness,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/admin/button-custom";
// import { ButtonUppercase } from '@/components/ui/Btn';
// import { ButtonUppercase } from '@/components/ui/button';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  {
    id: "users",
    label: "User Management",
    icon: Users,
  },

  {
    id: "packages",
    label: "Package Management",
    icon: Package,
  },
  {
    id: "posts",
    label: "Post Management",
    icon: FileText,
  },
  {
    id: "refunds",
    label: "Refund Management",
    icon: Wallet,
  },
  {
    id: "reports",
    label: "Reports",
    icon: Flag,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "companies",
    label: "Company Management",
    icon: BriefcaseBusiness,
  },
];

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-orange-500" />
            <span className="font-bold text-xl text-gray-900">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10",
                  isActive && "bg-orange-500 hover:bg-orange-600 text-white",
                  !isActive && "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  collapsed && "px-2",
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">Job Portal Admin v1.0</div>
        </div>
      )}
    </div>
  );
}
