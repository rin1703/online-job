import { z } from "zod";

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"] as const;
export const EXPERIENCE_LEVELS = [
  "Intern",
  "Fresher",
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead",
  "Manager",
  "Director",
] as const;

const listItemSchema = z.object({ value: z.string() });
type ListItem = z.infer<typeof listItemSchema>;

const baseJobSchema = z.object({
  title: z.string().min(1, "Job title is required"),

  jobType: z.string().min(1, "Job type is required"),
  experienceLevel: z.string().min(1, "Experience level is required"),

  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.enum(["USD", "VND", "EUR"]),
  numberOfPositions: z.number().min(1, "Vacancies must be at least 1"),
  applicationDeadline: z.string().min(1, "Application deadline is required"),
  isRemote: z.boolean(),

  overview: z
    .array(listItemSchema)
    .refine(
      (items: ListItem[]) => items.length > 0 && items.some((item) => item.value.trim() !== ""),
      {
        message: "At least one overview item is required",
      },
    ),

  responsibilities: z
    .array(listItemSchema)
    .refine(
      (items: ListItem[]) => items.length > 0 && items.some((item) => item.value.trim() !== ""),
      {
        message: "At least one responsibility is required",
      },
    ),

  requirements: z
    .array(listItemSchema)
    .refine(
      (items: ListItem[]) => items.length > 0 && items.some((item) => item.value.trim() !== ""),
      {
        message: "At least one requirement is required",
      },
    ),

  benefits: z.array(listItemSchema).optional(),
  niceToHave: z.array(listItemSchema).optional(),
  workingSchedule: z.array(listItemSchema).optional(),
});

type BaseJobValues = z.infer<typeof baseJobSchema>;

export const jobFormSchema = baseJobSchema.refine(
  (data: BaseJobValues) => {
    if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  },
  {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["salaryMax"],
  },
);

export type JobFormValues = z.infer<typeof jobFormSchema>;

export const defaultJobFormValues: JobFormValues = {
  title: "",
  jobType: "",
  experienceLevel: "",
  salaryMin: undefined,
  salaryMax: undefined,
  salaryCurrency: "USD",
  numberOfPositions: 1,
  applicationDeadline: "",
  isRemote: false,
  overview: [],
  responsibilities: [],
  requirements: [],
  benefits: [],
  niceToHave: [],
  workingSchedule: [],
};
