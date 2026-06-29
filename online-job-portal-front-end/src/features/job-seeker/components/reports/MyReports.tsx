"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { useGetMyReportsQuery } from "@/redux/features/reports/reportApi";

const REPORT_TYPE_LABELS = {
  job: "Report Job",
  user: "Report User",
};

const STATUS_LABELS = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  reviewing: {
    label: "Reviewing",
    color: "bg-blue-100 text-blue-800",
    icon: AlertCircle,
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

export default function MyReports() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: reportsData, isLoading } = useGetMyReportsQuery({
    page: currentPage,
    limit: 10,
  });

  const reports = reportsData?.reports || [];
  const totalPages = reportsData?.totalPages || 1;
  const total = reportsData?.total || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 mt-20 rounded-2xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading Data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {" "}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#F97A00_40%,#FFFFFF_40%)] "
      />
      <div className="min-h-screen bg-gray-50 p-6 mt-32 rounded-2xl mx-auto max-w-7xl">
        <div className="">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-600 mt-2">View the list of reports you have submitted</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-600 text-sm">Total report</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {reports.filter((r) => r.status === "pending").length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-600 text-sm">Processed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {reports.filter((r) => r.status === "resolved" || r.status === "rejected").length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-600 text-sm">Under Review</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {reports.filter((r) => r.status === "reviewing").length}
              </p>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports yet</h3>
                <p className="text-gray-600">
                  You haven't submitted any reports. If you encounter invalid content, please report it to help
                  us improve.
                </p>
              </div>
            ) : (
              reports.map((report) => {
                const StatusIcon = STATUS_LABELS[report.status].icon;

                return (
                  <div
                    key={report._id}
                    className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              report.reportType === "job"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {REPORT_TYPE_LABELS[report.reportType]}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              STATUS_LABELS[report.status].color
                            }`}
                          >
                            <StatusIcon  />
                            {STATUS_LABELS[report.status].label}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {report.reason}
                        </h3>
                        <p className="text-gray-700 mb-3">{report.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">
                              <span className="font-medium">Type:</span>{" "}
                              {report.reportType === "job" ? "Job Post" : "Candidate"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">
                              <span className="font-medium">Submitted Date:</span>{" "}
                              {new Date(report.createdAt).toLocaleDateString("en-US")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Admin Note */}
                    {report.adminNote && (
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Admin Notes:
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {report.adminNote}
                        </p>
                      </div>
                    )}

                    {/* Evidence */}
                    {report.evidence && report.evidence.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Evidence ({report.evidence.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {report.evidence.slice(0, 3).map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition truncate max-w-xs"
                              title={url}
                            >
                              Evidence #{index + 1}
                            </a>
                          ))}
                          {report.evidence.length > 3 && (
                            <span className="px-3 py-1 text-xs text-gray-600">
                              +{report.evidence.length - 3} others
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
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
          )}
        </div>
      </div>
    </>
  );
}
