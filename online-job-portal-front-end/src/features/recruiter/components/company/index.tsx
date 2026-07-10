// import { useState, useMemo, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";
// import {
//   Building2,
//   Loader2,
//   Pencil,
//   Save,
//   CheckCircle2,
//   Globe,
//   Mail,
//   Phone,
//   FileText,
//   Users,
//   Calendar,
//   AlertCircle,
//   Hash,
//   ShieldCheck,
//   X,
// } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/Btn";
// import ConfirmDialog from "@/components/ui/ConfirmDialog";
// import {
//   useGetRecruiterCompanyQuery,
//   useUpdateCompanyMutation,
// } from "@/features/companies/api/companies.service";
// import {
//   companyFormSchema,
//   defaultCompanyFormValues,
//   COMPANY_SIZES,
//   type CompanyFormValues,
// } from "@/features/companies/company.schema";
// import CompanyStatusBadge from "@/features/companies/components/CompanyStatusBadge";

// interface ExtendedCompanyFormValues extends CompanyFormValues {
//   taxCode?: string;
//   verificationStatus?: string;
// }

// interface InputFieldProps {
//   label: string;
//   icon?: React.ElementType;
//   children: React.ReactNode;
//   required?: boolean;
//   error?: string;
//   className?: string;
// }

// const InputField: React.FC<InputFieldProps> = ({
//   label,
//   icon: Icon,
//   children,
//   required,
//   error,
//   className,
// }) => (
//   <div className={cn("space-y-2", className)}>
//     <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
//       {Icon && <Icon className="w-4 h-4 text-gray-400" />}
//       {label}
//       {required && <span className="text-primary">*</span>}
//     </label>
//     {children}
//     {error && (
//       <p className="flex items-center gap-1 text-xs text-red-500">
//         <AlertCircle className="w-3 h-3" />
//         {error}
//       </p>
//     )}
//   </div>
// );
// interface CompanyFormProps {
//   onSubmit: (data: CompanyFormValues) => void;
//   onCancel?: () => void;
//   isSubmitting?: boolean;
//   initialData?: Partial<ExtendedCompanyFormValues>;
//   readOnly?: boolean;
// }

// export const CompanyForm = ({
//   onSubmit,
//   onCancel,
//   initialData,
//   isSubmitting = false,
//   readOnly = false,
// }: CompanyFormProps) => {
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors, isDirty },
//   } = useForm<ExtendedCompanyFormValues>({
//     resolver: zodResolver(companyFormSchema) as any,
//     defaultValues: defaultCompanyFormValues,
//   });

//   useEffect(() => {
//     if (initialData) {
//       const resetData: ExtendedCompanyFormValues = {
//         ...defaultCompanyFormValues,
//         ...initialData,
//         employeeCount: initialData.employeeCount ? String(initialData.employeeCount) : "",
//         taxCode: initialData.taxCode || "",
//       };
//       reset(resetData);
//     }
//   }, [initialData, reset]);

//   const handleCancel = () => {
//     if (initialData) {
//       reset({
//         ...defaultCompanyFormValues,
//         ...initialData,
//         employeeCount: initialData.employeeCount ? String(initialData.employeeCount) : "",
//         taxCode: initialData.taxCode || "",
//       });
//     }
//     onCancel?.();
//   };

//   return (
//     <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//       <InputField
//         label="Company Name"
//         icon={Building2}
//         required={!readOnly}
//         error={errors.name?.message}
//       >
//         <input
//           {...register("name")}
//           disabled={readOnly}
//           placeholder="e.g. Tech Corp Vietnam"
//           className={cn(
//             "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 disabled:text-gray-500",
//             errors.name ? "border-red-300 bg-red-50/50" : "border-gray-200",
//           )}
//         />
//       </InputField>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <InputField label="Tax Code" icon={Hash} error={(errors as any).taxCode?.message}>
//           <input
//             {...register("taxCode")}
//             disabled={readOnly}
//             placeholder="e.g. 0101234567"
//             className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
//           />
//         </InputField>

//         <InputField label="Verification Status" icon={ShieldCheck}>
//           <div className="py-1">
//             <CompanyStatusBadge status={initialData?.verificationStatus || "Unverified"} />
//           </div>
//         </InputField>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <InputField label="Website" icon={Globe} error={errors.website?.message}>
//           <input
//             {...register("website")}
//             disabled={readOnly}
//             placeholder="https://company.com"
//             className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
//           />
//         </InputField>

//         <InputField label="Email" icon={Mail} error={errors.email?.message}>
//           <input
//             {...register("email")}
//             disabled={readOnly}
//             placeholder="contact@company.com"
//             className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
//           />
//         </InputField>

//         <InputField label="Phone" icon={Phone} error={errors.phone?.message}>
//           <input
//             {...register("phone")}
//             disabled={readOnly}
//             placeholder="+84 90..."
//             className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
//           />
//         </InputField>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <InputField label="Employee Count" icon={Users} error={errors.employeeCount?.message}>
//           <select
//             {...register("employeeCount")}
//             disabled={readOnly}
//             className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white disabled:bg-gray-50 disabled:text-gray-500"
//           >
//             <option value="">All Sizes</option>
//             {COMPANY_SIZES.map((size) => (
//               <option key={size} value={size}>
//                 {size}
//               </option>
//             ))}
//           </select>
//         </InputField>

//         <InputField label="Founded Year" icon={Calendar} error={errors.foundedYear?.message}>
//           <input
//             type="number"
//             {...register("foundedYear")}
//             disabled={readOnly}
//             placeholder="e.g. 2010"
//             className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
//           />
//         </InputField>
//       </div>

//       <InputField label="Description" icon={FileText} error={errors.description?.message}>
//         <textarea
//           {...register("description")}
//           disabled={readOnly}
//           rows={5}
//           placeholder="About the company..."
//           className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none disabled:bg-gray-50 disabled:text-gray-500"
//         />
//       </InputField>

//       {!readOnly && (
//         <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={handleCancel}
//             disabled={isSubmitting}
//             startIcon={<X className="w-4 h-4" />}
//           >
//             Cancel
//           </Button>

//           <Button
//             type="submit"
//             disabled={isSubmitting || !isDirty}
//             variant="default"
//             className="min-w-[140px]"
//             startIcon={
//               isSubmitting ? (
//                 <Loader2 className="w-4 h-4 animate-spin" />
//               ) : (
//                 <Save className="w-4 h-4" />
//               )
//             }
//           >
//             {isSubmitting ? "Saving..." : "Save Changes"}
//           </Button>
//         </div>
//       )}
//     </form>
//   );
// };

// export default function RecruiterCompany() {
//   const { data: responseData, isLoading, refetch } = useGetRecruiterCompanyQuery({});
//   const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();

//   const [isEditing, setIsEditing] = useState(false);
//   const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
//   const [pendingData, setPendingData] = useState<CompanyFormValues | null>(null);

//   const myCompany = useMemo(() => {
//     if (!responseData?.data) return null;
//     return Array.isArray(responseData.data) ? responseData.data[0] : responseData.data;
//   }, [responseData]);

//   const handleFormSubmit = (data: CompanyFormValues) => {
//     setPendingData(data);
//     setConfirmDialogOpen(true);
//   };

//   const handleConfirmUpdate = async () => {
//     if (!pendingData) return;
//     try {
//       if (myCompany?._id) {
//         await updateCompany({ _id: myCompany._id, ...pendingData }).unwrap();
//         toast.success("Company profile updated successfully!");
//         setIsEditing(false);
//         refetch();
//       }
//     } catch (error) {
//       console.error("Failed to save company profile:", error);
//       toast.error("Failed to update profile. Please try again.");
//     } finally {
//       setConfirmDialogOpen(false);
//       setPendingData(null);
//     }
//   };

//   const handleCancelEdit = () => {
//     setIsEditing(false);
//     setPendingData(null);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
//         <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
//         <p>Loading company information...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto py-8 px-6">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <Building2 className="w-8 h-8 text-primary" />
//             Company Profile
//           </h1>
//           <p className="text-gray-500 mt-2">Manage your company details and public profile.</p>
//         </div>

//         {!isEditing && (
//           <Button
//             onClick={() => setIsEditing(true)}
//             startIcon={<Pencil className="w-4 h-4" />}
//             className="shadow-sm"
//             variant="default"
//           >
//             Edit Profile
//           </Button>
//         )}
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
//         {isUpdating && (
//           <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
//             <Loader2 className="w-8 h-8 text-primary animate-spin" />
//           </div>
//         )}

//         {isEditing && <div className="absolute top-0 inset-x-0 h-1 bg-primary animate-pulse" />}

//         {myCompany && !isEditing && (
//           <div className="bg-gray-50/80 px-6 py-3 border-b border-gray-100 flex justify-between items-center text-sm">
//             <div className="flex items-center gap-2 text-gray-500">
//               Status:
//               <CompanyStatusBadge status={myCompany.verificationStatus || "Pending"} />
//             </div>
//             <div className="flex items-center gap-1.5 text-green-600">
//               <CheckCircle2 className="w-4 h-4" />
//               <span className="font-medium">Information up to date</span>
//             </div>
//           </div>
//         )}

//         <div className="p-8">
//           <CompanyForm
//             onSubmit={handleFormSubmit}
//             onCancel={handleCancelEdit}
//             initialData={myCompany || undefined}
//             isSubmitting={isUpdating}
//             readOnly={!isEditing}
//           />
//         </div>
//       </div>

//       <ConfirmDialog
//         open={confirmDialogOpen}
//         title="Save Changes?"
//         description="Are you sure you want to update your company profile information? These changes will be visible to candidates immediately."
//         confirmText="Yes, Update"
//         cancelText="No, Keep Editing"
//         confirmVariant="primary"
//         onConfirm={handleConfirmUpdate}
//         onCancel={() => setConfirmDialogOpen(false)}
//         loading={isUpdating}
//       />
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Building2,
  Loader2,
  Pencil,
  Save,
  Globe,
  Mail,
  Phone,
  FileText,
  Users,
  Calendar,
  AlertCircle,
  Hash,
  ShieldCheck,
  X,
  MapPin,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  useGetRecruiterCompanyQuery,
  useUpdateCompanyMutation,
  useGetIndustriesQuery,
} from "@/features/companies/api/companies.service";
import {
  companyFormSchema,
  defaultCompanyFormValues,
  COMPANY_SIZES,
  type CompanyFormValues, // Bây giờ type này đã bao gồm đủ các trường
} from "@/features/companies/company.schema";
import CompanyStatusBadge from "@/features/companies/components/CompanyStatusBadge";
import { getInitials } from "@/features/companies/lib/ultils";

// Không cần interface ExtendedCompanyData nữa vì CompanyFormValues đã đủ

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
  onCancel?: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<CompanyFormValues>; // Dùng trực tiếp CompanyFormValues
  readOnly?: boolean;
  industries?: Array<{ _id: string; name: string; description?: string }>;
}

export const CompanyForm = ({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
  readOnly = false,
  industries = [],
}: CompanyFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
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
        taxCode: initialData.taxCode || "",
        industryId: initialData.industry?._id || initialData.industryId || "",
      };
      reset(resetData);
    }
  }, [initialData, reset]);

  return (
    <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          className={cn(
            "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 disabled:text-gray-500",
            errors.name ? "border-red-300 bg-red-50/50" : "border-gray-200",
          )}
        />
      </InputField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Tax Code" icon={Hash} error={errors.taxCode?.message}>
          <input
            {...register("taxCode")}
            disabled={readOnly}
            placeholder="e.g. 0101234567"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
          />
        </InputField>

        <InputField label="Verification Status" icon={ShieldCheck}>
          <div className="py-1">
            <CompanyStatusBadge status={initialData?.verificationStatus || "pending"} />
          </div>
        </InputField>
      </div>

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
            disabled={true}
            placeholder="contact@company.com"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white disabled:bg-white disabled:text-gray-500 cursor-not-allowed"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField label="Industry" icon={Building2} error={errors.industryId?.message}>
          <select
            {...register("industryId")}
            disabled={readOnly}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">Select Industry</option>
            {industries.map((ind) => (
              <option key={ind._id} value={ind._id}>
                {ind.name}
              </option>
            ))}
          </select>
        </InputField>

        <InputField label="Employee Count" icon={Users} error={errors.employeeCount?.message}>
          <select
            {...register("employeeCount")}
            disabled={readOnly}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">All Sizes</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
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

      {!readOnly && (
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            variant="default"
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </form>
  );
};

export default function RecruiterCompany() {
  const { data: responseData, isLoading, refetch } = useGetRecruiterCompanyQuery();
  const { data: industriesData } = useGetIndustriesQuery();
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingData, setPendingData] = useState<CompanyFormValues | null>(null);

  // Không cần 'as ExtendedCompanyData' nữa
  const myCompany = responseData?.data as CompanyFormValues | undefined;

  const logoSrc = myCompany?.logo
    ? myCompany.logo
    : `https://ui-avatars.com/api/?name=${getInitials(myCompany?.name || "")}&background=random&color=fff&size=128`;

  const handleFormSubmit = (data: CompanyFormValues) => {
    setPendingData(data);
    setConfirmDialogOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingData) return;
    try {
      if (myCompany?._id) {
        await updateCompany({ _id: myCompany._id, ...pendingData }).unwrap();
        toast.success("Company profile updated successfully!");
        setIsEditing(false);
        refetch();
      }
    } catch (error) {
      console.error("Failed to save company profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setConfirmDialogOpen(false);
      setPendingData(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPendingData(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p>Loading company information...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-6">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-white shrink-0">
            <img src={logoSrc} alt="Company Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              {myCompany?.name || "Company Profile"}
            </h1>

            <div className="flex items-center gap-3 mt-2 text-gray-500 text-sm">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {myCompany?.industry?.name || "No Industry Selected"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Vietnam
              </span>
            </div>
          </div>
        </div>

        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="shadow-sm" variant="default">
            <Pencil className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        {isUpdating && (
          <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {isEditing && <div className="absolute top-0 inset-x-0 h-1 bg-primary animate-pulse" />}

        {myCompany && !isEditing && (
          <div className="bg-gray-50/80 px-6 py-3 border-b border-gray-100 flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              Status:
              <CompanyStatusBadge status={myCompany.verificationStatus || "pending"} />
            </div>
            {myCompany.updatedAt && (
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                Last updated: {new Date(myCompany.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        <div className="p-8">
          <CompanyForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancelEdit}
            initialData={myCompany || undefined}
            isSubmitting={isUpdating}
            readOnly={!isEditing}
            industries={industriesData?.data || []}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialogOpen}
        title="Save Changes?"
        description="Are you sure you want to update your company profile information? These changes will be visible to candidates immediately."
        confirmText="Yes, Update"
        cancelText="No, Keep Editing"
        confirmVariant="default"
        onConfirm={handleConfirmUpdate}
        onCancel={() => setConfirmDialogOpen(false)}
        loading={isUpdating}
      />
    </div>
  );
}
