import { baseApi } from '@/redux/baseApi';
import type { 
  Notification, 
  GetNotificationsResponse, 
  GetUnreadCountResponse 
} from '@/features/notification/notification.type';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 100 } = {}) => ({
        url: '/notifications',
        params: { page, limit },
      }),
      transformResponse: (response: GetNotificationsResponse) => 
        response.data.notifications,
      providesTags: ['Notification'],
    }),

    getUnreadCount: builder.query<number, void>({
      query: () => '/notifications/unread-count',
      transformResponse: (response: GetUnreadCountResponse) => 
        response.data.unreadCount,
      providesTags: ['Notification'],
    }),

    markAsRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    deleteNotification: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    deleteAllNotifications: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications',
        method: 'DELETE',
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
  useDeleteAllNotificationsMutation,
} = notificationsApi;