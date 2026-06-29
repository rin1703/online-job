import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Briefcase, Calendar, DollarSign, FileText, Loader2, User, } from "lucide-react";
import { toast } from "sonner";

import { ButtonLowercase as Button } from "@/components/ui/button-lowercase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icons } from "@/components/icons/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  useGetApplicationByIdQuery,
  useWithdrawApplicationMutation,
} from "@/redux/features/applications/applicationApi";
import {
  APPLICATION_CONSTANTS,
  formatDate,
  formatSalary,
  STATUS_CONFIG,
} from "@/features/job-seeker/components/applications/application.constants";

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");

  const {
    data: application,
    isLoading,
    isError,
  } = useGetApplicationByIdQuery(id || "", {
    skip: !id,
  });

  const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

  // Restore scroll position when returning
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(APPLICATION_CONSTANTS.SCROLL_POSITION_KEY);
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedScrollPosition, 10),
          behavior: "instant",
        });
        sessionStorage.removeItem(APPLICATION_CONSTANTS.SCROLL_POSITION_KEY);
      }, 0);
    }
  }, []);

  const handleBack = () => {
    navigate("/job-seeker/applications", { state: { fromDetail: true } });
  };

  const handleWithdraw = async () => {
    if (!id) return;

    try {
      await withdrawApplication({
        id,
        data: withdrawReason ? { reason: withdrawReason } : {},
      }).unwrap();

      toast.success("Application withdrawn successfully");
      setShowWithdrawDialog(false);
      setWithdrawReason("");
    } catch (error: any) {
      toast.error(error?.data?.message || "An error occurred while withdrawing the application");
    }
  };

  const canWithdraw =
    application && !["approved", "rejected", "withdrawn"].includes(application.status);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <EmptyState icon={Icons.alertCircle} message="Application not found" />
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[application.status];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto mt-32">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#F97A00] from-40% to-white to-40%"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          return to applications
        </Button>
        {canWithdraw && (
          <Button
            variant="destructive"
            onClick={() => setShowWithdrawDialog(true)}
            disabled={isWithdrawing}
          >
            Withdraw application
          </Button>
        )}
      </div>

      {/* Job Title and Status */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{application.jobId?.title || "N/A"}</CardTitle>
              <p className="text-gray-600 mt-2">Applied: {formatDate(application.appliedAt)}</p>
            </div>
            <Badge className={`${statusConfig.color} text-base px-4 py-2`}>
              {statusConfig.icon} {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Job Information */}
      {application.jobId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Job Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Salary Range</p>
                <p className="font-semibold">
                  {formatSalary(application.jobId.salaryMin)} -{" "}
                  {formatSalary(application.jobId.salaryMax)} USD
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Experience Level</p>
                <p className="font-semibold">{application.jobId.experienceLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Application Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {application.expectedSalary && (
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Expected Salary
                </p>
                <p className="font-semibold">{formatSalary(application.expectedSalary)} VND</p>
              </div>
            )}
            {application.availableDate && (
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Available Start Date
                </p>
                <p className="font-semibold">{formatDate(application.availableDate)}</p>
              </div>
            )}
          </div>

          {application.coverLetter && (
            <div>
              <p className="text-sm text-gray-600 font-medium mb-2">Cover Letter</p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">CV/Resume</p>
            <div className="p-4 bg-gray-50 rounded-lg">
              {/* Priority 1: Check resumeUrl (Cloudinary or external URL) */}
              {application.resumeUrl ? (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View uploaded CV
                </a>
              ) : /* Priority 2: Check if resume is a URL */ application.resume?.startsWith(
                  "http",
                ) ? (
                <a
                  href={application.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View CV
                </a>
              ) : /* Priority 3: Display resume as text */ application.resume ? (
                <p className="whitespace-pre-wrap">{application.resume}</p>
              ) : (
                <p className="text-gray-500 italic">No CV available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Application Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div>
              <p className="font-medium">Application Submitted</p>
              <p className="text-sm text-gray-600">{formatDate(application.appliedAt)}</p>
            </div>
          </div>

          {application.reviewedAt && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div>
                <p className="font-medium">Reviewed by Recruiter</p>
                <p className="text-sm text-gray-600">{formatDate(application.reviewedAt)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recruiter Feedback */}
      {application.recruiterNote && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Recruiter Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{application.recruiterNote}</p>
          </CardContent>
        </Card>
      )}

      {/* Withdraw Dialog */}
      <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Confirm Application Withdrawal
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="withdraw-reason">Reason for withdrawal (optional)</Label>
            <Textarea
              id="withdraw-reason"
              placeholder="Enter reason for withdrawal..."
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-gray-500">{withdrawReason.length}/500 characters</p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWithdrawing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              variant="destructive"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Withdrawal"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
