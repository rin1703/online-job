import { baseApi } from '@/redux/baseApi';

export interface Notification {
  _id: string;
  title: string;
  content: string;
  type: string;
  sender: {
    userId?: string;
    role: string;
    name?: string;
  };
  recipient: {
    userId: string;
    role: string;
    email: string;
  };
  metadata?: {
    jobId?: string;
    applicationId?: string;
    interviewId?: string;
    reportId?: string;
    actionUrl?: string;
  };
  isRead: boolean;
  sentViaEmail: boolean;
  emailSentAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}

export interface BroadcastRequest {
  title: string;
  content: string;
  targetAudience: 'all' | 'job_seekers' | 'recruiters' | 'specific';
  specificEmails?: string[];
}

export interface BroadcastResponse {
  success: boolean;
  message: string;
  data: {
    sent: number;
    failed: number;
  };
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get notifications for current user
    getNotifications: builder.query<NotificationResponse['data'], { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/notifications',
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['Notification'],
    }),

    // Get unread count
    getUnreadCount: builder.query<number, void>({
      query: () => ({
        url: '/notifications/unread-count',
        method: 'GET',
      }),
      transformResponse: (response: UnreadCountResponse) => response.data.unreadCount,
      providesTags: ['Notification'],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Delete notification
    deleteNotification: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Admin: Send broadcast notification
    sendBroadcast: builder.mutation<BroadcastResponse['data'], BroadcastRequest>({
      query: (data) => ({
        url: '/notifications/admin/broadcast',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useSendBroadcastMutation,
} = notificationApi;

