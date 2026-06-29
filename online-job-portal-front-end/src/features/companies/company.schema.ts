import { z } from "zod";

export const COMPANY_SIZES = ["Medium", "Large", "Very Large"] as const;

export const companyFormSchema = z.object({
  // --- Form Fields (Write) ---
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  industryId: z.string().optional(),
  employeeCount: z.enum(COMPANY_SIZES).or(z.string()).or(z.number()).optional(),
  foundedYear: z.coerce
    .number()
    .min(1800, "Invalid year")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  taxCode: z.string().optional(),

  // --- Display Fields (Read-only / API Response) ---
  // Thêm vào đây để z.infer sinh ra type đầy đủ
  _id: z.string().optional(),
  verificationStatus: z.string().optional(),
  logo: z.string().optional(),
  industry: z.object({ _id: z.string(), name: z.string(), description: z.string() }).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const defaultCompanyFormValues: CompanyFormValues = {
  name: "",
  description: "",
  website: "",
  email: "",
  phone: "",
  industryId: "",
  employeeCount: "",
  foundedYear: undefined,
  taxCode: "",
  // Các trường display mặc định là undefined
};
