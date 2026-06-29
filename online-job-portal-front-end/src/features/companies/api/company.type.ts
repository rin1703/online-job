export interface BaseResponse {
  success: boolean;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Thêm Interface cho Industry Object
export interface Industry {
  _id: string;
  name: string;
  description?: string;
}

export interface Company {
  _id: string;
  name: string;
  normalizedName?: string;
  taxCode?: string;
  description?: string;
  website?: string;
  websiteDomain?: string;
  email?: string;
  phone?: string;
  logo?: string;
  industry?: Industry;
  industryId?: string;
  employeeCount?: string | number;
  foundedYear?: number;
  verificationStatus: "verified" | "rejected" | "pending";
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetCompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetCompaniesResponse extends BaseResponse {
  data: Company[];
  pagination: Pagination;
}

export interface GetCompanyResponse extends BaseResponse {
  data: Company;
}

export interface UpdateCompanyRequest {
  _id: string;
  name?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  industryId?: string;
  employeeCount?: string | number;
  foundedYear?: number;
  taxCode?: string;
  verificationStatus?: string;
}

export interface UpdateCompanyResponse extends BaseResponse {
  data: Company;
}

export interface DeleteCompanyResponse extends BaseResponse {
  message: string;
}

export interface FilterCompaniesParams {
  page?: number;
  limit?: number;
  name?: string;
  industry?: string;
  industryId?: string;
  employeeCount?: string;
  foundedYearFrom?: number;
  foundedYearTo?: number;
  sort?: "asc" | "desc" | "a-z" | "z-a";
  verificationStatus?: string;
}

export interface GetIndustriesResponse extends BaseResponse {
  data: Industry[];
}

