// Profile types matching BE schema

export interface SocialLink {
  platform: 'github' | 'linkedin' | 'facebook' | 'instagram' | 'website' | string;
  url: string;
}

export interface WorkExperience {
  _id?: string;
  title: string;
  company: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  isCurrent: boolean;
  description?: string;
}

export interface Education {
  _id?: string;
  school: string;
  degree: string;
  startDate: string | Date;
  endDate?: string | Date;
  description?: string;
}

export interface Project {
  _id?: string;
  name: string;
  description?: string;
  technologies?: string[];
  githubUrl?: string;
  demoUrl?: string;
}

export interface Certificate {
  _id?: string;
  title: string;
  organization: string;
  issueDate: string | Date;
  credentialUrl?: string;
}

export interface SkillCategory {
  _id?: string;
  categoryName: string;
  skills: string[];
}

export type JobSkills = SkillCategory[];

/**
 * UserProfile - Matches BE Profile model with FE-specific additions
 * BE: /BE/src/api/models/profile.model.ts
 *
 * IMPORTANT FIELD NAMES (different from common conventions):
 * - user (not userId) - ObjectId reference to User model
 * - education (not educations) - singular, not plural
 * - jobSkills (not skills) - prefixed with "job"
 *
 * FE-ONLY FIELDS (not in BE):
 * - website - stored in FE only, not sent to BE
 */
export interface UserProfile {
  _id: string;
  user: {
    _id: string;
    role: 'job_seeker' | 'recruiter' | 'admin';
    email: string;
    firstName: string;
    lastName: string;
  };
  name: string; // Required
  avatar?: string; // Image URL
  title?: string; // Job title: "Full Stack Developer"
  company?: string; // Current company: "FPT Software"
  bio?: string; // Biography/About me
  location?: string; // "Hà Nội, Việt Nam"
  email?: string; // Contact email
  phone?: string; // Contact phone
  expectedSalary?: number; // Expected salary in USD
  careerObjective?: string; // Career objectives/goals
  cv?: string; // CV URL (PDF)
  cvUrl?: string; // Alias for cv (FE compatibility)
  website?: string; // ⚠️ FE-ONLY field (not in BE, kept for compatibility)
  socialLinks?: SocialLink[];
  jobSkills?: JobSkills; // ⚠️ BE field name is "jobSkills", not "skills"
  workExperiences?: WorkExperience[];
  education?: Education[]; // ⚠️ BE field name is "education", not "educations" (singular)
  projects?: Project[];
  certificates?: Certificate[];
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

/**
 * UpdateProfileDTO - Matches BE UpsertProfileDTO with FE additions
 * FE-ONLY: website (will be filtered out before sending to BE)
 */
export interface UpdateProfileDTO {
  name?: string;
  avatar?: string;
  title?: string;
  company?: string;
  bio?: string;
  location?: string;
  email?: string;
  phone?: string;
  expectedSalary?: number;
  careerObjective?: string;
  cv?: string;
  website?: string; // ⚠️ FE-ONLY field (will be filtered before sending to BE)
  socialLinks?: SocialLink[];
  jobSkills?: JobSkills; // ⚠️ Use "jobSkills", not "skills"
  workExperiences?: WorkExperience[];
  education?: Education[]; // ⚠️ Use "education", not "educations"
  projects?: Project[];
  certificates?: Certificate[];
}

export interface AddWorkExperienceDTO {
  title: string;
  company: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  isCurrent: boolean;
  description?: string;
}

export interface UpdateWorkExperienceDTO extends Partial<AddWorkExperienceDTO> { }

// Response DTOs
export interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    avatar?: string;
    cv?: string;
    public_id: string;
  };
}
