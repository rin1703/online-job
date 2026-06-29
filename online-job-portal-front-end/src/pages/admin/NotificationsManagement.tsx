import React, { useMemo, useState } from "react";

type UserRole = "JOBSEEKER" | "RECRUITER" | "ADMIN";
type NotificationTargetType = "ALL" | "ROLE" | "USER";

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  targetType: NotificationTargetType;
  targetRole?: UserRole;
  targetUserIds?: string[];
}



const NotificationsManagement: React.FC = () => {
  // filter
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // list (FE only)
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  // form gửi
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState<NotificationTargetType>("ALL");
  const [targetRole, setTargetRole] = useState<UserRole>("JOBSEEKER");
  const [targetUsers, setTargetUsers] = useState("");

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // search theo title + content
      if (search.trim()) {
        const kw = search.trim().toLowerCase();
        const okSearch =
          n.title.toLowerCase().includes(kw) ||
          n.content.toLowerCase().includes(kw);
        if (!okSearch) return false;
      }

      // filter theo role (role người nhận)
      if (roleFilter !== "ALL") {
        const receiveByRole =
          n.targetType === "ALL" ||
          (n.targetType === "ROLE" && n.targetRole === roleFilter);
        if (!receiveByRole) return false;
      }

      // filter theo ngày
      if (fromDate) {
        const from = new Date(fromDate);
        const created = new Date(n.createdAt);
        if (created < from) return false;
      }
      if (toDate) {
        const to = new Date(toDate);
        // cộng 1 ngày để include nguyên ngày toDate
        to.setHours(23, 59, 59, 999);
        const created = new Date(n.createdAt);
        if (created > to) return false;
      }

      return true;
    });
  }, [notifications, search, roleFilter, fromDate, toDate]);

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!title.trim() || !content.trim()) {
      setError("Please enter both title and content.");
      return;
    }

    const newNotif: NotificationItem = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      targetType,
    };

    if (targetType === "ROLE") {
      newNotif.targetRole = targetRole;
    }

    if (targetType === "USER") {
      const ids = targetUsers
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      if (!ids.length) {
        setError(
          "Please enter at least one userId / email when selecting specific users."
        );
        return;
      }
      newNotif.targetUserIds = ids;
    }

    setCreating(true);
    // giả lập delay gửi (FE only)
    setTimeout(() => {
      setNotifications((prev) => [newNotif, ...prev]);
      setCreating(false);
      setSuccessMsg("Notification sent successfully.");

      // reset form
      setTitle("");
      setContent("");
      setTargetType("ALL");
      setTargetUsers("");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Notifications Management
            </h1>
            <p className="text-sm text-gray-500">
              Only Admin can access this page to send & manage system-wide notifications.
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <section className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Search & Filter
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Search by name / title
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Filter by role
              </label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
              >
                <option value="ALL">All</option>
                <option value="JOBSEEKER">JobSeeker</option>
                <option value="RECRUITER">Recruiter</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                From date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                To date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* List */}
        <section className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Sent Notifications List
            </h2>
            <span className="text-xs text-gray-500">
              (Showing {filteredNotifications.length} notifications)
            </span>
          </div>

          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {!filteredNotifications.length && (
            <div className="text-sm text-gray-500">No notifications found.</div>
          )}

          <div className="mt-2 max-h-[380px] space-y-3 overflow-y-auto">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{n.title}</h3>
                  <span className="whitespace-nowrap text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{n.content}</p>
                <div className="pt-1 text-xs text-gray-500">
                  Sent to:{" "}
                  {n.targetType === "ALL" && "All System"}
                  {n.targetType === "ROLE" && `By Role: ${n.targetRole}`}
                  {n.targetType === "USER" && "Specific Users"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Form gửi */}
        <section className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Send New Notification
          </h2>

          {successMsg && (
            <div className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateNotification} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Title
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Content
              </label>
              <textarea
                className="w-full min-h-[100px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter notification content..."
              />
            </div>

            {/* Target */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Target Audience</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    value="ALL"
                    checked={targetType === "ALL"}
                    onChange={() => setTargetType("ALL")}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>All System</span>
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    value="ROLE"
                    checked={targetType === "ROLE"}
                    onChange={() => setTargetType("ROLE")}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>By Role</span>
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    value="USER"
                    checked={targetType === "USER"}
                    onChange={() => setTargetType("USER")}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Specific Users</span>
                </label>
              </div>
            </div>

            {targetType === "ROLE" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Select Role
                </label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as UserRole)}
                >
                  <option value="JOBSEEKER">JobSeeker</option>
                  <option value="RECRUITER">Recruiter</option>
                </select>
              </div>
            )}

            {targetType === "USER" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  User IDs / Emails (comma separated)
                </label>
                <textarea
                  className="w-full min-h-[80px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={targetUsers}
                  onChange={(e) => setTargetUsers(e.target.value)}
                  placeholder="e.g. user1@example.com, user2@example.com"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Sending..." : "Send Notification"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default NotificationsManagement;
