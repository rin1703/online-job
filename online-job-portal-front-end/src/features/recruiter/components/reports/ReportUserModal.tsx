"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Btn";
import { useSubmitUserReportMutation } from "@/redux/features/reports/reportApi";
import { Label } from "@/components/ui/label";

const REPORT_REASONS = [
  { value: "spam", label: "Spam or fraudulent ad" },
  { value: "fraud", label: "Fraudulent or deceptive behavior" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate", label: "Inappropriate behavior" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "other", label: "Other" },
];

interface ReportUserModalProps {
  userId: string;
  userName: string;
  userEmail?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReportUserModal({
  userId,
  userName,
  userEmail,
  isOpen,
  onClose,
  onSuccess,
}: ReportUserModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [evidenceInput, setEvidenceInput] = useState("");
  const [submitUserReport, { isLoading, error }] = useSubmitUserReportMutation();
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddEvidence = () => {
    if (evidenceInput.trim() && evidence.length < 5) {
      setEvidence([...evidence, evidenceInput.trim()]);
      setEvidenceInput("");
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim() || !description.trim()) {
      return;
    }

    try {
      await submitUserReport({
        userId,
        reason,
        description,
        evidence: evidence.length > 0 ? evidence : undefined,
      }).unwrap();

      setSubmitSuccess(true);
      setTimeout(() => {
        setReason("");
        setDescription("");
        setEvidence([]);
        setEvidenceInput("");
        setSubmitSuccess(false);
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error("Error submitting report:", err);
    }
  };

  return (
    <>
      <div className="absolute inset-0 bg-gray-800 opacity-50  " onClick={onClose} />
      <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Report Candidate</h2>
              <p className="text-sm text-gray-600 mt-1">&#34;{userName}&#34;</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-green-800">Report Submitted</p>
                  <p className="text-sm text-green-700">
                    Thank you for your report. Our administrators will review it shortly.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-700">
                    {typeof error === "object" && "data" in error
                      ? (error.data as any)?.message || "Could not submit report"
                      : "Could not submit report"}
                  </p>
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Candidate Name:</span> {userName}
              </p>
              {userEmail && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Email:</span> {userEmail}
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <Label className="block text-sm font-semibold text-gray-900 mb-2">
                Reason for reporting <span className="text-red-500">*</span>
              </Label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                required
              >
                <option value="">-- Select a reason --</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <Label className="block text-sm font-semibold text-gray-900 mb-2">
                Detailed description <span className="text-red-500">*</span>
              </Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                placeholder="Please describe the reason for your report in detail (at least 10 characters)..."
                maxLength={1000}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
            </div>

            {/* Evidence */}
            <div>
              <Label className="block text-sm font-semibold text-gray-900 mb-2">
                Evidence (up to 5 links)
              </Label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  placeholder="Enter evidence URL (image, video, message...)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                />
                <Button
                  type="button"
                  onClick={handleAddEvidence}
                  disabled={evidence.length >= 5}
                  className="px-4 py-2 bg-orange-100 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Add
                </Button>
              </div>

              {/* Evidence List */}
              {evidence.length > 0 && (
                <div className="space-y-2">
                  {evidence.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(index)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded transition flex-shrink-0"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 font-semibold transition"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!reason.trim() || !description.trim() || isLoading || submitSuccess}
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Submitting..." : submitSuccess ? "Submitted ✓" : "Submit Report"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
