/**
 * ========== USER ACCOUNT LIST DTOs ==========
 * Data Transfer Objects cho Admin User Management
 */

import { UserRole } from "../models/enum/userRole.enum";

/**
 * DTO cho query parameters khi lấy danh sách user
 */
export class GetUserAccountListDTO {
  // Pagination
  page?: number;
  limit?: number;

  // Filters
  role?: UserRole | string;
  status?: "active" | "inactive" | "locked";
  search?: string; // Tìm kiếm theo email (phải đúng format email)
  dateFrom?: string; // Format: YYYY-MM-DD
  dateTo?: string; // Format: YYYY-MM-DD

  // Sorting
  sortBy?: "createdAt" | "updatedAt" | "email" | "fullName";
  sortOrder?: "asc" | "desc";

  constructor(data: {
    page?: string | number;
    limit?: string | number;
    role?: UserRole | string;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    this.page = data.page ? parseInt(String(data.page)) : 1;
    this.limit = data.limit ? parseInt(String(data.limit)) : 10;
    this.role = data.role;
    this.status = data.status as "active" | "inactive" | "locked" | undefined;
    this.search = data.search;
    this.dateFrom = data.dateFrom;
    this.dateTo = data.dateTo;
    this.sortBy = (data.sortBy || "createdAt") as "createdAt" | "updatedAt" | "email" | "fullName";
    this.sortOrder = (data.sortOrder || "desc") as "asc" | "desc";
  }
}

/**
 * DTO cho thông tin statistics của user
 */
export interface UserStatisticsDTO {
  // Cho job_seeker
  totalInterviews?: number;
  totalApplications?: number;

  // Cho recruiter
  totalPackages?: number;
  totalJobPosts?: number;

  lastActivity: Date | null;
}

/**
 * DTO cho thông tin status của user
 */
export interface UserStatusDTO {
  isActive: boolean;
  isLocked: boolean;
  isInactive: boolean;
  lockReason?: string;
  lockUntil?: Date | null;
  inactiveReason?: string;
  lastLogin?: Date | null;
}

/**
 * DTO cho thông tin user trong danh sách
 */
export interface UserAccountItemDTO {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  birthday: Date;
  phone: string;
  isActive: boolean;
  loginAttempts: number;
  lockUntil: Date | null;
  companyId: string | null;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;
  statistics: UserStatisticsDTO;
  status: UserStatusDTO;
}

/**
 * DTO cho pagination response
 */
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * DTO cho filters response
 */
export interface FiltersDTO {
  applied: {
    role?: string;
    status?: string;
    search?: string;
    dateRange?: {
      from?: string;
      to?: string;
    };
  };
  available: {
    roles: string[];
    statuses: string[];
    dateRange: {
      from: string;
      to: string;
    };
  };
}

/**
 * DTO cho response của getUserAccountList
 */
export interface UserAccountListResponseDTO {
  success: boolean;
  message: string;
  data: UserAccountItemDTO[];
  pagination: PaginationDTO;
  filters: FiltersDTO;
}






