export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

export interface WorkExperience {
  id: number;
  position: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description?: string;
}

export interface Skill {
  id: number;
  name: string;
  level?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}
