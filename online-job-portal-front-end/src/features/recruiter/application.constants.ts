import { ApplicationStatus } from '@/features/recruiter/application.type';
import { FileText, Eye, UserCheck, UserX, Calendar, XCircle } from 'lucide-react';

export const STATUS_CONFIG = {
  [ApplicationStatus.PENDING]: {
    label: 'Applied',
    color: 'bg-blue-100 text-blue-800',
    icon: FileText,
  },
  [ApplicationStatus.REVIEWED]: {
    label: 'Reviewed',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Eye,
  },
  [ApplicationStatus.INTERVIEW_SCHEDULED]: {
    label: 'Interview Scheduled',
    color: 'bg-orange-100 text-orange-800',
    icon: Calendar,
  },
  [ApplicationStatus.APPROVED]: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: UserCheck,
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: UserX,
  },
  [ApplicationStatus.WITHDRAWN]: {
    label: 'Withdrawn',
    color: 'bg-gray-100 text-gray-800',
    icon: XCircle,
  },
} as const;

export const APPLICATION_CONSTANTS = {
  ITEMS_PER_PAGE: 7,
  SCROLL_POSITION_KEY: 'applications_scroll_position',
} as const;

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: ApplicationStatus.PENDING, label: 'Applied' },
  { value: ApplicationStatus.REVIEWED, label: 'Reviewed' },
  { value: ApplicationStatus.INTERVIEW_SCHEDULED, label: 'Interview Scheduled' },
  { value: ApplicationStatus.APPROVED, label: 'Approved' },
  { value: ApplicationStatus.REJECTED, label: 'Rejected' },
  { value: ApplicationStatus.WITHDRAWN, label: 'Withdrawn' },
] as const;