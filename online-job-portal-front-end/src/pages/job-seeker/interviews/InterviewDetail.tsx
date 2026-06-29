import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons/icons';

import {
  useGetInterviewByIdQuery,
  InterviewStatus,
} from '@/redux/features/interviews/interviewApi';

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

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: interview, isLoading, error } = useGetInterviewByIdQuery(id!);

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Fixed background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#F97A00] from-40% to-white to-40%"
      />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 pt-4 mt-32">
        <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
          <ButtonLowercase variant="ghost" onClick={() => navigate(-1)} size="sm">
            <Icons.arrowLeft className="w-4 h-4 mr-2" />
            Back
          </ButtonLowercase>

      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{interview.jobId.title}</h1>
              <p className="text-gray-600">
                Interview with {interview.recruiterId.firstName} {interview.recruiterId.lastName}
              </p>
            </div>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Interview Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Schedule Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.calendar className="w-4 h-4" />
                Schedule Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">{format(interviewDate, 'EEEE, MMMM dd, yyyy')}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-medium">{interview.scheduledTime}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-medium">{interview.duration} minutes</p>
              </div>
            </CardContent>
          </Card>

          {/* Location / Meeting Link */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.mapPin className="w-4 h-4" />
                Interview Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {interview.location && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Location (In-person)</p>
                    <p className="font-medium">{interview.location}</p>
                  </div>
                  {interview.meetingLink && <Separator />}
                </>
              )}
              {interview.meetingLink && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Online Meeting Link</p>
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Icons.globe className="w-4 h-4" />
                    Join Meeting
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recruiter Note */}
          {interview.note && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icons.fileText className="w-4 h-4" />
                  Additional Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{interview.note}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interview Result (if completed) */}
          {interview.result && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icons.checkCircle className="w-4 h-4" />
                  Interview Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div>
                  <p className="text-xs text-gray-500">Result</p>
                  <Badge
                    className={
                      interview.result.passed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {interview.result.passed ? 'Passed' : 'Not Passed'}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-gray-500 mb-2">Feedback</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {interview.result.feedback}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-gray-500">Evaluated On</p>
                  <p className="text-sm">
                    {format(new Date(interview.result.evaluatedAt), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Contact & Response */}
        <div className="space-y-4">
          {/* Recruiter Contact */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recruiter Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium">
                  {interview.recruiterId.firstName} {interview.recruiterId.lastName}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a
                  href={`mailto:${interview.recruiterId.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {interview.recruiterId.email}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Your Response */}
          {interview.jobSeekerResponse && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Your Response</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge
                    className={
                      interview.jobSeekerResponse.accepted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {interview.jobSeekerResponse.accepted ? 'Accepted' : 'Rejected'}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-gray-500">Responded On</p>
                  <p className="text-sm">
                    {format(new Date(interview.jobSeekerResponse.respondedAt), 'MMMM dd, yyyy')}
                  </p>
                </div>
                {interview.jobSeekerResponse.rejectionReason && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Reason</p>
                      <p className="text-sm text-gray-700">
                        {interview.jobSeekerResponse.rejectionReason}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Application Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Application</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ButtonLowercase
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/job-seeker/applications/${interview.applicationId}`)}
              >
                <Icons.fileText className="w-4 h-4 mr-2" />
                View Application
              </ButtonLowercase>
            </CardContent>
          </Card>
        </div>
      </div>
        </div>
      </main>
    </div>
  );
}
