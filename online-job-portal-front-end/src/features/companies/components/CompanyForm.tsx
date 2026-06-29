import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  FileText,
  Users,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  companyFormSchema,
  defaultCompanyFormValues,
  COMPANY_SIZES,
  type CompanyFormValues,
} from "../company.schema";

interface InputFieldProps {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon: Icon,
  children,
  required,
  error,
  className,
}) => (
  <div className={cn("space-y-2", className)}>
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {label}
      {required && <span className="text-primary">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

interface CompanyFormProps {
  onSubmit: (data: CompanyFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Partial<CompanyFormValues>;
  mode?: "create" | "update";
  readOnly?: boolean;
}

export default function CompanyForm({ onSubmit, initialData, readOnly = false }: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema) as any,
    defaultValues: defaultCompanyFormValues,
  });

  useEffect(() => {
    if (initialData) {
      const resetData: CompanyFormValues = {
        ...defaultCompanyFormValues,
        ...initialData,
        employeeCount: initialData.employeeCount ? String(initialData.employeeCount) : "",
      };
      reset(resetData);
    }
  }, [initialData, reset]);

  return (
    <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Basic Info */}
        <InputField
          label="Company Name"
          icon={Building2}
          required={!readOnly}
          error={errors.name?.message}
        >
          <input
            {...register("name")}
            disabled={readOnly}
            placeholder="e.g. Tech Corp Vietnam"
            required
            className={cn(
              "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 disabled:text-gray-500",
              errors.name ? "border-red-300 bg-red-50/50" : "border-gray-200",
            )}
          />
        </InputField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField label="Website" icon={Globe} error={errors.website?.message}>
            <input
              {...register("website")}
              disabled={readOnly}
              placeholder="https://company.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
            />
          </InputField>

          <InputField label="Email" icon={Mail} error={errors.email?.message}>
            <input
              {...register("email")}
              disabled={readOnly}
              placeholder="contact@company.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
            />
          </InputField>

          <InputField label="Phone" icon={Phone} error={errors.phone?.message}>
            <input
              {...register("phone")}
              disabled={readOnly}
              placeholder="+84 90..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
            />
          </InputField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Employee Count" icon={Users} error={errors.employeeCount?.message}>
            <select
              {...register("employeeCount")}
              disabled={readOnly}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select size</option>
              {COMPANY_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} employees
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Founded Year" icon={Calendar} error={errors.foundedYear?.message}>
            <input
              type="number"
              {...register("foundedYear")}
              disabled={readOnly}
              placeholder="e.g. 2010"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
            />
          </InputField>
        </div>

        <InputField label="Description" icon={FileText} error={errors.description?.message}>
          <textarea
            {...register("description")}
            disabled={readOnly}
            rows={5}
            placeholder="About the company..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </InputField>
      </div>

      {!readOnly && (
        <div className="hidden">
          <button type="submit" />
        </div>
      )}
    </form>
  );
}
