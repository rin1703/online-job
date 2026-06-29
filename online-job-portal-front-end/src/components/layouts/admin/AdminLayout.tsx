import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

import PackagesManagement from "@/pages/admin/PackagesManagement";
import UsersManagement from "@/pages/admin/UsersManagement";
import PostsManagement from "@/pages/admin/PostsManagement";
import NotificationsManagement from "@/pages/admin/NotificationsManagement";
import { ReportsManagement } from "@/pages/admin/ReportsManagement.tsx";
import CompanyManagementPage from "@/pages/admin/CompanyManagementPage";
import RefundManagement from "@/pages/admin/RefundManagement";

const tabTitles = {
  users: "User Management",
  packages: "Package Management",
  posts: "Post Management",
  notifications: "Notifications",
  reports: "Reports",
  refunds: "Refund Management",
  companies: "Company Management",
};

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState("users");

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UsersManagement />;
      case "packages":
        return <PackagesManagement />;
      case "posts":
        return <PostsManagement />;
      case "reports":
        return <ReportsManagement />;
      case "notifications":
        return <NotificationsManagement />;
      case "refunds":
        return <RefundManagement />;
      case "companies":
        return <CompanyManagementPage />;
      default:
        return <UsersManagement />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          title={tabTitles[activeTab as keyof typeof tabTitles]}
          onTabChange={setActiveTab}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
