import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter } from "lucide-react";

import { ButtonLowercase } from "@/components/ui/button-lowercase.tsx";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

import { useJobViewPreferences } from "@/features/job-seeker/api/job.hooks";
import { useFavoriteJobs } from "@/features/job-seeker/api/useFavoriteJobs";
import FindJobPageHeader from "@/features/job-seeker/components/jobs/components/FindJobPageHeader.tsx";
import JobFilterSidebar from "@/features/job-seeker/components/jobs/components/JobFilterSidebar.tsx";
import SearchResultsInfo from "@/features/job-seeker/components/jobs/job-detail/SearchResultsInfo.tsx";
import JobGrid from "@/features/job-seeker/components/jobs/job-list/JobGrid.tsx";
import JobList from "@/features/job-seeker/components/jobs/job-list/JobList.tsx";
import Pagination from "@/features/job-seeker/components/jobs/job-list/Pagination.tsx";
import SortAndView from "@/features/job-seeker/components/jobs/job-list/SortAndView.tsx";
import type { Job } from "@/features/job-seeker/components/jobs/types/job.types.tsx";
import { useJobSearch } from "@/hooks/useJobSearch.ts";

function Index() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoriteJobs();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const { viewMode, sortBy, setViewMode, setSortBy } = useJobViewPreferences();

  const {
    searchTerm,
    setSearchTerm,
    filters,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    activeFilterCount,
    totalPages,
    paginatedJobs,
    handleFilterChange,
    handleSearchClick,
    handleSearchChange,
    isLoading,
    totalJobs,
  } = useJobSearch(sortBy);

  const handleSaveToggle = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await toggleFavorite(jobId);
  };

  const handleSelectJob = (job: Job) => {
    navigate(`/job/${job.id}`);
  };

  // Enhance jobs with isSaved flag from local state
  const enhancedJobs = paginatedJobs.map(job => ({
    ...job,
    isFavorite: isFavorite(job.id, job.isFavorite)
  }));

  const sidebarContent = (
    <JobFilterSidebar jobs={paginatedJobs} filters={filters} onFilterChange={handleFilterChange} />
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fixed background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#F97A00] from-40% to-white to-40%"
      />

      <div className="min-h-screen flex flex-col">
        <FindJobPageHeader
          jobs={paginatedJobs}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearchClick={handleSearchClick}
          // activeFilterCount={activeFilterCount}
        />

        <div className="flex-1 2xl:max-w-7xl mx-auto w-full bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
            <aside className="hidden lg:block lg:col-span-1 bg-white border-r border-slate-200">
              <div className="sticky top-0 h-screen overflow-y-auto">{sidebarContent}</div>
            </aside>

            <div className="col-span-1 lg:col-span-3 overflow-y-auto">
              <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="lg:hidden mb-4">
                  <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetTrigger asChild>
                      <ButtonLowercase
                        variant="orange"
                        className="h-8 w-full sm:w-auto min-w-[100px] flex flex-row "
                        aria-label={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}`}
                      >
                        <Filter className="h-4 w-4 shrink-0 mr-2" />
                        <span className="flex items-center gap-1">
                          Filters
                          {activeFilterCount > 0 && (
                            <span className=" text-xs font-medium">({activeFilterCount})</span>
                          )}
                        </span>
                      </ButtonLowercase>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                      <JobFilterSidebar
                        jobs={paginatedJobs} // 👈 giống desktop
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        isMobile
                        onClose={() => setIsSidebarOpen(false)}
                      />
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <SearchResultsInfo
                    jobs={enhancedJobs}
                    searchTerm={searchTerm}
                    activeFilterCount={activeFilterCount}
                  />
                  <SortAndView
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    jobCount={totalJobs}
                    onItemsPerPageChange={setItemsPerPage}
                    itemsPerPage={itemsPerPage}
                  />
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(itemsPerPage)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))}
                  </div>
                ) : paginatedJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500 text-lg">No matching jobs found</p>
                    <p className="text-slate-400 text-sm mt-2">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <>
                    {viewMode === "list" ? (
                      <JobList
                        jobs={enhancedJobs}
                        onSelectJob={handleSelectJob}
                        onSaveToggle={handleSaveToggle}
                      />
                    ) : (
                      <JobGrid
                        jobs={enhancedJobs}
                        onSelectJob={handleSelectJob}
                        onSaveToggle={handleSaveToggle}
                        onQuickView={handleSelectJob}
                      />
                    )}

                    {totalPages > 1 && (
                      <div className="mt-8">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                          itemsPerPage={itemsPerPage}
                          totalItems={totalJobs}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
