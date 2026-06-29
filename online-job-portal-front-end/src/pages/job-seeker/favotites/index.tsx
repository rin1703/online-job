"use client";

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Building2, Clock, DollarSign, Heart, MapPin } from "lucide-react";

import { Button } from "@/components/ui/Btn.tsx";
import type { Job } from "@/features/job-seeker/components/jobs/types/job.types.tsx";
import { useGetUserJobsQuery } from "@/redux/features/jobs/jobApi";
import { useFavoriteJobs } from "@/features/job-seeker/api/useFavoriteJobs";

const formatSalary = (salary: Job["salary"]) => {
  if (!salary) return "Negotiable";
  if (typeof salary === "string") return salary;

  const min = (salary.min / 1_000_000).toFixed(0);
  const max = (salary.max / 1_000_000).toFixed(0);
  return `${min}–${max} USD`;
};

const getPostedTimeLabel = (createdAt?: string | Date) => {
  if (!createdAt) return "Recently";
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "Recently";

  const diffMs = Date.now() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 Day Ago";
  return `${diffDays} Days Ago`;
};

export default function FavoriteJobsPage() {
  const { toggleFavorite, isTogglingFavorite, isAuthenticated, localFavoriteCount, isFavorite } =
    useFavoriteJobs();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Debug: Check localStorage directly
  const localStorageJobs = localStorage.getItem("job_savedJobs");
  console.log("[FavoritesPage] localStorage job_savedJobs:", localStorageJobs);

  // Try to fetch from API for authenticated users
  const {
    data: allJobs = [],
    isLoading,
    error,
  } = useGetUserJobsQuery(undefined, {
    skip: !isAuthenticated, // Skip if not authenticated
  });

  // For authenticated users: filter jobs that are favorited (check both API and local state)
  // For guests: need to sign in first
  const savedJobs = isAuthenticated
    ? allJobs.filter((job) => isFavorite(job.id, job.isFavorite))
    : [];

  // Debug logs
  console.log("[FavoritesPage] ===== DEBUG START =====");
  console.log("[FavoritesPage] isAuthenticated:", isAuthenticated);
  console.log("[FavoritesPage] localFavoriteCount:", localFavoriteCount);
  console.log("[FavoritesPage] allJobs length:", allJobs.length);
  console.log("[FavoritesPage] allJobs:", allJobs);
  console.log("[FavoritesPage] savedJobs length:", savedJobs.length);
  console.log("[FavoritesPage] savedJobs:", savedJobs);
  console.log("[FavoritesPage] isLoading:", isLoading);
  console.log("[FavoritesPage] error:", error);
  console.log("[FavoritesPage] ===== DEBUG END =====");

  const handleRemoveFavorite = async (jobId: string) => {
    await toggleFavorite(jobId);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#F97A00_40%,#FFFFFF_40%)]"
      />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 mt-20 mt-32">
        {/* Header (không có nút Back nữa) */}
        <div className="flex items-center justify-start mb-8 gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 border border-white/40 text-white">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Saved Jobs</h1>
            <p className="text-sm text-orange-100">
              All jobs you&apos;ve bookmarked will appear here.
            </p>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="mt-2 rounded-3xl bg-white p-8 text-center shadow-md">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="text-gray-600 mt-4">Loading your saved jobs...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mt-2 rounded-3xl bg-white p-8 text-center shadow-md">
            <p className="text-red-600">Failed to load saved jobs. Please try again later.</p>
          </div>
        )}

        {/* Empty state - Not authenticated */}
        {!isLoading && !isAuthenticated && (
          <div className="mt-2 rounded-3xl border border-dashed border-orange-200 bg-white p-8 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <Heart className="h-6 w-6" />
            </div>

            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Sign in to view your saved jobs
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Create an account or sign in to save jobs and sync across devices.
            </p>

            <div className="flex gap-3 justify-center">
              <Link to="/auth/sign-in">
                <Button className="bg-orange-600 text-white hover:bg-orange-700 inline-flex items-center gap-2 rounded-full px-5">
                  Sign In
                </Button>
              </Link>
              <Link to="/jobs">
                <Button className="bg-gray-200 text-gray-700 hover:bg-gray-300 inline-flex items-center gap-2 rounded-full px-5">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Empty state - Authenticated but no saved jobs */}
        {!isLoading && !error && isAuthenticated && (!savedJobs || savedJobs.length === 0) && (
          <div className="mt-2 rounded-3xl border border-dashed border-orange-200 bg-white p-8 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <Heart className="h-6 w-6" />
            </div>

            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              You haven&apos;t saved any jobs yet
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Browse jobs and tap the bookmark icon to save them here.
            </p>

            <Link to="/jobs">
              <Button className="bg-primary text-white hover:bg-primary-hover inline-flex items-center gap-2 rounded-full px-5">
                Browse Jobs
              </Button>
            </Link>
          </div>
        )}

        {/* List saved jobs */}
        {!isLoading && savedJobs && savedJobs.length > 0 && (
          <div className="space-y-5 mt-2">
            {savedJobs.map((job) => {
              // Safely extract company name
              const companyName =
                typeof job.company === "string"
                  ? job.company
                  : (job.company as any)?.name || job.company || "Company";
              const avatarLetter = companyName.charAt(0).toUpperCase();
              const postedLabel = getPostedTimeLabel((job as any).createdAt ?? job.postedDate);

              // Safely extract location
              const locationString =
                typeof job.location === "string"
                  ? job.location
                  : (job.location as any)?.city || "Location";

              const tags: string[] = [
                job.industry || "Innovation Hub",
                job.level || "Global Presence",
              ].filter(Boolean);

              return (
                <div
                  key={job.id}
                  className="relative rounded-3xl bg-white p-6 md:p-8 shadow-md border border-gray-100 flex flex-col gap-6"
                >
                  {/* Icon bookmark - remove from favorites */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFavorite(job.id)}
                    disabled={isTogglingFavorite}
                    className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-orange-500 hover:bg-orange-100 transition disabled:opacity-50"
                    title="Remove from favorites"
                  >
                    <Bookmark className="h-5 w-5" fill="currentColor" />
                  </button>

                  {/* Avatar + title */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-lg font-semibold">
                      {avatarLetter}
                    </div>

                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                        {job.title}
                      </h2>
                      <p className="text-sm text-gray-500">{companyName}</p>
                    </div>
                  </div>

                  {/* Info rows */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{companyName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{job.industry || "Smartphones/Electronics"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-gray-500" />
                        <span>{(job as any).companyType || "Listed company"}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{locationString}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>{formatSalary(job.salary)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags + Footer */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-500">{postedLabel}</span>

                      <Link to={`/job/${job.id}`}>
                        <Button className="bg-orange-600 text-white hover:bg-orange-700 rounded-full px-5 py-2 text-sm font-semibold">
                          Job Details &gt;
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
