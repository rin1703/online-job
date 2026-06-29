import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ButtonLowercase } from "@/components/ui/button-lowercase";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Icons } from "@/components/icons/icons";

import { useGetApplicationsQuery } from "@/redux/features/applications/applicationApi";
import { ApplicationCard } from "@/features/job-seeker/components/applications/ApplicationCard";
import { ApplicationFilters } from "@/features/job-seeker/components/applications/ApplicationFilters";
import { ApplicationStats } from "@/features/job-seeker/components/applications/ApplicationStats";
import { APPLICATION_CONSTANTS } from "@/features/job-seeker/components/applications/application.constants";
import { getErrorMessage } from "@/utils/errorHandling";

type StatusValue =
  | "all"
  | "pending"
  | "reviewed"
  | "approved"
  | "rejected"
  | "interview_scheduled"
  | "withdrawn";

const FILTER_STORAGE_KEYS = {
  SEARCH_TERM: "jobseeker_applications_filter_search",
  STATUS: "jobseeker_applications_filter_status",
  PAGE: "jobseeker_applications_filter_page",
} as const;

export default function JobSeekerApplicationsPage() {
  const navigate = useNavigate();

  // Load filters from sessionStorage
  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem(FILTER_STORAGE_KEYS.SEARCH_TERM) || "";
  });

  const [selectedStatus, setSelectedStatus] = useState<StatusValue>(() => {
    const saved = sessionStorage.getItem(FILTER_STORAGE_KEYS.STATUS);
    return (saved as StatusValue) || "all";
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem(FILTER_STORAGE_KEYS.PAGE);
    return saved ? parseInt(saved, 10) : 1;
  });

  // Fetch applications from API
  const { data, isLoading, isError, error } = useGetApplicationsQuery({
    sortBy: "appliedAt",
    sortOrder: "desc",
  });

  const applications = data?.applications || [];

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Save filters to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(FILTER_STORAGE_KEYS.SEARCH_TERM, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem(FILTER_STORAGE_KEYS.STATUS, selectedStatus);
  }, [selectedStatus]);

  useEffect(() => {
    sessionStorage.setItem(FILTER_STORAGE_KEYS.PAGE, currentPage.toString());
  }, [currentPage]);

  // Clear filters when leaving page
  useEffect(() => {
    return () => {
      if (!window.location.pathname.includes("/applications/")) {
        sessionStorage.removeItem(FILTER_STORAGE_KEYS.SEARCH_TERM);
        sessionStorage.removeItem(FILTER_STORAGE_KEYS.STATUS);
        sessionStorage.removeItem(FILTER_STORAGE_KEYS.PAGE);
      }
    };
  }, []);

  // Filter applications
  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((app) => app.status === selectedStatus);
    }

    // Filter by search term (job title)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((app) => {
        const jobTitle = app.jobId.title.toLowerCase();
        return jobTitle.includes(search);
      });
    }

    return filtered;
  }, [applications, searchTerm, selectedStatus]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / APPLICATION_CONSTANTS.ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * APPLICATION_CONSTANTS.ITEMS_PER_PAGE,
    currentPage * APPLICATION_CONSTANTS.ITEMS_PER_PAGE,
  );

  const handleViewDetail = (id: string) => {
    sessionStorage.setItem(APPLICATION_CONSTANTS.SCROLL_POSITION_KEY, window.scrollY.toString());
    navigate(`/job-seeker/applications/${id}`, { state: { fromIndex: true } });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" message="Loading applications..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = getErrorMessage(error, 'Failed to load applications');
    return (
      <div className="max-w-7xl mx-auto w-full px-4 py-8 pt-4 mt-32">
        <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <ErrorAlert message={errorMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fixed background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#F97A00] from-40% to-white to-40%"
      />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 pt-4 mt-32 ">
        <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            {(searchTerm || selectedStatus !== "all") && (
              <p className="text-gray-600 text-sm mt-2">
                Found {filteredApplications.length} results
              </p>
            )}
          </div>

          {/* Stats */}
          {applications.length > 0 && <ApplicationStats applications={applications} />}

          {/* Filters */}
          <ApplicationFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />

          {/* Applications List */}
          {paginatedApplications.length > 0 ? (
            <div className="space-y-4">
              {paginatedApplications.map((application) => (
                <ApplicationCard
                  key={application._id}
                  application={application}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Icons.fileText}
              message={
                searchTerm || selectedStatus !== "all"
                  ? "No applications found matching the filter"
                  : "You haven't submitted any applications yet. Find and apply for suitable jobs!"
              }
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <ButtonLowercase
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </ButtonLowercase>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} / {totalPages}
              </span>
              <ButtonLowercase
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </ButtonLowercase>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
