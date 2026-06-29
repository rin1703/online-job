import {
  Calendar,
  MapPin,
  Briefcase,
  Users,
  DollarSign,
  Building2,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { JobDetail } from "@/features/jobs/api/job.type";

interface JobDetailsProps {
  job: JobDetail | any; // Allow any for fallback flexibility
}

const formatCurrency = (amount: number | string | undefined) => {
  if (amount === undefined || amount === null || amount === "") return "N/A";
  const num = Number(amount);
  if (isNaN(num)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatLocation = (location: any) => {
  if (!location) return "N/A";
  if (typeof location === "string") return location;
  const parts = [location.address, location.district, location.city].filter(
    (part: string | undefined) => part && part.trim() !== "",
  );
  return parts.length > 0 ? parts.join(", ") : "N/A";
};

export default function JobDetails({ job }: JobDetailsProps) {
  if (!job) return null;

  // 1. Company Info Fallbacks
  const companyName = job.company?.name || (typeof job.company === "string" ? job.company : "N/A");
  const companyLogo = job.company?.logo || job.companyLogo;

  // 2. Salary Fallbacks (salaryMin vs salary.min)
  const salaryMin = job.salaryMin ?? job.salary?.min;
  const salaryMax = job.salaryMax ?? job.salary?.max;

  // 3. Experience Fallbacks (experienceLevel vs experience vs level)
  const experience = job.experienceLevel || job.experience || job.level || "N/A";

  // 4. Job Type Fallbacks (jobType vs workType)
  const jobType = job.jobType || job.workType || "N/A";

  // 5. Vacancies Fallbacks
  const positions = job.numberOfPositions ?? job.vacancies;
  const vacancies =
    positions !== undefined && positions !== null ? `${positions} Position(s)` : "N/A";

  return (
    <div className="space-y-6 p-6 bg-white shadow-sm rounded-2xl border border-gray-100">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{job.title || "N/A"}</h2>
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Building2 className="w-4 h-4 opacity-70" />
            <span className="font-medium">{companyName}</span>
          </div>
        </div>
        {companyLogo && (
          <img
            src={companyLogo}
            alt={companyName}
            className="w-16 h-16 object-contain rounded-xl bg-gray-50 p-2 border border-gray-200"
          />
        )}
      </div>

      <Separator />

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            icon: DollarSign,
            title: "Salary Range",
            value: `${formatCurrency(salaryMin)} - ${formatCurrency(salaryMax)}`,
            color: "blue",
          },
          {
            icon: Briefcase,
            title: "Experience",
            value: experience,
            color: "green",
          },
          {
            icon: Users,
            title: "Vacancies",
            value: vacancies,
            color: "purple",
          },
          {
            icon: Clock,
            title: "Job Type",
            value: jobType,
            color: "orange",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-${item.color}-50`}
          >
            <item.icon className={`w-5 h-5 text-${item.color}-600 mt-0.5`} />
            <div>
              <p className="text-xs text-gray-600 mb-1 font-medium">{item.title}</p>
              <p className="font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}

        <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-amber-50 col-span-1 sm:col-span-2">
          <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-xs text-gray-600 mb-1 font-medium">Location</p>
            <p className="font-semibold text-gray-900">{formatLocation(job.location)}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Details Section */}
      <div className="space-y-8">
        {/* Overview */}
        {job.overview?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Overview</h3>
            <div className="text-gray-700 leading-relaxed text-sm space-y-2">
              {job.overview.map((item: string, idx: number) => (
                <p key={idx}>{item}</p>
              ))}
            </div>
          </div>
        )}

        {/* Responsibilities */}
        {job.responsibilities?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Responsibilities</h3>
            <ul className="space-y-2 text-sm">
              {job.responsibilities.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {/* Fallback check for both requirementSkill and tags */}
        {(job.requirementSkill?.length > 0 || job.tags?.length > 0) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements & Skills</h3>
            <ul className="space-y-2 text-sm">
              {(job.requirementSkill || job.tags).map((tag: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nice to Have */}
        {job.niceToHave?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Nice to Have</h3>
            <ul className="space-y-2 text-sm">
              {job.niceToHave.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Working Schedule */}
        {job.workingSchedule?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Working Schedule</h3>
            <ul className="space-y-2 text-sm">
              {job.workingSchedule.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {job.benefits?.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-green-600">✨</span>
              Benefits & Perks
            </h3>
            <ul className="space-y-2 text-sm">
              {job.benefits.map((benefit: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-100 mt-4">
          <div>
            <span className="text-gray-600">Application Deadline:</span>
            <span className="ml-2 font-medium text-gray-900 block sm:inline">
              {formatDate(job.applicationDeadline)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            {/* Check property status OR isListed as fallback */}
            <Badge
              variant={job.status === "active" || job.isListed ? "green" : "gray"}
              className="ml-2 mt-1 sm:mt-0"
            >
              {job.status === "active" || job.isListed ? "Active" : "Unlisted"}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          {/* Handle potentially missing postedDate/createdAt */}
          <span>Posted: {formatDate(job.postedDate || job.createdAt)}</span>
        </div>
        {/* Handle potentially missing updatedDate/updatedAt */}
        <div>Last updated: {formatDate(job.updatedDate || job.updatedAt)}</div>
      </div>
    </div>
  );
}
