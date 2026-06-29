import React from "react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLowercase } from "@/components/ui/button-lowercase";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons/icons";
import type { Job } from "@/features/job-seeker/components/jobs/types/job.types.tsx";
import { UI_DIMENSIONS } from "@/features/job-seeker/constants/jobseeker.constants";

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  isSaved?: boolean;
  onSaveToggle?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  onQuickView?: () => void;
  useUniformHeight?: boolean;
}

export default function JobCard({
  job,
  isSelected,
  isSaved,
  onSaveToggle,
  onClick,
  useUniformHeight = false,
}: JobCardProps) {
  const daysAgo = Math.floor(
    (Date.now() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24),
  );

  // Safely extract company name - handle both string and object types
  const companyName = typeof job.company === 'string'
    ? job.company
    : (job.company as any)?.name || 'Unknown Company';

  // Safely extract location - handle both string and object types
  const locationString = typeof job.location === 'string'
    ? job.location
    : (job.location as any)?.address
      ? `${(job.location as any).address}, ${(job.location as any).district}, ${(job.location as any).city}`
      : 'Unknown Location';

  const formatSalary = (salary: number) => {
    return (salary / 1000).toFixed(0) + "USD";
  };

  const salaryString =
    typeof job.salary === "object"
      ? `${formatSalary(job.salary.min)} - ${formatSalary(job.salary.max)}$`
      : job.salary;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSaveToggle?.(e);
  };

  const MiddleContent = () => (
    <>
      <div className="space-y-2 mb-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Icons.building2 className="size-5 shrink-0" />
            <span className="truncate">{companyName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Icons.mapPin className="size-4 shrink-0" />
            <span className="truncate">{locationString}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Icons.briefcase className="size-4 shrink-0" />
            <span className="truncate">{job.experience}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Icons.circleDollarSign className="size-4 shrink-0" />
            <span className="truncate">{salaryString}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[44px] max-h-[60px] overflow-hidden">
        {job.experience && (
          <Badge variant="orange" className="truncate max-w-[120px] text-xs px-2 py-0.5">
            {job.experience}
          </Badge>
        )}
        {job.location && (
          <Badge variant="orange" className="truncate max-w-[120px] text-xs px-2 py-0.5">
            {job.location}
          </Badge>
        )}
        {job.benefits && job.benefits.length > 0 && job.benefits.slice(0, 1).map((tag, index) => (
          <Badge
            key={index}
            variant="orange"
            className="truncate max-w-[120px] text-xs px-2 py-0.5"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </>
  );

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-visible hover:shadow-lg transition-all duration-300 group w-full text-left cursor-pointer",
        useUniformHeight ? `h-full` : "",
        isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/50",
      )}
      style={{
        minHeight: useUniformHeight
          ? UI_DIMENSIONS.JOB_CARD_MIN_HEIGHT_UNIFORM
          : UI_DIMENSIONS.JOB_CARD_MIN_HEIGHT_NORMAL,
      }}
    >
      <CardContent
        className={cn("p-4 bg-white rounded-lg", useUniformHeight && "flex flex-col h-full")}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <Link to={`/job/${job.id}`} className="flex items-center gap-2.5 flex-1 min-w-0">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={companyName}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-primary/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-sm font-bold text-primary">{companyName.charAt(0)}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm hover:text-primary transition line-clamp-2">
                {job.title}
              </h3>
              <p className="text-xs font-medium text-gray-500 truncate">{companyName}</p>
            </div>
          </Link>
          <ButtonLowercase
            variant={isSaved ? "orange" : "outline"}
            size="sm"
            onClick={handleSaveClick}
            className="shrink-0 ml-2 relative z-10 h-8 w-8 p-0"
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            <Bookmark
              size={16}
              fill={isSaved ? "white" : "none"}
              className={isSaved ? "text-white" : "text-muted-foreground"}
            />
          </ButtonLowercase>
        </div>

        {/* Middle section - conditionally uses flex-grow */}
        {useUniformHeight ? (
          <div className="flex-grow">
            <MiddleContent />
          </div>
        ) : (
          <MiddleContent />
        )}

        {/* Card Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {daysAgo === 0 ? "Today" : `${daysAgo} days ago`}
          </span>
          <Link to={`/job/${job.id}`}>
            <ButtonLowercase variant="orange" size="sm" className="text-xs h-8 px-3">
              Job Details &gt;
            </ButtonLowercase>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
