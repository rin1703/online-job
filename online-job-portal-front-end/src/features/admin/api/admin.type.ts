export type ApprovalStatus = 'approved' | 'rejected' | 'pending';
export type RefundType = 'unused' | 'system';

export interface UpdateJobApprovalStatusRequest {
  jobId: string;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
}

export interface UpdateJobApprovalStatusResponse {
  success: boolean;
  message: string;
}

// Subscription package types returned from BE
export interface SubscriptionPackage {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  type?: string;
  price: number;
  originalPrice?: number | null;
  duration?: {
    value: number;
    unit?: string;
  };
  features?: any;
  badge?: string | null;
  isActive?: boolean;
  displayOrder?: number;
  description?: string;
  shortDescription?: string;
  createdAt?: string;
}

export interface GetSubscriptionPackagesResponse {
  success: boolean;
  count?: number;
  data: SubscriptionPackage[];
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RecruiterInfo {
  id: string;
  name: string;
  email: string;
}

export interface AdminRefundRequest {
  id: string;
  recruiter: RecruiterInfo;
  package: string;
  amount: number;
  reason: string;
  refundType: RefundType;
  status: ApprovalStatus;
}

export interface ListAdminRefundsResponse {
  ok: boolean;
  data: AdminRefundRequest[];
  pagination: Pagination;
}

export interface UpdateRefundStatusRequest {
  refundId: string;
  action: 'approve' | 'reject';
  notes?: string;
}

export interface UpdateRefundStatusResponse {
  ok: boolean;
  status: string;
}

export interface DeletePackageRequest {
  packageId: string;
  permanent?: boolean;
}

export interface DeletePackageResponse {
  success: boolean;
  message: string;
}

export interface UpdatePackageRequest {
  packageId: string;
  name?: string;
  price?: number;
  duration?: {
    value: number;
    unit?: 'day' | 'month' | 'year';
  };
  features?: any;
  badge?: string | null;
  isActive?: boolean;
  description?: string;
  shortDescription?: string;
}

export interface UpdatePackageResponse {
  success: boolean;
  message: string;
  data?: SubscriptionPackage;
}

export interface CreatePackageRequest {
  name: string;
  type?: string;
  price: number;
  duration: {
    value: number;
    unit: 'day' | 'month' | 'year';
  };
  features: {
    jobPostings: {
      limit: number;
      featured: number;
      visibleDuration: number;
    };
    candidateSearch: {
      enabled: boolean;
      viewsPerMonth: number;
      downloadCV: boolean;
    };
    messaging: {
      enabled: boolean;
      messagesPerMonth: number;
    };
    support: {
      priority: string;
      analytics: boolean;
      advancedReports: boolean;
    };
    advertising: {
      homepageBanner: boolean;
      emailCampaign: number;
      socialMediaPromotion: boolean;
    };
  };
  description?: string;
  shortDescription?: string;
  badge?: string | null;
  isActive?: boolean;
}

export interface CreatePackageResponse {
  success: boolean;
  message: string;
  data?: SubscriptionPackage;
}
