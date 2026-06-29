// ==========================================
// BACKEND API RESPONSE TYPES
// ==========================================

/**
 * Job Listing Summary from Backend API
 * Endpoint: GET /api/v1/job-listings
 */
export interface JobListingSummaryDTO {
  id: string;
  title: string;
  companyName: string;
  salaryMin: number;
  salaryMax: number;
  benefits: string[];
  city: string;
  experienceLevel: string;
  logo: string;
}

/**
 * Job Detail from Backend API
 * Endpoint: GET /api/v1/job-listings/:id
 */
export interface JobDetailDTO {
  id: string;
  title: string;
  salaryMin: number;
  salaryMax: number;
  location: {
    address: string;
    district: string;
    city: string;
  };
  experienceLevel: string;
  applicationDeadline: string | null;
  overview: string[];
  benefits: string[];
  responsibilities: string[];
  requirementSkill: string[];
  numberOfPositions: number;
  jobType: string;
  workingSchedule: string[];
  niceToHave: string[];
  company: {
    name: string;
    logo?: string;
  };
  recruiterId: string;
  recruiterName: string;
}

/**
 * Pagination structure from Backend
 */
export interface Pagination {
  currentPage: number;
  limitItems: number;
  skip: number;
  totalPage: number;
}

/**
 * Job Listings API Response
 */
export interface JobListingsResponse {
  ok: boolean;
  pagination: Pagination;
  totalRecords: number;
  data: JobListingSummaryDTO[];
}

// ==========================================
// FRONTEND UI TYPES
// ==========================================

/**
 * Job interface for Frontend usage
 * Used in components, hooks, and pages
 */
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: { min: number; max: number } | string;
  experience: string;
  level: 'staff' | 'manager' | 'director';
  industry: string;
  workType: 'onsite' | 'remote' | 'hybrid';
  postedDate: string;
  updatedDate: string;
  popularity?: number;
  benefits?: string[];
  companyLogo?: string;
  isListed?: boolean;
  tags?: string[];
  isFavorite?: boolean; // Flag for authenticated users, indicates if job is favorited
  recruiterId?: string;
  recruiterName?: string;
}

// ==========================================
// TRANSFORMATION FUNCTIONS
// ==========================================

/**
 * Transform Backend JobListingSummaryDTO to Frontend Job
 */
export const transformJobListingToJob = (dto: JobListingSummaryDTO): Job => {
  // Handle missing or null values with defaults
  const id = dto.id || '';
  const title = dto.title || 'Unknown Job';
  const companyName = dto.companyName || 'Unknown Company';
  const city = dto.city || 'Unknown Location';
  const experienceLevel = dto.experienceLevel || 'Not specified';
  const salaryMin = dto.salaryMin || 0;
  const salaryMax = dto.salaryMax || 0;
  const benefits = Array.isArray(dto.benefits) ? dto.benefits : [];
  const logo = dto.logo || '';

  return {
    id,
    title,
    company: companyName,
    description: '', // Not available in list API, will be empty
    location: city,
    salary: {
      min: salaryMin,
      max: salaryMax,
    },
    experience: experienceLevel,
    level: 'staff', // Not available in BE, default value
    industry: '', // Not available in list API
    workType: 'onsite', // Not available in BE, default value
    postedDate: new Date().toISOString(), // Not available in BE
    updatedDate: new Date().toISOString(), // Not available in BE
    popularity: 0, // Not available in BE
    benefits: benefits,
    companyLogo: logo,
    isListed: true,
    tags: [], // Not available in BE
    isFavorite: false, // Default for list view
  };
};

/**
 * Transform Backend JobDetailDTO to Frontend Job
 */
export const transformJobDetailToJob = (dto: JobDetailDTO): Job => {
  // Safely handle location - it can be object or string
  let locationString = '';
  if (dto.location && typeof dto.location === 'object') {
    const { address, district, city } = dto.location;
    locationString = [address, district, city].filter(Boolean).join(', ');
  } else if (typeof dto.location === 'string') {
    locationString = dto.location;
  }

  return {
    id: dto.id,
    title: dto.title,
    company: dto.company.name,
    description: dto.overview.join('\n'),
    location: locationString,
    salary: {
      min: dto.salaryMin,
      max: dto.salaryMax,
    },
    experience: dto.experienceLevel,
    level: 'staff', // Not available in BE, default value
    industry: '', // Not available in BE
    workType: 'onsite', // Could be inferred from jobType if needed
    postedDate: new Date().toISOString(), // Not available in BE
    updatedDate: new Date().toISOString(), // Not available in BE
    popularity: 0, // Not available in BE
    benefits: dto.benefits,
    companyLogo: dto.company.logo,
    isListed: true,
    tags: dto.requirementSkill, // Use skills as tags
    recruiterId: dto.recruiterId,
    recruiterName: dto.recruiterName,
  };
};
