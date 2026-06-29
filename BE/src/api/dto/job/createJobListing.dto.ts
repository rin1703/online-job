export class CreateJobListingDTO {
  title: string;
  recruiterId: string;
  jobType: string; // FE sends job type name; service will resolve to ID
  experienceLevel: string;

  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  numberOfPositions?: number;
  applicationDeadline?: Date; // FE sends ISO string; service will parse to Date

  // Các trường trong JobDescription
  overview: string[];
  responsibilities: string[];
  requirements: string[];
  benefits?: string[];
  niceToHave?: string[];
  workingSchedule?: string[];
  isRemote?: boolean;

  constructor(data: {
    title: string;
    recruiterId: string;
    jobType: string;
    experienceLevel: string;

    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    numberOfPositions?: number;
    applicationDeadline?: Date;

    overview: string[];
    responsibilities: string[];
    requirements: string[];
    benefits?: string[];
    niceToHave?: string[];
    workingSchedule?: string[];
    isRemote?: boolean;
  }) {
    this.title = data.title;
    this.recruiterId = data.recruiterId;
    this.jobType = data.jobType;
    this.experienceLevel = data.experienceLevel;

    this.salaryMin = data.salaryMin ?? 0;
    this.salaryMax = data.salaryMax ?? 0;
    this.salaryCurrency = data.salaryCurrency ?? "USD";
    this.numberOfPositions = data.numberOfPositions ?? 1;
    this.applicationDeadline = data.applicationDeadline;

    this.overview = data.overview;
    this.responsibilities = data.responsibilities;
    this.requirements = data.requirements;
    this.benefits = data.benefits ?? [];
    this.niceToHave = data.niceToHave ?? [];
    this.workingSchedule = data.workingSchedule ?? [];
    this.isRemote = data.isRemote ?? false;
  }
}
