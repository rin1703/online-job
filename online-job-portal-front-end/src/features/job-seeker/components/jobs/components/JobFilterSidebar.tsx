import { X } from "lucide-react";

import AdvancedFilters from "@/features/job-seeker/components/jobs/search-job/AdvancedFilters.tsx";
import type { Job } from "@/features/job-seeker/components/jobs/types/job.types.tsx";
import { ButtonLowercase } from "@/components/ui/button-lowercase.tsx";
import { useGetFilterOptionsQuery } from "@/redux/features/jobs/jobApi.ts";

interface JobFilterSidebarProps {
  jobs?: Job[];
  filters: any;
  onFilterChange: (filters: any) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function JobFilterSidebar({
  filters,
  onFilterChange,
  isMobile,
  onClose,
}: JobFilterSidebarProps) {
  // Fetch dynamic filter options from API
  const { data: filterOptionsResponse } = useGetFilterOptionsQuery();

  const filterOptions = filterOptionsResponse?.data;

  // Transform API data to format expected by AdvancedFilters
  const industries = filterOptions?.industries?.map((ind) => ind.name) || [];
  const locations = filterOptions?.locations?.map((loc) => loc.city) || [];
  const experienceLevels = filterOptions?.experienceLevels?.map((exp) => exp.label) || [];
  const jobTypes = filterOptions?.jobTypes?.map((type) => type.name) || [];
  const salaryRange = filterOptions?.salaryRange || { min: 0, max: 100000000, currency: 'USD' };
  const workModes = filterOptions?.workModes || { remote: 0, hybrid: 0, onsite: 0 };
  // TODO: Add jobLevels when backend provides this data
  const jobLevels = undefined; // Backend API doesn't provide job levels yet

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {isMobile ? "Filter" : "Advanced Filters"}
        </h2>
        {isMobile && (
          <ButtonLowercase
            variant="orange"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close filter sidebar"
          >
            <X className="h-5 w-5" />
          </ButtonLowercase>
        )}
      </div>

      {/* Content - Scroll mượt, ẩn thanh cuộn */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <AdvancedFilters
          filters={filters}
          onFilterChange={onFilterChange}
          industries={industries}
          locations={locations}
          experienceLevels={experienceLevels}
          jobTypes={jobTypes}
          salaryRange={salaryRange}
          workModes={workModes}
          jobLevels={jobLevels}
          onSavePreset={() => {}}
        />
      </div>
    </div>
  );
}
