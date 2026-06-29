import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icons } from '@/components/icons/icons';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  useGetInterviewsQuery,
  InterviewStatus,
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

export default function RecruiterInterviewsPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<InterviewStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useGetInterviewsQuery({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });

  const allInterviews = data?.interviews || [];

  // Filter interviews by search term (name or email)
  const interviews = useMemo(() => {
    if (!searchTerm.trim()) return allInterviews;

    const lowerSearch = searchTerm.toLowerCase();
    return allInterviews.filter((interview) => {
      const fullName = `${interview.jobSeekerId.firstName} ${interview.jobSeekerId.lastName}`.toLowerCase();
      const email = interview.jobSeekerId.email.toLowerCase();
      return fullName.includes(lowerSearch) || email.includes(lowerSearch);
    });
  }, [allInterviews, searchTerm]);

  const handleViewDetails = (interviewId: string) => {
    navigate(`/recruiter/interviews/${interviewId}`);
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
      <div className="space-y-4">
        <EmptyState icon={Icons.alertCircle} message="Failed to load interviews" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interview Management</h1>
          <p className="text-gray-600 mt-1">Manage all scheduled interviews</p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by candidate name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Icons.filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium whitespace-nowrap">Filter by status:</span>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as InterviewStatus | 'all')}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interviews</SelectItem>
                  <SelectItem value={InterviewStatus.PENDING}>Pending Response</SelectItem>
                  <SelectItem value={InterviewStatus.ACCEPTED}>Accepted</SelectItem>
                  <SelectItem value={InterviewStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={InterviewStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={InterviewStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{interviews.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {interviews.filter((i) => i.status === InterviewStatus.PENDING).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">
                {interviews.filter((i) => i.status === InterviewStatus.ACCEPTED).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {interviews.filter((i) => i.status === InterviewStatus.COMPLETED).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {interviews.filter((i) => i.status === InterviewStatus.REJECTED).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <EmptyState
          icon={Icons.calendar}
          message={
            selectedStatus === 'all'
              ? 'No interviews scheduled yet'
              : `No ${selectedStatus} interviews`
          }
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => {
            const statusConfig = STATUS_CONFIG[interview.status];
            const StatusIcon = statusConfig.icon;
            const interviewDate = new Date(interview.scheduledDate);

            return (
              <Card
                key={interview._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(interview._id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Job & Candidate Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {interview.jobId.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Icons.user className="w-4 h-4" />
                            <span>
                              {interview.jobSeekerId.firstName} {interview.jobSeekerId.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icons.mail className="w-4 h-4" />
                            <span>{interview.jobSeekerId.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Schedule Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Icons.calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {format(interviewDate, 'EEE, MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-700">
                          <Icons.clock className="w-4 h-4" />
                          <span className="font-medium">{interview.scheduledTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-700">
                          <Icons.timer className="w-4 h-4" />
                          <span>{interview.duration} mins</span>
                        </div>
                      </div>

                      {/* Location/Link */}
                      {interview.location && (
                        <div className="flex items-start gap-1 text-sm text-gray-600">
                          <Icons.mapPin className="w-4 h-4 mt-0.5" />
                          <span>{interview.location}</span>
                        </div>
                      )}
                      {interview.meetingLink && (
                        <div className="flex items-start gap-1 text-sm text-blue-600">
                          <Icons.link className="w-4 h-4 mt-0.5" />
                          <span className="break-all">{interview.meetingLink}</span>
                        </div>
                      )}

                      {/* Response Info */}
                      {interview.jobSeekerResponse && (
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Responded on{' '}
                            {format(new Date(interview.jobSeekerResponse.respondedAt), 'PPp')}
                          </p>
                          {interview.jobSeekerResponse.rejectionReason && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Reason: </span>
                              {interview.jobSeekerResponse.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Status Badge */}
                    <div className="flex flex-col items-end gap-3">
                      <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>

                      <ButtonLowercase
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(interview._id);
                        }}
                        className="cursor-pointer"
                      >
                        View Details
                        <Icons.arrowRight className="w-4 h-4 ml-1" />
                      </ButtonLowercase>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
