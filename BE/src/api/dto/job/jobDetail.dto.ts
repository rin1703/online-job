export class JobDetailDTO {
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
  applicationDeadline: Date | null;
  overview: string[];
  benefits: string[];
  responsibilities: string[];
  requirementSkill: string[];
  numberOfPositions: number;
  jobType: string; // e.g., "Part-time"
  workingSchedule: string[];
  niceToHave: string[];
  company: {
    name: string;
    logo?: string;
  };
  applicationDate?: Date | null; // Thêm trường này
  isRemote?: boolean; // Thêm trường này
  recruiterId: string;
  recruiterName: string;
}
