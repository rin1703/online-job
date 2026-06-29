import { z } from "zod";

// Job Seeker Schema - theo đúng yêu cầu
export const jobSeekerSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
    .min(6, "Confirm password must be at least 6 characters"),
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),
  birthday: z.string()
    .min(1, "Birthday is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 16;
    }, "You must be at least 16 years old"),
  phone: z.string()
    .regex(/^\d{10,11}$/, "Phone number must be 10 or 11 digits"),
  role: z.literal("job_seeker"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and policies"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Recruiter Schema - theo đúng yêu cầu
export const recruiterSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
    .min(6, "Confirm password must be at least 6 characters"),
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),
  birthday: z.string()
    .min(1, "Birthday is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18;
    }, "You must be at least 18 years old"),
  phone: z.string()
    .regex(/^\d{10,11}$/, "Phone number must be 10 or 11 digits"),
  companyName: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must not exceed 100 characters"),
  taxCode: z.string()
    .min(10, "Tax code must be at least 10 characters")
    .max(20, "Tax code must not exceed 20 characters")
    .regex(/^[A-Z0-9\-]+$/, "Tax code must contain only uppercase letters, numbers, and hyphens"),
  companyWebsite: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  houseNumber: z.string()
    .min(1, "House number is required")
    .max(20, "House number must not exceed 20 characters"),
  streetName: z.string()
    .min(2, "Street name must be at least 2 characters")
    .max(100, "Street name must not exceed 100 characters"),
  location: z.string()
    .min(5, "Please select a valid location (Ward, District, Province)"),
  role: z.literal("recruiter"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and policies"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type JobSeekerFormData = z.infer<typeof jobSeekerSchema>;
export type RecruiterFormData = z.infer<typeof recruiterSchema>;
export type SignUpFormData = JobSeekerFormData | RecruiterFormData;