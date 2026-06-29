import { Types } from "mongoose";

export class JobListingSummaryDTO {
  id: string;
  title: string;
  companyName: string;
  salaryMin: number;
  salaryMax: number;
  benefits: string[];
  city: string;
  experienceLevel: string;
  logo: string;

  constructor(job: any) {
    this.id = job._id instanceof Types.ObjectId ? job._id.toString() : job._id;
    this.title = job.title;
    this.companyName = job.companyId?.name || "Unknown Company";
    this.salaryMin = job.salaryMin;
    this.salaryMax = job.salaryMax;
    this.benefits = job.benefits || [];
    this.city = job.locationId?.location?.city || "Unknown";
    this.experienceLevel = job.experienceLevel;
    this.logo = job.companyId?.logo || "";
  }
}

export class JobListingAdminDTO {
  id: string;
  title: string;
  companyName: string;
  salaryMin: number;
  salaryMax: number;
  jobType: string;
  city: string;
  createDate: Date;
  approvalStatus: string;
  recruiterName: string;

  constructor(job: any) {
    this.id = job._id instanceof Types.ObjectId ? job._id.toString() : job._id;
    this.title = job.title;
    this.companyName = job.companyId?.name || "Unknown Company";
    this.salaryMin = job.salaryMin;
    this.salaryMax = job.salaryMax;
    this.jobType = job.jobType; // Adicionado
    this.city = job.locationId?.location?.city || "Unknown";
    this.createDate = job.createDate; // Adicionado
    this.approvalStatus = job.approvalStatus; // Adicionado
    this.recruiterName = job.recruiterName || "Unknown Recruiter"; // Adicionado
  }
}
