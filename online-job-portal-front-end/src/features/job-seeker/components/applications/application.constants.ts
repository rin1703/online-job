import { PAGINATION, STORAGE_KEYS, SALARY, DATE_TIME } from '@/features/job-seeker/constants/jobseeker.constants';

// Status configuration matching backend ApplicationStatus enum
export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏳',
  },
  reviewed: {
    label: 'Reviewed',
    color: 'bg-blue-100 text-blue-800',
    icon: '👁️',
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: '✅',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: '❌',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    color: 'bg-purple-100 text-purple-800',
    icon: '📅',
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'bg-gray-100 text-gray-800',
    icon: '🚫',
  },
} as const;

export const APPLICATION_CONSTANTS = {
  ITEMS_PER_PAGE: PAGINATION.APPLICATIONS_PER_PAGE,
  SCROLL_POSITION_KEY: STORAGE_KEYS.APPLICATIONS_SCROLL_POSITION,
} as const;

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: STATUS_CONFIG.pending.label },
  { value: 'reviewed', label: STATUS_CONFIG.reviewed.label },
  { value: 'approved', label: STATUS_CONFIG.approved.label },
  { value: 'rejected', label: STATUS_CONFIG.rejected.label },
  { value: 'interview_scheduled', label: STATUS_CONFIG.interview_scheduled.label },
  { value: 'withdrawn', label: STATUS_CONFIG.withdrawn.label },
] as const;

// Helper function to format salary
export const formatSalary = (amount: number): string => {
  if (amount >= SALARY.BILLION_THRESHOLD) {
    return `${(amount / SALARY.BILLION_THRESHOLD).toFixed(1)}B`;
  }
  if (amount >= SALARY.MILLION_THRESHOLD) {
    return `${(amount / SALARY.MILLION_THRESHOLD).toFixed(0)}M`;
  }
  return amount.toLocaleString('en-US');
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Helper function to get relative time
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / DATE_TIME.MS_PER_DAY);

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < DATE_TIME.DAYS_IN_WEEK) return `${diffInDays} days ago`;
  if (diffInDays < DATE_TIME.DAYS_IN_MONTH) return `${Math.floor(diffInDays / DATE_TIME.DAYS_IN_WEEK)} weeks ago`;
  if (diffInDays < DATE_TIME.DAYS_IN_YEAR) return `${Math.floor(diffInDays / DATE_TIME.DAYS_IN_MONTH)} months ago`;
  return `${Math.floor(diffInDays / DATE_TIME.DAYS_IN_YEAR)} years ago`;
};
