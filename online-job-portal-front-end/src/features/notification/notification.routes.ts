import { NotificationType } from '@/features/notification/notification.type';

const getCurrentUserRole = (): 'recruiter' | 'job-seeker' | 'admin' => {
  const user = localStorage.getItem('user');
  if (user) {
    const parsed = JSON.parse(user);
    return parsed.role || 'job-seeker';
  }
  
  const currentPath = window.location.pathname;
  if (currentPath.startsWith('/recruiter')) return 'recruiter';
  if (currentPath.startsWith('/admin')) return 'admin';
  return 'job-seeker';
};

export const getDefaultNotificationRoute = (
  type: NotificationType,
  metadata?: {
    applicationId?: string;
    jobId?: string;
    interviewId?: string;
    reportId?: string;
  }
): string => {
  const currentRole = getCurrentUserRole();

  switch (type) {
    case NotificationType.APPLICATION_RECEIVED:
      return metadata?.applicationId 
        ? `/recruiter/applications/${metadata.applicationId}`
        : '/recruiter/applications';

    case NotificationType.APPLICATION_STATUS:
      // ✅ FIX: Job Seeker - Nếu không có applicationId, chỉ về list
      // Vì backend có thể gửi sai ID (userId thay vì applicationId)
      if (!metadata?.applicationId) {
        console.warn('⚠️ Missing applicationId in notification metadata');
        return '/job-seeker/applications';
      }
      
      // ✅ Validate: Check nếu ID trông giống userId (24 chars hex)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(metadata.applicationId);
      if (!isValidObjectId) {
        console.error('❌ Invalid applicationId format:', metadata.applicationId);
        return '/job-seeker/applications';
      }
      
      return `/job-seeker/applications/${metadata.applicationId}`;

    case NotificationType.INTERVIEW_INVITATION:
      return metadata?.interviewId
        ? `/job-seeker/interviews/${metadata.interviewId}`
        : '/job-seeker/interviews';

    case NotificationType.INTERVIEW_RESPONSE:
      return metadata?.interviewId
        ? `/recruiter/interviews/${metadata.interviewId}`
        : '/recruiter/interviews';

    case NotificationType.REPORT_JOB:
    case NotificationType.REPORT_USER:
      return metadata?.reportId
        ? `/admin/reports/${metadata.reportId}`
        : '/admin/reports';

    case NotificationType.ADMIN_BROADCAST:
    case NotificationType.SYSTEM:
      return `/${currentRole}/notifications`;

    default:
      return `/${currentRole}/notifications`;
  }
};

export const normalizeNotificationUrl = (
  actionUrl: string | undefined,
  type: NotificationType,
  metadata?: {
    applicationId?: string;
    jobId?: string;
    interviewId?: string;
    reportId?: string;
  }
): string => {
  // ✅ Priority 1: Use metadata.interviewId for interview notifications
  if (type === NotificationType.INTERVIEW_INVITATION && metadata?.interviewId) {
    return `/job-seeker/interviews/${metadata.interviewId}`;
  }

  if (type === NotificationType.INTERVIEW_RESPONSE && metadata?.interviewId) {
    return `/recruiter/interviews/${metadata.interviewId}`;
  }

  // ✅ Priority 2: Use default route if no actionUrl
  if (!actionUrl) {
    return getDefaultNotificationRoute(type, metadata);
  }

  if (actionUrl.startsWith('http://') || actionUrl.startsWith('https://')) {
    return actionUrl;
  }

  if (
    actionUrl.startsWith('/recruiter/') ||
    actionUrl.startsWith('/job-seeker/') ||
    actionUrl.startsWith('/admin/')
  ) {
    return actionUrl;
  }

  // ✅ Priority 3: Add role prefix based on notification type
  const rolePrefix = getRolePrefixByNotificationType(type);
  
  // Handle interview URLs
  if (actionUrl.includes('/interviews')) {
    const cleanUrl = actionUrl.replace('/respond', '');
    return `${rolePrefix}${cleanUrl}`;
  }

  // Handle application URLs
  if (actionUrl.startsWith('/applications/')) {
    return `${rolePrefix}${actionUrl}`;
  }

  // Handle report URLs
  if (actionUrl.startsWith('/reports/')) {
    return `/admin${actionUrl}`;
  }

  return actionUrl;
};

const getRolePrefixByNotificationType = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.APPLICATION_RECEIVED:
    case NotificationType.INTERVIEW_RESPONSE:
      return '/recruiter';

    case NotificationType.APPLICATION_STATUS:
    case NotificationType.INTERVIEW_INVITATION:
      return '/job-seeker';

    case NotificationType.REPORT_JOB:
    case NotificationType.REPORT_USER:
    case NotificationType.ADMIN_BROADCAST:
      return '/admin';

    default:
      return `/${getCurrentUserRole()}`;
  }
};