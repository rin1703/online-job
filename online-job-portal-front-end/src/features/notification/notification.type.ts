export enum NotificationType {
  SYSTEM = 'system',
  APPLICATION_STATUS = 'application_status',
  APPLICATION_RECEIVED = 'application_received',
  INTERVIEW_INVITATION = 'interview_invitation',
  INTERVIEW_RESPONSE = 'interview_response',
  REPORT_JOB = 'report_job',
  REPORT_USER = 'report_user',
  ADMIN_BROADCAST = 'admin_broadcast',
}

export interface NotificationSender {
  userId?: string;
  role: string;
  name?: string;
}

export interface NotificationRecipient {
  userId: string;
  email: string;
  role: string;
}

export interface NotificationMetadata {
  jobId?: string;
  applicationId?: string;
  interviewId?: string;
  reportId?: string;
  actionUrl?: string;
}

export interface Notification {
  _id: string;
  title: string;
  content: string;
  type: NotificationType;
  sender: NotificationSender;
  recipient: NotificationRecipient;
  isRead: boolean;
  sentViaEmail: boolean;
  metadata?: NotificationMetadata;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
}

export interface NotificationFilters {
  search: string;
  type: NotificationType | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface GetUnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}