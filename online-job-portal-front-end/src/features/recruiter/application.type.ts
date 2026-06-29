export const ApplicationStatus = {
  PENDING: "pending",                 
  REVIEWED: "reviewed",                    
  APPROVED: "approved",                    
  REJECTED: "rejected",                    
  INTERVIEW_SCHEDULED: "interview_scheduled", 
  WITHDRAWN: "withdrawn",                  
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

// KHỚP VỚI BACKEND
export interface JobSeeker {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

//  KHỚP VỚI BACKEND - ĐỔI TÊN TỪ "Post" SANG "Job"
export interface Job {
  _id: string;
  title: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
}

export interface Recruiter {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// MAIN TYPE - KHỚP VỚI BACKEND RESPONSE
export interface Application {
  _id: string;
  jobId: Job; // Đổi từ "postId" sang "jobId"
  jobSeekerId: JobSeeker;
  recruiterId: Recruiter;
  resume: string; // Đổi từ "cv" sang "resume"
  coverLetter?: string;
  expectedSalary?: number;
  availableDate?: string;
  status: ApplicationStatus;
  recruiterNote?: string;
  reviewedAt?: string;
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  source?: string;
  appliedAt: string; //  Đổi từ "appliedDate" sang "appliedAt"
  createdAt: string;
  updatedAt: string;
  
  //  OPTIONAL - Nếu cần thêm FE fields
  rating?: number;
  notes?: string;
}

export interface ApplicationsResponse {
  success: boolean;
  data: {
    applications: Application[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}