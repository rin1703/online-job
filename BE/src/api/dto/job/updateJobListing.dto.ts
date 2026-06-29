export class UpdateJobListingDTO {
  // 🧱 Basic info
  title?: string;
  jobType?: string;
  experienceLevel?: string;

  // 💰 Salary
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;

  // 📅 Details
  numberOfPositions?: number;
  applicationDeadline?: Date;

  // 📋 Job Description
  overview?: string[];
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  niceToHave?: string[];
  workingSchedule?: string[];
  isRemote?: boolean;
  constructor(partial: Partial<UpdateJobListingDTO> = {}) {
    // 🧱 Basic info
    this.title = partial.title;
    this.jobType = partial.jobType;
    this.experienceLevel = partial.experienceLevel;

    // 💰 Salary
    this.salaryMin = partial.salaryMin;
    this.salaryMax = partial.salaryMax;
    this.salaryCurrency = partial.salaryCurrency;

    // 📅 Details
    this.numberOfPositions = partial.numberOfPositions;

    // Xử lý đặc biệt cho Date nếu cần thiết, ví dụ:
    this.applicationDeadline = partial.applicationDeadline
      ? new Date(partial.applicationDeadline)
      : undefined;

    // 📋 Job Description
    this.overview = partial.overview;
    this.responsibilities = partial.responsibilities;
    this.requirements = partial.requirements;
    this.benefits = partial.benefits;
    this.niceToHave = partial.niceToHave;
    this.workingSchedule = partial.workingSchedule;
    this.isRemote = partial.isRemote;
  }
}
