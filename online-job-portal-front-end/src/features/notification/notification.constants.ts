import { NotificationType } from './notification.type';
import { 
  Settings, 
  FileText, 
  Mail, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  AlertOctagon, 
  Megaphone,
  type LucideIcon
} from 'lucide-react';

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, {
  label: string;
  color: string;
  icon: LucideIcon;
}> = {
  [NotificationType.SYSTEM]: {
    label: 'System',
    color: 'bg-purple-100 text-purple-800',
    icon: Settings,
  },
  [NotificationType.APPLICATION_STATUS]: {
    label: 'Application Status',
    color: 'bg-blue-100 text-blue-800',
    icon: FileText,
  },
  [NotificationType.APPLICATION_RECEIVED]: {
    label: 'New Application',
    color: 'bg-green-100 text-green-800',
    icon: Mail,
  },
  [NotificationType.INTERVIEW_INVITATION]: {
    label: 'Interview Invitation',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Calendar,
  },
  [NotificationType.INTERVIEW_RESPONSE]: {
    label: 'Interview Response',
    color: 'bg-indigo-100 text-indigo-800',
    icon: CheckCircle,
  },
  [NotificationType.REPORT_JOB]: {
    label: 'Job Report',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
  },
  [NotificationType.REPORT_USER]: {
    label: 'User Report',
    color: 'bg-red-100 text-red-800',
    icon: AlertOctagon,
  },
  [NotificationType.ADMIN_BROADCAST]: {
    label: 'Important Announcement',
    color: 'bg-orange-100 text-orange-800',
    icon: Megaphone,
  },
} as const;

export const NOTIFICATION_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: NotificationType.SYSTEM, label: NOTIFICATION_TYPE_CONFIG[NotificationType.SYSTEM].label },
  { value: NotificationType.APPLICATION_STATUS, label: NOTIFICATION_TYPE_CONFIG[NotificationType.APPLICATION_STATUS].label },
  { value: NotificationType.APPLICATION_RECEIVED, label: NOTIFICATION_TYPE_CONFIG[NotificationType.APPLICATION_RECEIVED].label },
  { value: NotificationType.INTERVIEW_INVITATION, label: NOTIFICATION_TYPE_CONFIG[NotificationType.INTERVIEW_INVITATION].label },
  { value: NotificationType.INTERVIEW_RESPONSE, label: NOTIFICATION_TYPE_CONFIG[NotificationType.INTERVIEW_RESPONSE].label },
  { value: NotificationType.ADMIN_BROADCAST, label: NOTIFICATION_TYPE_CONFIG[NotificationType.ADMIN_BROADCAST].label },
] as const;

export const NOTIFICATION_CONSTANTS = {
  ITEMS_PER_PAGE: 7,
  DROPDOWN_MAX_ITEMS: 5,
  POLLING_INTERVAL: 30000, 
} as const;