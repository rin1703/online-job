export type ObjectIdString = string;

export interface UpsertProfileDTO {
  userId: ObjectIdString;         // from param or auth
  name: string;
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

  socialLinks?: { platform: string; url: string }[];
  jobSkills?: {
    frontend?: string[];
    backend?: string[];
    devops?: string[];
    softSkills?: string[];
  };

  workExperiences?: {
    _id?: ObjectIdString;
    title: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    isCurrent: boolean;
    description?: string;
  }[];

  education?: {
    _id?: ObjectIdString;
    school: string;
    degree: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];

  projects?: {
    _id?: ObjectIdString;
    name: string;
    description?: string;
    technologies?: string[];
    githubUrl?: string;
    demoUrl?: string;
  }[];

  certificates?: {
    _id?: ObjectIdString;
    title: string;
    organization: string;
    issueDate: string;
    credentialUrl?: string;
  }[];
}
