"use client";

import { useMemo, useState } from "react";
import { Eye, Filter, Search } from "lucide-react";
import {
  useGetReportsQuery,
  useGetReportStatisticsQuery,
} from "@/redux/features/reports/reportApi";
import { Label } from "@radix-ui/react-label";
import ReportDetailModal from "./ReportDetailModal.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { ButtonLowercase } from "@/components/ui/button-lowercase.tsx";

const REPORT_TYPE_LABELS = {
  job: "Job Report",
  user: "User Report",
};

const STATUS_LABELS = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  reviewing: { label: "Reviewing", color: "bg-blue-100 text-blue-800" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
};

export function ReportsManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "reviewing" | "resolved" | "rejected" | ""
  >("pending");
  const [typeFilter, setTypeFilter] = useState<"job" | "user" | "">("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch reports
  const { data: reportsData, isLoading: reportsLoading } = useGetReportsQuery(
    {
      status: statusFilter || undefined,
      page: currentPage,
      limit: 10,
      type: typeFilter || undefined,
    } as any,
    { skip: false },
  );

  // Fetch statistics
  const { data: statsData } = useGetReportStatisticsQuery();

  const reports = reportsData?.reports || [];
  const totalPages = reportsData?.totalPages || 1;
  const total = reportsData?.total || 0;

  // Filter reports by search
  const filteredReports = useMemo(() => {
    if (!searchTerm.trim()) return reports;

    const keyword = searchTerm.toLowerCase();
    return reports.filter(
      (report) =>
        report.reporter.name.toLowerCase().includes(keyword) ||
        report.reporter.email.toLowerCase().includes(keyword) ||
        report.reason.toLowerCase().includes(keyword) ||
        report.description.toLowerCase().includes(keyword),
    );
  }, [reports, searchTerm]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setTypeFilter("");
    setCurrentPage(1);
  };

  const handleOpenReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReportId(null);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col ">
      <div className=" h-screen">
        {/* Statistics */}
        {statsData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-600 text-sm">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statsData.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{statsData.pending}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-600 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{statsData.resolved}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{statsData.rejected}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Search</Label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Name, email, reason..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value as "pending" | "reviewing" | "resolved" | "rejected" | "",
                  );
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Report Type</Label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as "job" | "user" | "");
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
              >
                <option value="">All Types</option>
                <option value="job">Job Report</option>
                <option value="user">User Report</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <ButtonLowercase
                variant={"orange"}
                onClick={handleResetFilters}
                className="w-full px-4 py-2  rounded-lg font-900 text-lg transition"
              >
                Reset
              </ButtonLowercase>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {reportsLoading ? (
            <div className="p-8 text-center text-gray-600">
              <p>Loading data...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p>No reports found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50 border-b border-gray-200">
                    <TableRow>
                      <TableHead className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Type
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Reporter
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Reason
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </TableHead>
                      <TableHead className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Date
                      </TableHead>
                      <TableHead className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <TableRow key={report._id} className="hover:bg-gray-50 transition">
                        <TableCell className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              report.reportType === "job"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {REPORT_TYPE_LABELS[report.reportType]}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{report.reporter.name}</p>
                            <p className="text-sm text-gray-600">{report.reporter.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <p className="text-sm text-gray-700 truncate max-w-xs">{report.reason}</p>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              STATUS_LABELS[report.status].color
                            }`}
                          >
                            {STATUS_LABELS[report.status].label}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-600">
                          {new Date(report.createdAt).toLocaleDateString("en-US")}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleOpenReport(report._id)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition text-sm font-medium"
                          >
                            <Eye size={16} />
                            Details
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredReports.length} of {total} reports
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium transition"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg font-medium transition ${
                          currentPage === page
                            ? "bg-orange-500 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Report Detail Modal */}
        {selectedReportId && (
          <ReportDetailModal
            reportId={selectedReportId}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}
