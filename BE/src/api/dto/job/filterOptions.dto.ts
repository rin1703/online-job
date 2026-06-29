/**
 * DTO for Job Filter Options Response
 * Trả về các lựa chọn filter động dựa trên data thực tế trong database
 */

export interface IndustryOptionDTO {
  _id: string;
  name: string;
  jobCount: number;
}

export interface JobTypeOptionDTO {
  _id: string;
  name: string;
  jobCount: number;
}

export interface LocationOptionDTO {
  _id: string;
  city: string;
  country?: string;
  jobCount: number;
}

export interface ExperienceLevelOptionDTO {
  value: string;
  label: string;
  jobCount: number;
}

export interface SalaryRangeDTO {
  min: number;
  max: number;
  currency: string;
}

export interface FilterOptionsResponseDTO {
  success: boolean;
  message: string;
  data: {
    industries: IndustryOptionDTO[];
    jobTypes: JobTypeOptionDTO[];
    locations: LocationOptionDTO[];
    experienceLevels: ExperienceLevelOptionDTO[];
    salaryRange: SalaryRangeDTO;
    workModes: {
      remote: number;
      hybrid: number;
      onsite: number;
    };
    totalActiveJobs: number;
  };
}
