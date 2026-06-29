import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icons } from '@/components/icons/icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  useGetInterviewsQuery,
  useRespondToInterviewMutation,
  InterviewStatus,
  type Interview,
} from '@/redux/features/interviews/interviewApi';

const STATUS_CONFIG = {
  [InterviewStatus.PENDING]: {
    label: 'Pending Response',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Icons.clock,
  },
  [InterviewStatus.ACCEPTED]: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Icons.checkCircle,
  },
  [InterviewStatus.REJECTED]: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: Icons.x,
  },
  [InterviewStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Icons.checkCheck,
  },
  [InterviewStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Icons.x,
  },
};

export default function JobSeekerInterviewsPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<InterviewStatus | 'all'>('all');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading, error } = useGetInterviewsQuery({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });

  const [respondToInterview, { isLoading: isResponding }] = useRespondToInterviewMutation();

  const handleAccept = async (interview: Interview) => {
    try {
      await respondToInterview({
        id: interview._id,
        data: { accepted: true },
      }).unwrap();
      toast.success('Interview invitation accepted');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to accept invitation');
    }
  };

  const handleRejectClick = (interview: Interview) => {
    setSelectedInterview(interview);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedInterview || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await respondToInterview({
        id: selectedInterview._id,
        data: {
          accepted: false,
          rejectionReason: rejectionReason.trim(),
        },
      }).unwrap();
      toast.success('Interview invitation rejected');
      setRejectModalOpen(false);
      setSelectedInterview(null);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reject invitation');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icons.loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Icons.alertCircle}
        message="Unable to load interviews. Please try again later."
      />
    );
  }

  const interviews = data?.interviews || [];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fixed background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#F97A00] from-40% to-white to-40%"
      />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 pt-4 mt-32">
        <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Interviews</h1>
            <p className="text-gray-600 text-sm mt-2">Manage your interview invitations</p>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <ButtonLowercase
              size="sm"
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedStatus('all')}
              className={selectedStatus === 'all' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-orange-500 text-orange-500 hover:bg-orange-50'}
            >
              All
            </ButtonLowercase>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <ButtonLowercase
                key={status}
                size="sm"
                variant={selectedStatus === status ? 'default' : 'outline'}
                onClick={() => setSelectedStatus(status as InterviewStatus)}
                className={selectedStatus === status ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-orange-500 text-orange-500 hover:bg-orange-50'}
              >
                {config.label}
              </ButtonLowercase>
            ))}
          </div>

      {/* Interviews List */}
      {interviews.length > 0 ? (
        <div className="space-y-3">
          {interviews.map((interview) => {
            const statusConfig = STATUS_CONFIG[interview.status];
            const StatusIcon = statusConfig.icon;
            const interviewDate = new Date(interview.scheduledDate);
            const isPending = interview.status === InterviewStatus.PENDING;

            return (
              <Card key={interview._id} className="p-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Icons.calendar className="w-6 h-6 text-blue-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{interview.jobId.title}</h3>
                          <p className="text-sm text-gray-600">
                            with {interview.recruiterId.firstName} {interview.recruiterId.lastName}
                          </p>
                        </div>
                        <Badge className={`${statusConfig.color} shrink-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Interview Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Icons.calendar className="w-4 h-4 text-gray-500" />
                          <span>{format(interviewDate, 'MMMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icons.clock className="w-4 h-4 text-gray-500" />
                          <span>
                            {interview.scheduledTime} ({interview.duration} minutes)
                          </span>
                        </div>
                        {interview.location && (
                          <div className="flex items-center gap-2">
                            <Icons.mapPin className="w-4 h-4 text-gray-500" />
                            <span className="truncate">{interview.location}</span>
                          </div>
                        )}
                        {interview.meetingLink && (
                          <div className="flex items-center gap-2">
                            <Icons.globe className="w-4 h-4 text-gray-500" />
                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Note */}
                      {interview.note && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                          <p className="text-sm text-gray-700">{interview.note}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {isPending && (
                          <>
                            <ButtonLowercase
                              size="sm"
                              onClick={() => handleAccept(interview)}
                              disabled={isResponding}
                            >
                              <Icons.check className="w-4 h-4 mr-1" />
                              Accept
                            </ButtonLowercase>
                            <ButtonLowercase
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectClick(interview)}
                              disabled={isResponding}
                            >
                              <Icons.x className="w-4 h-4 mr-1" />
                              Reject
                            </ButtonLowercase>
                          </>
                        )}
                        <ButtonLowercase
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/job-seeker/interviews/${interview._id}`)}
                        >
                          View Details
                        </ButtonLowercase>
                      </div>

                      {/* Response Info */}
                      {interview.jobSeekerResponse && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                          <p>
                            You {interview.jobSeekerResponse.accepted ? 'accepted' : 'rejected'}{' '}
                            on {format(new Date(interview.jobSeekerResponse.respondedAt), 'MMM dd, yyyy')}
                          </p>
                          {interview.jobSeekerResponse.rejectionReason && (
                            <p className="mt-1">
                              Reason: {interview.jobSeekerResponse.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Icons.calendar}
          message={
            selectedStatus === 'all'
              ? 'No interview invitations yet'
              : `No ${STATUS_CONFIG[selectedStatus as InterviewStatus]?.label.toLowerCase()} interviews`
          }
        />
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Interview Invitation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason" className="required">
                Reason for Rejection
              </Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you cannot attend this interview..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                maxLength={500}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">{rejectionReason.length}/500</p>
            </div>
          </div>
          <DialogFooter>
            <ButtonLowercase
              variant="outline"
              onClick={() => setRejectModalOpen(false)}
              disabled={isResponding}
            >
              Cancel
            </ButtonLowercase>
            <ButtonLowercase
              onClick={handleRejectSubmit}
              disabled={isResponding || !rejectionReason.trim()}
            >
              {isResponding && <Icons.loader className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Rejection
            </ButtonLowercase>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </main>
    </div>
  );
}
