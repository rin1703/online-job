// ============================================
// COMMON TYPES
// ============================================
export interface AdminApprovalDTO {
  approvalStatus: "approved" | "rejected";
  rejectionReason?: string;
}

export interface RecruiterStatusDTO {
  status: "draft" | "active" | "hidden" | "closed";
}

// ============================================
// PUBLIC JOB LISTING RESPONSE (Job Seeker)
// ============================================
export interface JobListingResponse {
  ok: boolean;
  pagination: {
    currentPage: number;
    limitItems: number;
    skip: number;
    totalPage: number;
  };
  totalRecords: number;
  data: JobListingSummary[];
}

export interface JobListingSummary {
  id: string;
  title: string;
  companyName: string;
  salaryMin: number;
  salaryMax: number;
  benefits?: string[];
  city: string;
  experienceLevel: string;
  logo: string;
}

// Job detail (GET /api/v1/job-listings/:id)
export interface JobDetail extends RecruiterJobPosting {
  overview: string[];
  responsibilities: string[];
  requirementSkill: string[];
  benefits?: string[];
  niceToHave?: string[];
  workingSchedule?: string[];
  jobType: string;
  numberOfPositions?: number;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
  location: {
    address: string;
    district: string;
    city: string;
  };
  company: {
    name: string;
    logo: string | null;
  };
}

// ============================================
// RECRUITER DASHBOARD RESPONSE
// ============================================
// Response là array trực tiếp, không có wrapper
export type RecruiterJobsResponse = RecruiterJobPosting[];

export interface RecruiterJobPosting {
  id: string;
  title: string;
  salaryMin: number;
  salaryMax: number;
  experienceLevel: string;
  status: "draft" | "active" | "hidden" | "closed";
  views: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  approvalStatus: string;
  totalApplications?: number;
}

// ============================================
// FILTER API TYPES (New)
// ============================================
export interface RecruiterFilterParams {
  status?: string;
  keyword?: string;
  location?: string;
  page?: number;
  limit?: number;
  // approvalStatus?: string;
}

export interface RecruiterFilterResponse {
  ok: boolean;
  data: RecruiterJobPosting[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// CREATE & UPDATE DTOs
// ============================================
export interface CreateJobListingDTO {
  title: string;
  jobType: string;
  experienceLevel: string;

  overview: string[];
  responsibilities: string[];
  requirements: string[];

  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;

  numberOfPositions?: number;
  applicationDeadline?: Date;

  benefits?: string[];
  niceToHave?: string[];
  workingSchedule?: string[];
  isRemote?: boolean;
}

export type UpdateJobListingDTO = Partial<CreateJobListingDTO>;

// ============================================
// STATE TYPES (for Redux slices)
// ============================================
export interface JobState {
  jobs: JobListingSummary[];
  jobDetail: JobDetail | null;

  isLoading: boolean;
  error: string | null;

  // Pagination from API response
  pagination: {
    currentPage: number;
    limitItems: number;
    totalPage: number;
  } | null;
  totalRecords: number;
}

export interface RecruiterJobState {
  myJobs: RecruiterJobPosting[];

  isLoading: boolean;
  error: string | null;

  // Local filters (client-side)
  filters: {
    status?: "draft" | "active" | "hidden" | "closed";
    searchQuery?: string;
  };
}

export interface AdminJobState {
  allJobs: JobListingSummary[];
  pendingJobs: JobListingSummary[];

  isLoading: boolean;
  error: string | null;

  filters: {
    approvalStatus?: "pending" | "approved" | "rejected";
    status?: "draft" | "active" | "hidden" | "closed";
    searchQuery?: string;
  };

  pagination: {
    currentPage: number;
    limitItems: number;
    totalPage: number;
  } | null;
  totalRecords: number;

  selectedJobForApproval: string | null;
}
