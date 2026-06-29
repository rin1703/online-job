'use client';

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import JobDetailView from '@/features/job-seeker/components/jobs/job-detail/JobDetailView';
import { DEMO_JOBS } from '@/lib/mock/jobs';
import { useGetJobDetailQuery } from '@/redux/features/jobs/jobApi';
import { useGetJobListingSummariesQuery } from '@/features/jobs/api/job.service';
import { addRecentJob } from '@/features/job-seeker/api/job.slice';

export default function Index() {
  const params = useParams();
  const jobId = params?.id as string;
  const dispatch = useDispatch();

  // Fetch job detail from API
  const { data: job, isLoading, isError, error: apiError } = useGetJobDetailQuery(jobId, {
    skip: !jobId, // Don't fetch if no jobId
  });

  // Fetch jobs list for similar jobs
  const { data: jobsList = [] } = useGetJobListingSummariesQuery();

  // Find similar jobs based on location or experience level
  const similarJobs = job && jobsList.length > 0
    ? jobsList
        .filter(
          (j) => {
            if (j.id === job.id) return false;

            // Extract job location for comparison
            const jobCity = typeof job.location === 'string'
              ? job.location.toLowerCase().trim()
              : (job.location as any)?.city
                ? (job.location as any).city.toLowerCase().trim()
                : '';

            const jCity = (j.city || '').toLowerCase().trim();

            // Check location match (required)
            if (jobCity && jCity && jobCity === jCity) {
              console.log('[SimilarJobs] Location match:', jobCity, '===', jCity);
              return true;
            }

            // Check experience level match (JobListingSummary uses experienceLevel)
            const jobExp = (job.experience || (job as any)?.experienceLevel || '').toLowerCase().trim();
            const jExp = (j.experienceLevel || '').toLowerCase().trim();
            if (jobExp && jExp && jobExp === jExp) {
              console.log('[SimilarJobs] Experience match:', jobExp, '===', jExp);
              return true;
            }

            return false;
          }
        )
        .slice(0, 5)
    : [];

  console.log('[SimilarJobs] Total found:', similarJobs.length, 'from', jobsList.length, 'jobs');

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [jobId]);

  // Track recent job view
  useEffect(() => {
    if (jobId && job) {
      dispatch(addRecentJob(jobId));
    }
  }, [jobId, job, dispatch]);

  // Fallback to demo jobs if API fails
  const displayJob = job || (isError ? DEMO_JOBS.find((j) => j.id === jobId) : null);
  const displaySimilarJobs = similarJobs.length > 0
    ? similarJobs
    : displayJob
      ? DEMO_JOBS.filter(
          (j) =>
            j.id !== displayJob.id &&
            (j.industry === displayJob.industry || j.location === displayJob.location),
        ).slice(0, 5)
      : [];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ✅ Fixed background — không mờ, không overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#F97A00_40%,#FFFFFF_40%)] "
      />

      {/* ✅ Nội dung trang */}
      {isLoading ? (
        <main className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </main>
      ) : !displayJob ? (
        <main className="flex flex-col items-center justify-center min-h-screen ">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cannot find job</h1>
          <a href="/jobs" className="text-white underline hover:text-gray-100">
            Back to Jobs
          </a>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto w-full px-4 py-8">
          {/* ❌ Không dùng blur, không cần opacity */}
          <div className="  p-6">
            {isError && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                {apiError && 'status' in apiError && apiError.status === 401 ? (
                  <p>⚠️ Please <a href="/auth/sign-in" className="font-semibold underline">login</a> to view job details. Showing demo data instead.</p>
                ) : (
                  <p></p>
                )}
              </div>
            )}
            <JobDetailView job={displayJob} similarJobs={displaySimilarJobs} />
          </div>
        </main>
      )}
    </div>
  );
}
