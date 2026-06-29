"use client";

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetJobDetailQuery } from "@/redux/features/jobs/jobApi";
import ApplyForm from "@/features/job-seeker/components/jobs/apply/ApplyForm";
import { ArrowLeft } from "lucide-react";

export default function ApplyJobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  const {
    data: job,
    isLoading,
    isError,
  } = useGetJobDetailQuery(jobId!, {
    skip: !jobId,
  });

  if (!jobId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
        <p className="text-gray-600 mb-6">The job ID is missing or invalid.</p>
        <button
          onClick={() => navigate("/jobs")}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#F97A00_40%,#FFFFFF_40%)]"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 mt-20">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          {/* Job Preview */}
          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ) : isError ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">⚠️ Could not load job details. Please try again.</p>
            </div>
          ) : job ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-600 mb-4">{job.company || "Company"}</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {job.industry || "Industry"}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {job.workType || "Work Type"}
                </span>
                {job.salary && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {typeof job.salary === "object"
                      ? `${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()} VND`
                      : job.salary}
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Apply Form */}
        <div className="mb-12">
          <ApplyForm />
        </div>
      </main>
    </div>
  );
}
