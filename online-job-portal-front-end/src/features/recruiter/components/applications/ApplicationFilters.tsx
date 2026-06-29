import React from 'react';

import { Badge } from '@/components/ui/badge';
import { ButtonLowercase } from '@/components/ui/button-lowercase.tsx';
import { Input } from '@/components/ui/input';

import { Icons } from '@/components/icons/icons';
import type { ApplicationStatus } from '@/features/recruiter/application.type';
import { STATUS_FILTER_OPTIONS } from '@/features/recruiter/application.constants';
import { useGetRecruiterJobsFilterQuery } from '@/features/jobs/api/job.service';
import type { RecruiterStatusDTO } from '@/features/jobs/api/job.type';

const JOB_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Job Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'closed', label: 'Closed' },
] as const;

interface ApplicationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: ApplicationStatus | 'all';
  onStatusChange: (status: ApplicationStatus | 'all') => void;
  selectedJobId?: string | 'all';
  onJobChange?: (jobId: string | 'all') => void;
  selectedJobStatus?: RecruiterStatusDTO['status'] | 'all';
  onJobStatusChange?: (status: RecruiterStatusDTO['status'] | 'all') => void;
}

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedJobId = 'all',
  onJobChange,
  selectedJobStatus = 'all',
  onJobStatusChange,
}) => {
  // Fetch recruiter's jobs for filter dropdown
  const { data: jobsData } = useGetRecruiterJobsFilterQuery({
    page: 1,
    limit: 100, // Get all jobs for dropdown
  });

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onJobChange?.('all');
    onJobStatusChange?.('all');
  };

  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSearchChange('');
  };

  const handleClearStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange('all');
  };

  const handleClearJob = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJobChange?.('all');
  };

  const handleClearJobStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJobStatusChange?.('all');
  };

  const activeStatusLabel = STATUS_FILTER_OPTIONS.find((s) => s.value === selectedStatus)?.label;
  const activeJobLabel = jobsData?.data?.find((job) => job.id === selectedJobId)?.title;
  const activeJobStatusLabel = JOB_STATUS_FILTER_OPTIONS.find(
    (option) => option.value === selectedJobStatus
  )?.label;

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <div className="relative">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Job Filter */}
        {onJobChange && (
          <select
            value={selectedJobId}
            onChange={(e) => onJobChange(e.target.value)}
            className="h-9 text-sm rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Jobs</option>
            {jobsData?.data?.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        )}

        {/* Job Status Filter */}
        {onJobStatusChange && (
          <select
            value={selectedJobStatus}
            onChange={(e) => onJobStatusChange(e.target.value as RecruiterStatusDTO['status'] | 'all')}
            className="h-9 text-sm rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {JOB_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Application Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as ApplicationStatus | 'all')}
          className="h-9 text-sm rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Filters */}
      {(searchTerm || selectedStatus !== 'all' || (selectedJobId !== 'all' && onJobChange) || (selectedJobStatus !== 'all' && onJobStatusChange)) && (
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs text-gray-600">Filters:</span>

          {/* Search Badge */}
          {searchTerm && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5">
              Search: "{searchTerm}"
              <button
                onClick={handleClearSearch}
                className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                aria-label="Clear search"
              >
                <Icons.x className="w-2.5 h-2.5 text-gray-600 hover:text-red-600" />
              </button>
            </Badge>
          )}

          {/* Job Badge */}
          {selectedJobId !== 'all' && onJobChange && activeJobLabel && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5">
              Job: "{activeJobLabel}"
              <button
                onClick={handleClearJob}
                className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                aria-label="Clear job filter"
              >
                <Icons.x className="w-2.5 h-2.5 text-gray-600 hover:text-red-600" />
              </button>
            </Badge>
          )}

          {/* Job Status Badge */}
          {selectedJobStatus !== 'all' && onJobStatusChange && activeJobStatusLabel && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5">
              Job Status: "{activeJobStatusLabel}"
              <button
                onClick={handleClearJobStatus}
                className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                aria-label="Clear job status filter"
              >
                <Icons.x className="w-2.5 h-2.5 text-gray-600 hover:text-red-600" />
              </button>
            </Badge>
          )}

          {/* Application Status Badge */}
          {selectedStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5">
              {activeStatusLabel}
              <button
                onClick={handleClearStatus}
                className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                aria-label="Clear status"
              >
                <Icons.x className="w-2.5 h-2.5 text-gray-600 hover:text-red-600" />
              </button>
            </Badge>
          )}

          <ButtonLowercase
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs h-6 px-2 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Icons.x className="w-3 h-3 mr-1" />
            Clear all
          </ButtonLowercase>
        </div>
      )}
    </div>
  );
};
