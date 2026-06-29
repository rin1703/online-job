import type { Role } from "@/redux/common/common.type";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

// Forgot Password Types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

// Reset Password Types
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Change Password Types
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}