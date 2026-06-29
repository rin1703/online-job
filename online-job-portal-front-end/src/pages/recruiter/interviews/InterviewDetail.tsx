import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons/icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  useGetInterviewByIdQuery,
  useUpdateInterviewResultMutation,
  InterviewStatus,
} from '@/redux/features/interviews/interviewApi';
import { EditScheduleModal } from '@/features/recruiter/components/interviews/EditScheduleModal';

const STATUS_CONFIG = {
  [InterviewStatus.PENDING]: {
    label: 'Pending Response',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  [InterviewStatus.ACCEPTED]: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  [InterviewStatus.REJECTED]: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  [InterviewStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  [InterviewStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

export default function RecruiterInterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [editScheduleModalOpen, setEditScheduleModalOpen] = useState(false);
  const [resultPassed, setResultPassed] = useState<boolean | null>(null);
  const [resultFeedback, setResultFeedback] = useState('');

  const { data: interview, isLoading, error } = useGetInterviewByIdQuery(id!);
  const [updateResult, { isLoading: isUpdating }] = useUpdateInterviewResultMutation();

  const handleOpenResultModal = () => {
    setResultPassed(interview?.result?.passed ?? null);
    setResultFeedback(interview?.result?.feedback ?? '');
    setResultModalOpen(true);
  };

  const handleSubmitResult = async () => {
    if (resultPassed === null) {
      toast.error('Please select pass or fail');
      return;
    }
    if (!resultFeedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    try {
      await updateResult({
        id: id!,
        data: {
          passed: resultPassed,
          feedback: resultFeedback.trim(),
        },
      }).unwrap();
      toast.success('Interview result updated successfully');
      setResultModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update interview result');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icons.loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="space-y-6">
        <EmptyState icon={Icons.alertCircle} message="Interview not found" />
        <div className="flex justify-center">
          <ButtonLowercase onClick={() => navigate(-1)}>
            <Icons.arrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </ButtonLowercase>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[interview.status];
  const interviewDate = new Date(interview.scheduledDate);

  return (
    <div className="space-y-6">
      <ButtonLowercase variant="ghost" onClick={() => navigate(-1)} size="sm" className="cursor-pointer">
        <Icons.arrowLeft className="w-4 h-4 mr-2" />
        Back to Interviews
      </ButtonLowercase>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{interview.jobId?.title || 'Interview'}</h1>
              <p className="text-gray-600">
                Interview with {interview.jobSeekerId?.firstName || ''} {interview.jobSeekerId?.lastName || ''}
              </p>
            </div>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Interview Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icons.calendar className="w-5 h-5" />
                  Schedule Information
                </CardTitle>
                <ButtonLowercase
                  variant="outline"
                  size="sm"
                  onClick={() => setEditScheduleModalOpen(true)}
                  className="cursor-pointer"
                >
                  <Icons.edit className="w-4 h-4 mr-2" />
                  Edit
                </ButtonLowercase>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Date</Label>
                  <p className="font-medium">{format(interviewDate, 'EEEE, MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Time</Label>
                  <p className="font-medium">{interview.scheduledTime}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Duration</Label>
                  <p className="font-medium">{interview.duration} minutes</p>
                </div>
                <div>
                  <Label className="text-gray-600">Scheduled on</Label>
                  <p className="font-medium">{format(new Date(interview.createdAt), 'PP')}</p>
                </div>
              </div>

              {interview.location && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-gray-600">Location</Label>
                    <p className="font-medium flex items-start gap-2 mt-1">
                      <Icons.mapPin className="w-4 h-4 mt-1" />
                      {interview.location}
                    </p>
                  </div>
                </>
              )}

              {interview.meetingLink && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-gray-600">Meeting Link</Label>
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline flex items-center gap-2 mt-1 break-all"
                    >
                      <Icons.link className="w-4 h-4" />
                      {interview.meetingLink}
                    </a>
                  </div>
                </>
              )}

              {interview.note && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-gray-600">Note</Label>
                    <p className="text-gray-800 mt-1 whitespace-pre-wrap">{interview.note}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Candidate Response */}
          {interview.jobSeekerResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.messageSquare className="w-5 h-5" />
                  Candidate Response
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-gray-600">Status:</Label>
                  {interview.jobSeekerResponse.accepted ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Icons.checkCircle className="w-3 h-3 mr-1" />
                      Accepted
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <Icons.x className="w-3 h-3 mr-1" />
                      Rejected
                    </Badge>
                  )}
                </div>
                <div>
                  <Label className="text-gray-600">Responded on:</Label>
                  <p className="font-medium">
                    {format(new Date(interview.jobSeekerResponse.respondedAt), 'PPp')}
                  </p>
                </div>
                {interview.jobSeekerResponse.rejectionReason && (
                  <div>
                    <Label className="text-gray-600">Rejection Reason:</Label>
                    <p className="text-gray-800 mt-1 bg-red-50 p-3 rounded border border-red-100">
                      {interview.jobSeekerResponse.rejectionReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Interview Result */}
          {interview.result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.clipboardCheck className="w-5 h-5" />
                  Interview Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-gray-600">Result:</Label>
                  {interview.result.passed ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Icons.checkCircle className="w-3 h-3 mr-1" />
                      Passed
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <Icons.x className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
                <div>
                  <Label className="text-gray-600">Evaluated on:</Label>
                  <p className="font-medium">
                    {format(new Date(interview.result.evaluatedAt), 'PPp')}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Feedback:</Label>
                  <p className="text-gray-800 mt-1 bg-gray-50 p-3 rounded border">
                    {interview.result.feedback}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Candidate & Actions */}
        <div className="space-y-6">
          {/* Candidate Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.user className="w-5 h-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-gray-600">Name</Label>
                <p className="font-medium">
                  {interview.jobSeekerId?.firstName || ''} {interview.jobSeekerId?.lastName || ''}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Email </Label>
                <a
                  href={`mailto:${interview.jobSeekerId?.email || ''}`}
                  className="text-blue-600 hover:underline break-all"
                >
                  {interview.jobSeekerId?.email || 'N/A'}
                </a>
              </div>
              <Separator />
              <ButtonLowercase
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => navigate(`/recruiter/applications/${interview.applicationId}`)}
              >
                <Icons.fileText className="w-4 h-4 mr-2" />
                View Application
              </ButtonLowercase>
            </CardContent>
          </Card>

          {/* Actions */}
          {interview.status === InterviewStatus.ACCEPTED && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.settings className="w-5 h-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ButtonLowercase
                  variant="default"
                  className="w-full cursor-pointer"
                  onClick={handleOpenResultModal}
                >
                  <Icons.clipboardCheck className="w-4 h-4 mr-2" />
                  {interview.result ? 'Update Result' : 'Add Result'}
                </ButtonLowercase>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Result Modal */}
      <Dialog open={resultModalOpen} onOpenChange={setResultModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {interview.result ? 'Update Interview Result' : 'Add Interview Result'}
            </DialogTitle>
            <DialogDescription>
              Record the outcome of the interview and provide feedback to the candidate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Result *</Label>
              <Select
                value={resultPassed === null ? '' : resultPassed ? 'pass' : 'fail'}
                onValueChange={(value) => setResultPassed(value === 'pass')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">
                    <div className="flex items-center gap-2">
                      <Icons.checkCircle className="w-4 h-4 text-green-600" />
                      Passed
                    </div>
                  </SelectItem>
                  <SelectItem value="fail">
                    <div className="flex items-center gap-2">
                      <Icons.x className="w-4 h-4 text-red-600" />
                      Failed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Feedback *</Label>
              <Textarea
                placeholder="Provide detailed feedback about the interview..."
                value={resultFeedback}
                onChange={(e) => setResultFeedback(e.target.value)}
                rows={6}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 text-right">
                {resultFeedback.length}/1000 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <ButtonLowercase variant="outline" onClick={() => setResultModalOpen(false)} className="cursor-pointer">
              Cancel
            </ButtonLowercase>
            <ButtonLowercase onClick={handleSubmitResult} disabled={isUpdating} className="cursor-pointer">
              {isUpdating && <Icons.loader className="w-4 h-4 mr-2 animate-spin" />}
              {interview.result ? 'Update Result' : 'Submit Result'}
            </ButtonLowercase>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Modal */}
      {interview && (
        <EditScheduleModal
          open={editScheduleModalOpen}
          onClose={() => setEditScheduleModalOpen(false)}
          interview={interview}
        />
      )}
    </div>
  );
}
