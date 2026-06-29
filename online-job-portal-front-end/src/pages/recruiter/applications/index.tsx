import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icons } from '@/components/icons/icons';

import { APPLICATION_CONSTANTS } from '@/features/recruiter/application.constants';
import type { ApplicationStatus } from '@/features/recruiter/application.type';
import { ApplicationCard } from '@/features/recruiter/components/applications/ApplicationCard';
import { ApplicationFilters } from '@/features/recruiter/components/applications/ApplicationFilters';
import { ApplicationStats } from '@/features/recruiter/components/applications/ApplicationStats';

import {
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from '@/redux/features/applications/applicationApi';

const FILTER_STORAGE_KEYS = {
  SEARCH_TERM: 'applications_filter_search',
  STATUS: 'applications_filter_status',
  PAGE: 'applications_filter_page',
  JOB_ID: 'applications_filter_job',
  JOB_STATUS: 'applications_filter_job_status',
} as const;

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { jobId: jobIdParam } = useParams<{ jobId?: string }>(); // ✅ Get jobId from URL
  const location = useLocation();
  const jobTitle = location.state?.jobTitle; // ✅ Get job title from navigation state

  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem(FILTER_STORAGE_KEYS.SEARCH_TERM) || '';
  });

  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>(() => {
    const saved = sessionStorage.getItem(FILTER_STORAGE_KEYS.STATUS);
    return (saved as ApplicationStatus | 'all') || 'all';
  });

  const [selectedJobId, setSelectedJobId] = useState<string | 'all'>(() => {
    // ✅ Priority: URL param (from route) > URL query > sessionStorage
    if (jobIdParam) return jobIdParam;
    const urlJobId = searchParams.get('jobId');
    if (urlJobId) return urlJobId;
    return sessionStorage.getItem(FILTER_STORAGE_KEYS.JOB_ID) || 'all';
  });

  const [selectedJobStatus, setSelectedJobStatus] = useState<'draft' | 'active' | 'hidden' | 'closed' | 'all'>(() => {
    // Priority: URL param > sessionStorage
    const urlJobStatus = searchParams.get('jobStatus');
    if (urlJobStatus) return urlJobStatus as 'draft' | 'active' | 'hidden' | 'closed' | 'all';
    return (sessionStorage.getItem(FILTER_STORAGE_KEYS.JOB_STATUS) as 'draft' | 'active' | 'hidden' | 'closed' | 'all') || 'all';
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem(FILTER_STORAGE_KEYS.PAGE);
    return saved ? parseInt(saved, 10) : 1;
  });

  const {
    data: applicationsData,
    isLoading,
    error,
  } = useGetApplicationsQuery({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    jobId: jobIdParam || (selectedJobId === 'all' ? undefined : selectedJobId), // ✅ Use jobIdParam first
    page: currentPage,
    limit: APPLICATION_CONSTANTS.ITEMS_PER_PAGE,
    sortBy: 'appliedAt',
    sortOrder: 'desc',
  });

  // ✅ UPDATE STATUS MUTATION
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateApplicationStatusMutation();

  const previousSearchRef = useRef(searchTerm);
  const previousStatusRef = useRef(selectedStatus);
  const previousJobIdRef = useRef(selectedJobId);
  const previousJobStatusRef = useRef(selectedJobStatus);

  useEffect(() => {
    sessionStorage.setItem(FILTER_STORAGE_KEYS.SEARCH_TERM, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem(FILTER_STORAGE_KEYS.STATUS, selectedStatus);
  }, [selectedStatus]);

  useEffect(() => {
    sessionStorage.setItem(FILTER_STORAGE_KEYS.JOB_ID, selectedJobId);
  }, [selectedJobId]);

  useEffect(() => {
    sessionStorage.setItem(FILTER_STORAGE_KEYS.JOB_STATUS, selectedJobStatus);
  }, [selectedJobStatus]);

  useEffect(() => {
    sessionStorage.setItem(FILTER_STORAGE_KEYS.PAGE, currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    const searchChanged = previousSearchRef.current !== searchTerm;
    const statusChanged = previousStatusRef.current !== selectedStatus;
    const jobIdChanged = previousJobIdRef.current !== selectedJobId;
    const jobStatusChanged = previousJobStatusRef.current !== selectedJobStatus;

    if (searchChanged || statusChanged || jobIdChanged || jobStatusChanged) {
      setCurrentPage(1);
      previousSearchRef.current = searchTerm;
      previousStatusRef.current = selectedStatus;
      previousJobIdRef.current = selectedJobId;
      previousJobStatusRef.current = selectedJobStatus;
    }
  }, [searchTerm, selectedStatus, selectedJobId, selectedJobStatus]);

  // ✅ HANDLE STATUS UPDATE - Updated to include note parameter with optimistic update
  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: ApplicationStatus,
    note?: string
  ) => {
    const statusLabels: Record<ApplicationStatus, string> = {
      pending: 'pending',
      reviewed: 'reviewed',
      interview_scheduled: 'interview scheduled',
      approved: 'approved',
      rejected: 'rejected',
      withdrawn: 'withdrawn',
    };

    // ✅ Optimistic update: Show loading toast immediately
    const loadingToast = toast.loading(`Updating application to ${statusLabels[newStatus]}...`);

    try {
      console.log('📤 Update status request:', { id: applicationId, status: newStatus, note });

      // ✅ Use updateStatus endpoint for all status changes (supports recruiterNote)
      await updateStatus({
        id: applicationId,
        data: {
          status: newStatus as 'reviewed' | 'interview_scheduled' | 'approved' | 'rejected',
          recruiterNote: note,
        },
      }).unwrap();

      toast.success(`Application ${statusLabels[newStatus] || 'updated'}`, { id: loadingToast });
    } catch (error: any) {
      console.error('❌ Update status failed:', error);
      toast.error(error?.data?.message || 'Failed to update status', { id: loadingToast });
    }
  };

  const filteredApplications = useMemo(() => {
    if (!applicationsData?.applications) return [];
    
    let filtered = applicationsData.applications.filter(
      (app) => app.jobId && app.jobSeekerId
    );

    // Client-side filter by job status (if job has status)
    if (selectedJobStatus !== 'all') {
      filtered = filtered.filter((app) => {
        return app.jobId?.status === selectedJobStatus;
      });
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((app) => {
        if (!app.jobSeekerId || !app.jobId) return false;
        const fullName = `${app.jobSeekerId.firstName} ${app.jobSeekerId.lastName}`.toLowerCase();
        const email = app.jobSeekerId.email.toLowerCase();
        const jobTitle = app.jobId.title.toLowerCase();
        return fullName.includes(search) || email.includes(search) || jobTitle.includes(search);
      });
    }

    return filtered;
  }, [applicationsData, searchTerm, selectedJobStatus]);

  const handleViewDetail = (id: string) => {
    sessionStorage.setItem(APPLICATION_CONSTANTS.SCROLL_POSITION_KEY, window.scrollY.toString());
    navigate(`/recruiter/applications/${id}`, { state: { fromIndex: true } });
  };

  // ✅ LOADING STATE: Hiển thị khi đang update status
  const isProcessing = isUpdatingStatus;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icons.loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Icons.alertCircle}
        message="Unable to load applications. Please try again later."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* ✅ Breadcrumb when viewing job-specific applications */}
      {jobIdParam && (
        <div className="flex items-center gap-2 text-sm">
          <ButtonLowercase
            variant="ghost"
            size="sm"
            onClick={() => navigate('/recruiter/applications')}
            className="h-8 px-2 cursor-pointer"
          >
            <Icons.arrowLeft className="w-4 h-4 mr-1" />
            Back to Job Listing
          </ButtonLowercase>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">
          {jobIdParam && jobTitle 
            ? `Applications for "${jobTitle}"` 
            : 'Manage Applications'}
        </h1>
        {(searchTerm || selectedStatus !== 'all' || selectedJobId !== 'all' || selectedJobStatus !== 'all') && (
          <p className="text-gray-600 text-sm mt-1">
            Found {filteredApplications.length} results
          </p>
        )}
      </div>

      {/* ✅ Show full filters only when NOT viewing job-specific applications */}
      {!jobIdParam && (
        <ApplicationFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedJobId={selectedJobId}
          onJobChange={setSelectedJobId}
          selectedJobStatus={selectedJobStatus}
          onJobStatusChange={setSelectedJobStatus}
        />
      )}

      {/* ✅ Show simplified filters for job-specific view */}
      {jobIdParam && (
        <div className="flex gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by candidate name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}

      <ApplicationStats applications={applicationsData?.applications || []} />

      {/* ✅ LOADING OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <Icons.loader className="w-5 h-5 animate-spin text-primary" />
            <span> Loading...</span>
          </div>
        </div>
      )}

      {filteredApplications.length > 0 ? (
        <div className="space-y-3">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              onViewDetail={handleViewDetail}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Icons.users}
          message={
            searchTerm || selectedStatus !== 'all'
              ? 'No applications found matching the filters'
              : 'No applications received yet'
          }
        />
      )}

      {applicationsData && applicationsData.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <ButtonLowercase
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="cursor-pointer"
          >
            Previous
          </ButtonLowercase>
          <span className="px-3 py-1.5 text-sm">
            Page {currentPage} / {applicationsData.totalPages}
          </span>
          <ButtonLowercase
            variant="outline"
            size="sm"
            disabled={currentPage === applicationsData.totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="cursor-pointer"
          >
            Next
          </ButtonLowercase>
        </div>
      )}
    </div>
  );
}