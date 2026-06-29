import { Briefcase, Calendar, DollarSign, Eye } from "lucide-react";
import type { Application } from "@/redux/features/applications/applicationApi";
import { formatDate, formatSalary, getRelativeTime, STATUS_CONFIG } from "./application.constants";
import { ButtonLowercase as Button } from "@/components/ui/button-lowercase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ApplicationCardProps {
  application: Application;
  onViewDetail: (id: string) => void;
}

export function ApplicationCard({ application, onViewDetail }: ApplicationCardProps) {
  const statusConfig = STATUS_CONFIG[application.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          {/* Left section - Job info */}
          <div className="flex-1 space-y-3">
            {/* Job title and status */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {application.jobId.title}
              </h3>
              <Badge className={`${statusConfig.color} shrink-0`}>
                {statusConfig.icon} {statusConfig.label}
              </Badge>
            </div>

            {/* Job details */}
            <div className="space-y-2 text-sm text-gray-600">
              {/* Salary range */}
              {application.jobId.salaryMin && application.jobId.salaryMax && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 shrink-0" />
                  <span>
                    {formatSalary(application.jobId.salaryMin)} -{" "}
                    {formatSalary(application.jobId.salaryMax)} VND
                  </span>
                </div>
              )}

              {/* Experience level */}
              {application.jobId.experienceLevel && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>{application.jobId.experienceLevel}</span>
                </div>
              )}

              {/* Applied date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>
                  Applied: {formatDate(application.appliedAt)} (
                  {getRelativeTime(application.appliedAt)})
                </span>
              </div>

              {/* Expected salary if provided */}
              {application.expectedSalary && (
                <div className="flex items-center gap-2 text-blue-600">
                  <DollarSign className="w-4 h-4 shrink-0" />
                  <span className="font-medium">
                    Expected salary: {formatSalary(application.expectedSalary)} VND
                  </span>
                </div>
              )}

              {/* Reviewed date if reviewed */}
              {application.reviewedAt && (
                <div className="flex items-center gap-2 text-purple-600">
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>Reviewed: {formatDate(application.reviewedAt)}</span>
                </div>
              )}
            </div>

            {/* Recruiter note if any */}
            {application.recruiterNote && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Recruiter feedback:</span>
                  <br />
                  {application.recruiterNote}
                </p>
              </div>
            )}
          </div>

          {/* Right section - Action button */}
          <div className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetail(application._id)}
              className="whitespace-nowrap"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
