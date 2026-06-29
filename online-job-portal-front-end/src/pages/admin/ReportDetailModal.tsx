import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import {
  useGetReportDetailQuery,
  useUpdateReportStatusMutation,
} from "@/redux/features/reports/reportApi.ts";
import { Label } from "@/components/ui/label.tsx";

const STATUS_LABELS = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    bgColor: "bg-yellow-50",
  },
  reviewing: {
    label: "Reviewing",
    color: "bg-blue-100 text-blue-800",
    bgColor: "bg-blue-50",
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800",
    bgColor: "bg-green-50",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    bgColor: "bg-red-50",
  },
};

const REPORT_TYPE_LABELS = {
  job: "Job Report",
  user: "User Report",
};

interface ReportDetailModalProps {
  reportId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportDetailModal({ reportId, isOpen, onClose }: ReportDetailModalProps) {
  const [newStatus, setNewStatus] = useState<"pending" | "reviewing" | "resolved" | "rejected">(
    "pending",
  );
  const [adminNote, setAdminNote] = useState("");
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  // Fetch report detail
  const {
    data: report,
    isLoading,
    error,
  } = useGetReportDetailQuery(reportId, {
    skip: !isOpen || !reportId,
  });

  // Update report status
  const [updateReportStatus, { isLoading: isUpdating }] = useUpdateReportStatusMutation();

  const handleStatusUpdate = async () => {
    try {
      await updateReportStatus({
        reportId: reportId,
        data: {
          status: newStatus,
          adminNote: adminNote.trim() || undefined,
        },
      }).unwrap();

      setIsEditingStatus(false);
      setAdminNote("");
    } catch (err) {
      console.error("Error updating report:", err);
      alert("Error: " + JSON.stringify(err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-800 opacity-50  " onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[92vh] overflow-hidden mx-4 z-10 ">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Report Details {report ? `#${report._id?.slice(-8) || "Unknown"}` : ""}
            </h2>
            {report && (
              <span
                className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${
                  STATUS_LABELS[report.status]?.color || "bg-gray-100"
                }`}
              >
                {STATUS_LABELS[report.status]?.label || "Unknown"}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] scrollbar-hide::-webkit-scrollbar scrollbar-hide">
          {isLoading ? (
            <div className="p-8 text-center text-gray-600">
              <p>Loading...</p>
            </div>
          ) : error || !report ? (
            <div className="p-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800">Report not found</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Report Details */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Report Type & Basic Info */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Report Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Report Type</p>
                          <p className="text-gray-900 mt-1">
                            {REPORT_TYPE_LABELS[report.reportType]}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Date Submitted</p>
                          <p className="text-gray-900 mt-1">
                            {report.createdAt
                              ? new Date(report.createdAt).toLocaleString("en-US")
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Reason</p>
                          <p className="text-gray-900 mt-1 font-semibold">{report.reason}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Detailed Description</p>
                          <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-900 whitespace-pre-wrap">
                              {report.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reporter Info */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Reporter</h3>
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{report.reporter.name}</p>
                        <p className="text-sm text-gray-600">{report.reporter.email}</p>
                        <p className="text-sm text-gray-600 mt-1 capitalize">
                          {report.reporter.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reported Item/User Info */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {report.reportType === "job" ? "Reported Job" : "Reported User"}
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="w-full">
                        {report.reportType === "job" ? (
                          <>
                            <p className="font-semibold text-gray-900">
                              {report.reported.name || "Unknown Job"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Company: {report.reported.email || "Unknown Company"}
                            </p>
                            {report.reported.jobId && (
                              <p className="text-xs text-gray-500 mt-2">
                                Job ID: {report.reported.jobId}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-gray-900">
                              {report.reported.name || "Unknown User"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {report.reported.email || "No email"}
                            </p>
                            {report.reported.userId && (
                              <p className="text-xs text-gray-500 mt-2">
                                User ID: {report.reported.userId}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Evidence */}
                  {report.evidence && report.evidence.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence</h3>
                      <div className="space-y-3">
                        {report.evidence.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                          >
                            <p className="text-sm text-gray-700 truncate flex-1">{url}</p>
                            <ExternalLink size={16} className="text-orange-600 ml-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {report.adminNote && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">{report.adminNote}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Status Update */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>

                    {isEditingStatus ? (
                      <div className="space-y-4">
                        {/* Status Dropdown */}
                        <div>
                          <Label className="block text-sm font-medium text-gray-900 mb-2">
                            New Status
                          </Label>
                          <select
                            value={newStatus}
                            onChange={(e) =>
                              setNewStatus(
                                e.target.value as "pending" | "reviewing" | "resolved" | "rejected",
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>

                        {/* Admin Note */}
                        <div>
                          <Label className="block text-sm font-medium text-gray-900 mb-2">
                            Note (optional)
                          </Label>
                          <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value.slice(0, 1000))}
                            placeholder="Enter a note for the reporter..."
                            maxLength={1000}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {adminNote.length}/1000 characters
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsEditingStatus(false)}
                            disabled={isUpdating}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleStatusUpdate}
                            disabled={isUpdating}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                          <p className="text-sm text-gray-600 font-medium mb-2">Current Status</p>
                          <p
                            className={`text-lg font-bold ${
                              STATUS_LABELS[report.status].color.split(" ")[1]
                            }`}
                          >
                            {STATUS_LABELS[report.status].label}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setNewStatus(report.status);
                            setAdminNote(report.adminNote || "");
                            setIsEditingStatus(true);
                          }}
                          className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition"
                        >
                          Change Status
                        </button>
                      </div>
                    )}

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Note:</span> When you change the status, the
                        reporter will be notified.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
