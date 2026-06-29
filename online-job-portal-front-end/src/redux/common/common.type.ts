export type Role = 'admin' | 'recruiter' | 'job_seeker';

export interface User {
  _id: string;
  email?: string;
  role: Role;
  birthday: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  loginAttempts: number;
  lockUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}