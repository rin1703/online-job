import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons/icons";
import type { Application } from "@/redux/features/applications/applicationApi";
import { ApplicationStatus } from "@/features/recruiter/application.type";
import { InfoButtons } from "@/features/recruiter/components/applications/ActionButtons";
import { ScheduleInterviewModal } from "@/features/recruiter/components/applications/ScheduleInterviewModal";
import { RecruiterNoteModal } from "@/features/recruiter/components/applications/RecruiterNoteModal";
import ReportUserModal from "@/features/recruiter/components/reports/ReportUserModal";
import { STATUS_CONFIG } from "@/features/recruiter/application.constants";
import { ButtonLowercase } from "@/components/ui/button-lowercase.tsx";

interface ApplicationCardProps {
  application: Application;
  onViewDetail: (id: string) => void;
  onUpdateStatus: (applicationId: string, newStatus: ApplicationStatus, note?: string) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onViewDetail,
  onUpdateStatus,
}) => {
  const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false);
  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  const [reportModalOpen, setReportModalOpen] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<ApplicationStatus | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false); // ✅ Track processing state

  // ✅ Destructure với fallback
  const {
    jobSeekerId,
    jobId,
    status = ApplicationStatus.PENDING, // ✅ Fallback
    appliedAt,
    _id,
  } = application;

  console.log(`🔍 ApplicationCard - ID: ${_id}, Status:`, status);

  // ✅ Validate data
  if (!jobSeekerId || !jobId) {
    console.error("❌ Invalid application:", application);
    return (
      <Card className="p-2 bg-red-50 border-red-200">
        <CardContent className="p-2">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <Icons.alertCircle className="w-4 h-4" />
            <span>Data is invalid</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ Get status config với fallback
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const handleStatusChange = async (newStatus: ApplicationStatus, note?: string) => {
    setIsProcessing(true); // ✅ Start processing
    try {
      await onUpdateStatus(_id, newStatus, note);
    } finally {
      setIsProcessing(false); // ✅ End processing
    }
  };

  const handleStatusChangeClick = (e: React.MouseEvent, newStatus: ApplicationStatus) => {
    e.stopPropagation();
    setPendingStatus(newStatus);
    setNoteModalOpen(true);
  };

  const handleConfirmStatusChange = async (note: string) => {
    if (pendingStatus) {
      await handleStatusChange(pendingStatus, note);
      setPendingStatus(null);
    }
  };

  const buttonClass = "w-24 text-xs h-7 px-2";

  return (
    <Card className="hover:shadow-md transition-shadow p-4">
      <CardContent className="p-2">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-base shrink-0">
            {jobSeekerId.firstName?.[0] || "?"}
            {jobSeekerId.lastName?.[0] || "?"}
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            {/* Name + Status */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-semibold text-lg leading-tight truncate">
                {jobSeekerId.firstName} {jobSeekerId.lastName}
              </h3>

              <Badge className={`${statusConfig.color} text-xs shrink-0 lg:hidden`}>
                {statusConfig.label}
              </Badge>
            </div>

            {/* Job Title */}
            <p className="text-base text-gray-600 truncate mb-2">
              {jobId.title || "Position not specified"}
            </p>

            {/* Contact */}
            <div className="flex gap-4 text-sm text-gray-500 mb-2">
              <span className="flex items-center gap-1.5 truncate">
                <Icons.mail className="w-3.5 h-3.5 shrink-0" />
                {jobSeekerId.email}
              </span>
              <span className="flex items-center gap-1.5 shrink-0">
                <Icons.phone className="w-3.5 h-3.5" />
                {jobSeekerId.phone}
              </span>
            </div>

            {/* Applied Date */}
            <p className="text-sm text-gray-400 mb-2">
              Applied: {new Date(appliedAt).toLocaleDateString("en-US")}
            </p>

            {/* ✅ Info Buttons (Detail, View CV, Download) - Below email */}
            <InfoButtons
              cvUrl={application.resume || ""}
              applicationId={application._id}
              showViewDetail
              onViewDetail={() => onViewDetail(_id)}
            />
          </div>

          {/* ✅ Action Buttons (Approve, Reject, Schedule, Report) - Right side */}
          <div className="flex flex-col gap-1.5 shrink-0 items-end">
            {/* Status Badge - Desktop only */}
            <Badge className={`${statusConfig.color} text-xs shrink-0 hidden lg:flex mb-1 justify-center whitespace-nowrap px-2`}>
              {statusConfig.label}
            </Badge>

            {/* Approve - Disable if already approved, rejected, or withdrawn */}
            <ButtonLowercase
              size="sm"
              onClick={(e) => handleStatusChangeClick(e, ApplicationStatus.APPROVED)}
              disabled={
                isProcessing ||
                status === ApplicationStatus.APPROVED ||
                status === ApplicationStatus.REJECTED ||
                status === ApplicationStatus.WITHDRAWN
              }
              className={`${buttonClass} bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed cursor-pointer`}
            >
              {isProcessing && pendingStatus === ApplicationStatus.APPROVED && (
                <Icons.loader className="w-3 h-3 mr-1 animate-spin" />
              )}
              Approve
            </ButtonLowercase>

            {/* Reject - Disable if already rejected, approved, or withdrawn */}
            <ButtonLowercase
              size="sm"
              variant="destructive"
              onClick={(e) => handleStatusChangeClick(e, ApplicationStatus.REJECTED)}
              disabled={
                isProcessing ||
                status === ApplicationStatus.REJECTED ||
                status === ApplicationStatus.APPROVED ||
                status === ApplicationStatus.WITHDRAWN
              }
              className={`${buttonClass} disabled:bg-red-300 disabled:cursor-not-allowed cursor-pointer`}
            >
              {isProcessing && pendingStatus === ApplicationStatus.REJECTED && (
                <Icons.loader className="w-3 h-3 mr-1 animate-spin" />
              )}
              Reject
            </ButtonLowercase>

            {/* Schedule - Disable if already scheduled, approved, rejected, or withdrawn */}
            <ButtonLowercase
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setScheduleModalOpen(true);
              }}
              disabled={
                isProcessing ||
                status === ApplicationStatus.INTERVIEW_SCHEDULED ||
                status === ApplicationStatus.APPROVED ||
                status === ApplicationStatus.REJECTED ||
                status === ApplicationStatus.WITHDRAWN
              }
              className={`${buttonClass} bg-orange-400 hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed cursor-pointer`}
            >
              Schedule
            </ButtonLowercase>

            {/* Report */}
            <ButtonLowercase
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setReportModalOpen(true);
              }}
              className={`${buttonClass} bg-blue-600 hover:bg-blue-700 cursor-pointer`}
              title="Report this candidate"
            >
              Report
            </ButtonLowercase>
          </div>
        </div>
      </CardContent>

      {/* Schedule Interview Modal */}
      {scheduleModalOpen && jobSeekerId && jobId && (
        <ScheduleInterviewModal
          open={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          applicationId={_id}
          jobId={jobId._id}
          jobSeekerId={jobSeekerId._id}
          candidateName={`${jobSeekerId.firstName} ${jobSeekerId.lastName}`}
          jobTitle={jobId.title}
        />
      )}

      {/* Recruiter Note Modal */}
      {pendingStatus && (
        <RecruiterNoteModal
          open={noteModalOpen}
          onOpenChange={setNoteModalOpen}
          status={pendingStatus}
          currentNote={application.recruiterNote}
          onConfirm={handleConfirmStatusChange}
        />
      )}

      {/* Report User Modal */}
      {reportModalOpen && jobSeekerId && (
        <ReportUserModal
          userId={jobSeekerId._id}
          userName={`${jobSeekerId.firstName} ${jobSeekerId.lastName}`}
          userEmail={jobSeekerId.email}
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </Card>
  );
};
