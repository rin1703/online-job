import React, { useState } from "react";
import type { ReactNode } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  DollarSign,
  FileText,
  Calendar,
  Users,
  Globe,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Building2,
  MapPin,
  GraduationCap,
  AlertCircle,
  ChevronsUpDown,
  Check,
} from "lucide-react";

// --- Shadcn UI Imports ---
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Btn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// Import ConfirmDialog
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import type { JobFormValues } from "../job.schema";
import { jobFormSchema, defaultJobFormValues, JOB_TYPES, EXPERIENCE_LEVELS } from "../job.schema";

// ================= InputField =================
interface InputFieldProps {
  label: string;
  icon?: React.ElementType;
  children: ReactNode;
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

// ================= DynamicListSection =================
interface DynamicListSectionProps {
  control: any;
  name: keyof JobFormValues & string;
  title: string;
  icon: React.ElementType;
  placeholder: string;
  required?: boolean;
  error?: string;
}

const DynamicListSection: React.FC<DynamicListSectionProps> = ({
  control,
  name,
  title,
  icon: Icon,
  placeholder,
  required,
  error,
}) => {
  const { fields, append, remove } = useFieldArray({ control, name: String(name) });
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gray-100 text-gray-500">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-medium text-gray-800">{title}</span>
          {required && <span className="text-primary">*</span>}
        </div>
        <Button
          variant="custom"
          type="button"
          onClick={() => append({ value: "" })}
          className="text-primary hover:bg-primary/10"
          startIcon={<Plus />}
        >
          <p>Add</p>
        </Button>
      </div>

      <div className="space-y-2">
        {fields.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center ${
              error ? "border-red-300 bg-red-50/50" : "border-gray-200"
            }`}
          >
            <div className={`text-sm ${error ? "text-red-500" : "text-gray-400"}`}>
              {error || 'No items yet. Click "Add" to start.'}
            </div>
          </div>
        ) : (
          <>
            {fields.map((field, index) => (
              <Controller
                key={field.id}
                name={`${name}.${index}.value` as const}
                control={control}
                render={({ field: controllerField }) => (
                  <div className="flex gap-2 group">
                    <div className="flex items-center justify-center w-6 h-10 text-xs font-medium text-gray-400">
                      {index + 1}.
                    </div>
                    <input
                      {...controllerField}
                      placeholder={placeholder}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <Button
                      variant="custom"
                      type="button"
                      startIcon={<Trash2 />}
                      onClick={() => remove(index)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    />
                  </div>
                )}
              />
            ))}
            {error && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-2">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ================= CREATABLE SELECT COMPONENT =================
interface CreatableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  error?: boolean;
}

const CreatableSelect: React.FC<CreatableSelectProps> = ({
  value = "",
  onChange,
  options,
  placeholder = "Select or type...",
  error,
}) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full p-0 h-auto text-sm font-normal rounded-xl border-gray-200 hover:bg-white hover:text-foreground bg-white overflow-hidden",
            !value && "text-muted-foreground",
            error && "border-red-300 bg-red-50/50 hover:bg-red-50/50",
          )}
        >
          <div className="flex w-full items-center justify-between px-4 py-2.5">
            <span className="truncate flex-1 text-left">{value ? value : placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or create..."
            onValueChange={(val) => setInputValue(val)}
          />
          <CommandList>
            <CommandEmpty>
              <div
                className="py-3 px-4 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center gap-2"
                onClick={() => {
                  onChange(inputValue);
                  setOpen(false);
                }}
              >
                <Plus className="w-3 h-3" />
                Create {inputValue}
              </div>
            </CommandEmpty>
            <CommandGroup heading="Suggestions">
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value.toLowerCase() ? "" : option);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ================= JOB FORM =================
interface JobFormProps {
  onSubmit: (data: JobFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Partial<JobFormValues>;
  mode?: "create" | "update";
}

const JobForm: React.FC<JobFormProps> = ({
  onSubmit,
  isSubmitting = false,
  initialData,
  mode = "create",
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<JobFormValues | null>(null);

  const getDefaultValues = (): JobFormValues => {
    if (initialData && mode === "update") {
      return {
        ...defaultJobFormValues,
        ...initialData,
        overview: initialData.overview || defaultJobFormValues.overview,
        responsibilities: initialData.responsibilities || defaultJobFormValues.responsibilities,
        requirements: initialData.requirements || defaultJobFormValues.requirements,
        benefits: initialData.benefits || defaultJobFormValues.benefits,
        niceToHave: initialData.niceToHave || defaultJobFormValues.niceToHave,
        workingSchedule: initialData.workingSchedule || defaultJobFormValues.workingSchedule,
      } as JobFormValues;
    }
    return defaultJobFormValues as JobFormValues;
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: getDefaultValues(),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const [activeSection, setActiveSection] = React.useState<number>(0);
  const [attemptedNext, setAttemptedNext] = React.useState<Record<number, boolean>>({});

  const watchedValues = watch();

  const sections = [
    { id: 0, title: "Basic Info", icon: Briefcase },
    { id: 1, title: "Compensation", icon: DollarSign },
    { id: 2, title: "Description", icon: FileText },
  ];

  const isSection0Valid = () => {
    const hasTitle = Boolean(watchedValues.title?.trim());
    const hasJobType = Boolean(watchedValues.jobType?.trim());
    const hasExperienceLevel = Boolean(watchedValues.experienceLevel?.trim());
    const hasDeadline = Boolean(watchedValues.applicationDeadline);

    const noErrors =
      !errors.title && !errors.jobType && !errors.experienceLevel && !errors.applicationDeadline;

    return hasTitle && hasJobType && hasExperienceLevel && hasDeadline && noErrors;
  };

  const isSection1Valid = () => {
    const { salaryMin, salaryMax } = watchedValues;
    const hasSalaries = salaryMin !== undefined && salaryMax !== undefined;
    const validRange = salaryMax !== undefined && salaryMin !== undefined && salaryMax >= salaryMin;
    const noErrors = !errors.salaryMin && !errors.salaryMax && !errors.salaryCurrency;

    return hasSalaries && validRange && noErrors;
  };

  const isSection2Valid = () => {
    const { overview, responsibilities, requirements } = watchedValues;
    const hasValidOverview =
      overview && overview.length > 0 && overview.some((item) => item.value?.trim() !== "");
    const hasValidResponsibilities =
      responsibilities &&
      responsibilities.length > 0 &&
      responsibilities.some((item) => item.value?.trim() !== "");
    const hasValidRequirements =
      requirements &&
      requirements.length > 0 &&
      requirements.some((item) => item.value?.trim() !== "");
    const noErrors = !errors.overview && !errors.responsibilities && !errors.requirements;

    return hasValidOverview && hasValidResponsibilities && hasValidRequirements && noErrors;
  };

  const getStepStatus = (stepId: number) => {
    if (stepId === 0 && attemptedNext[0] && isSection0Valid()) return "completed";
    if (stepId === 1 && attemptedNext[1] && isSection1Valid()) return "completed";
    if (stepId === 2 && attemptedNext[2] && isSection2Valid()) return "completed";
    if (stepId === activeSection) return "current";
    return "upcoming";
  };

  const handleSectionClick = (sectionId: number, status: string) => {
    if (status === "completed" || sectionId < activeSection) {
      setActiveSection(sectionId);
    }
  };

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAttemptedNext((prev) => ({ ...prev, [activeSection]: true }));

    let fieldsToValidate: (keyof JobFormValues)[] = [];

    if (activeSection === 0) {
      fieldsToValidate = ["title", "jobType", "experienceLevel", "applicationDeadline"];
    } else if (activeSection === 1) {
      fieldsToValidate = ["salaryMin", "salaryMax", "salaryCurrency"];
    } else if (activeSection === 2) {
      fieldsToValidate = ["overview", "responsibilities", "requirements"];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      if (activeSection === 0 && isSection0Valid()) {
        setActiveSection((prev: number) => prev + 1);
      } else if (activeSection === 1 && isSection1Valid()) {
        setActiveSection((prev: number) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    setActiveSection((prev: number) => prev - 1);
  };

  const handleFormSubmit = (data: JobFormValues) => {
    if (mode === "update") {
      setPendingData(data);
      setConfirmOpen(true);
    } else {
      onSubmit(data);
    }
  };

  const handleConfirmUpdate = () => {
    if (pendingData) {
      onSubmit(pendingData);
      setConfirmOpen(false);
    }
  };

  React.useEffect(() => {
    if (attemptedNext[activeSection]) {
      if (activeSection === 0) {
        trigger(["title", "jobType", "experienceLevel", "applicationDeadline"]);
      } else if (activeSection === 1) {
        trigger(["salaryMin", "salaryMax", "salaryCurrency"]);
      } else if (activeSection === 2) {
        trigger(["overview", "responsibilities", "requirements"]);
      }
    }
  }, [
    watchedValues.title,
    watchedValues.jobType,
    watchedValues.experienceLevel,
    watchedValues.applicationDeadline,
    watchedValues.salaryMin,
    watchedValues.salaryMax,
    watchedValues.salaryCurrency,
    watchedValues.overview,
    watchedValues.responsibilities,
    watchedValues.requirements,
    activeSection,
    attemptedNext,
    trigger,
  ]);

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
        {/* Section Navigation */}
        <div className="flex gap-2 p-1.5 mx-4 mb-4 bg-primary/10 rounded-2xl border border-primary/20">
          {sections.map((section) => {
            const status = getStepStatus(section.id);
            const IconComponent = section.icon;
            return (
              <Button
                variant="custom"
                type="button"
                key={section.id}
                onClick={() => handleSectionClick(section.id, status)}
                disabled={status === "upcoming"}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  status === "current"
                    ? "bg-white text-primary shadow-sm border border-primary/30"
                    : status === "completed"
                      ? "text-primary hover:bg-white/50 cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <IconComponent className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{section.title}</span>
              </Button>
            );
          })}
        </div>

        {/* Section Content */}
        <div className="flex-1 overflow-y-auto px-4">
          {activeSection === 0 && (
            <div className="space-y-5">
              <InputField label="Job Title" icon={Briefcase} required error={errors.title?.message}>
                <input
                  {...register("title")}
                  placeholder="e.g. Senior Frontend Developer"
                  onBlur={() => trigger("title")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                    errors.title ? "border-red-300 bg-red-50/50" : "border-gray-200"
                  }`}
                />
              </InputField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Job Type"
                  icon={Building2}
                  required
                  error={errors.jobType?.message}
                >
                  <Controller
                    control={control}
                    name="jobType"
                    render={({ field }) => (
                      <CreatableSelect
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val);
                          if (attemptedNext[0]) trigger("jobType");
                        }}
                        options={JOB_TYPES}
                        placeholder="Select or type..."
                        error={!!errors.jobType}
                      />
                    )}
                  />
                </InputField>

                <InputField
                  label="Experience Level"
                  icon={GraduationCap}
                  required
                  error={errors.experienceLevel?.message}
                >
                  <Controller
                    control={control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <CreatableSelect
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val);
                          if (attemptedNext[0]) trigger("experienceLevel");
                        }}
                        options={EXPERIENCE_LEVELS}
                        placeholder="Select or type..."
                        error={!!errors.experienceLevel}
                      />
                    )}
                  />
                </InputField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Vacancies" icon={Users}>
                  <input
                    type="number"
                    {...register("numberOfPositions", { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </InputField>
                <InputField
                  label="Deadline"
                  icon={Calendar}
                  required
                  error={errors.applicationDeadline?.message}
                >
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    {...register("applicationDeadline")}
                    onBlur={() => trigger("applicationDeadline")}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                      errors.applicationDeadline ? "border-red-300 bg-red-50/50" : "border-gray-200"
                    }`}
                  />
                </InputField>
                <div className="flex items-start mt-7">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-colors w-full">
                    <input
                      type="checkbox"
                      {...register("isRemote")}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Remote</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-3">
                  <InputField label="Currency" icon={DollarSign}>
                    <select
                      {...register("salaryCurrency")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="VND">VND (₫)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </InputField>
                </div>
                <div className="col-span-6 md:col-span-4">
                  <InputField label="Minimum Salary" error={errors.salaryMin?.message} required>
                    <input
                      type="number"
                      {...register("salaryMin", {
                        valueAsNumber: true,
                        onChange: () => {
                          if (attemptedNext[1]) {
                            trigger(["salaryMin", "salaryMax"]);
                          }
                        },
                      })}
                      placeholder="e.g. 1000"
                      onBlur={() => {
                        trigger("salaryMin");
                        trigger("salaryMax");
                      }}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                        errors.salaryMin ? "border-red-300 bg-red-50/50" : "border-gray-200"
                      }`}
                    />
                  </InputField>
                </div>
                <div className="col-span-6 md:col-span-5">
                  <InputField label="Maximum Salary" error={errors.salaryMax?.message} required>
                    <input
                      type="number"
                      {...register("salaryMax", {
                        valueAsNumber: true,
                        onChange: () => {
                          if (attemptedNext[1]) {
                            trigger(["salaryMin", "salaryMax"]);
                          }
                        },
                      })}
                      placeholder="e.g. 3000"
                      onBlur={() => {
                        trigger("salaryMax");
                        trigger("salaryMin");
                      }}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                        errors.salaryMax ? "border-red-300 bg-red-50/50" : "border-gray-200"
                      }`}
                    />
                  </InputField>
                </div>
              </div>
              <div className="h-px bg-gray-200" />
              <DynamicListSection
                control={control}
                name="benefits"
                title="Benefits & Perks"
                icon={Sparkles}
                placeholder="e.g. Health insurance, 13th month salary..."
              />
              <DynamicListSection
                control={control}
                name="workingSchedule"
                title="Working Schedule"
                icon={Clock}
                placeholder="e.g. Mon-Fri 9AM - 6PM"
              />
            </div>
          )}

          {activeSection === 2 && (
            <div className="space-y-6">
              <DynamicListSection
                control={control}
                name="overview"
                title="Job Overview"
                icon={Globe}
                placeholder="Describe the role mission..."
                required
                error={attemptedNext[2] ? errors.overview?.message : undefined}
              />
              <DynamicListSection
                control={control}
                name="responsibilities"
                title="Key Responsibilities"
                icon={Briefcase}
                placeholder="What will they do daily?"
                required
                error={attemptedNext[2] ? errors.responsibilities?.message : undefined}
              />
              <DynamicListSection
                control={control}
                name="requirements"
                title="Requirements"
                icon={CheckCircle2}
                placeholder="Required skills and experience..."
                required
                error={attemptedNext[2] ? errors.requirements?.message : undefined}
              />
              <DynamicListSection
                control={control}
                name="niceToHave"
                title="Nice to Have"
                icon={Sparkles}
                placeholder="Bonus skills..."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end w-full gap-3 p-4 mt-4 border-t border-gray-100 bg-gray-50/50">
          {activeSection > 0 && (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {activeSection < 2 ? (
            <Button
              key="next-btn"
              type="button"
              variant="primary"
              onClick={handleNextStep}
              disabled={
                (attemptedNext[0] && !isSection0Valid() && activeSection === 0) ||
                (attemptedNext[1] && !isSection1Valid() && activeSection === 1)
              }
            >
              Next Step
            </Button>
          ) : (
            <Button
              key="submit-btn"
              type="submit"
              variant="primary"
              disabled={isSubmitting || (!isSection2Valid() && attemptedNext[2])}
              // eslint-disable-next-line no-negated-condition
              startIcon={!isSubmitting ? <Save className="w-4 h-4" /> : undefined}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : mode === "create" ? (
                "Publish Job"
              ) : (
                "Update Job"
              )}
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Update"
        description="Are you sure you want to update this job listing? Changes will be saved immediately."
        confirmText="Update Job"
        cancelText="Cancel"
        confirmVariant="primary"
        onConfirm={handleConfirmUpdate}
        onCancel={() => setConfirmOpen(false)}
        loading={isSubmitting}
      />
    </>
  );
};

export default JobForm;
