export class RecruiterJobPostingDTO {
  public id: string;
  public title: string;
  public salaryMin: number;
  public salaryMax: number;
  public experienceLevel: string;
  public status: string;
  public isDeleted: boolean;
  public createdAt: Date;
  public updatedAt: Date;
  public approvalStatus: string;
  public views: number;
  public totalApplications?: number;

  constructor(data: {
    id: string;
    title: string;
    salaryMin: number;
    salaryMax: number;
    experienceLevel: string;
    status: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    views: number;
    approvalStatus: string;
    totalApplications?: number;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.salaryMin = data.salaryMin;
    this.salaryMax = data.salaryMax;
    this.experienceLevel = data.experienceLevel;
    this.approvalStatus = data.approvalStatus || "pending";
    this.status = data.status;
    this.isDeleted = data.isDeleted;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.views = data.views;
    this.totalApplications = data.totalApplications || 0;
  }
}
