import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  useGetNotificationsQuery, 
  useGetUnreadCountQuery,
  useMarkAsReadMutation 
} from '@/redux/features/notification/notificationsApi';
import { NOTIFICATION_CONSTANTS, NOTIFICATION_TYPE_CONFIG } from '@/features/notification/notification.constants';
import { normalizeNotificationUrl } from '@/features/notification/notification.routes'; // ✅ UPDATED
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import React from 'react';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: notifications = [], isLoading } = useGetNotificationsQuery({
    limit: NOTIFICATION_CONSTANTS.DROPDOWN_MAX_ITEMS,
  });

  const { data: unreadCount = 0 } = useGetUnreadCountQuery();
  const [markAsRead] = useMarkAsReadMutation();

  const handleNotificationClick = async (
    id: string, 
    type: string,
    metadata?: {
      actionUrl?: string;
      applicationId?: string;
      jobId?: string;
      interviewId?: string;
      reportId?: string;
    }
  ) => {
    try {
      await markAsRead(id).unwrap();
      setIsOpen(false);
      
      // ✅ FIX: Sử dụng normalizeNotificationUrl
      const targetUrl = normalizeNotificationUrl(
        metadata?.actionUrl,
        type as any,
        metadata
      );
      
      console.log('🔗 Dropdown notification click:', {
        type,
        originalUrl: metadata?.actionUrl,
        normalizedUrl: targetUrl,
        metadata,
      });
      
      if (targetUrl.startsWith('http')) {
        window.open(targetUrl, '_blank');
      } else {
        navigate(targetUrl);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button 
          className="relative text-gray-700 hover:text-orange-500 transition-colors p-2 rounded-md hover:bg-gray-100"
        >
          <Icons.bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-base">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Notification List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icons.loader className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Icons.bell className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type] || {
                  label: 'Notification',
                  color: 'bg-gray-100 text-gray-800',
                  icon: Icons.bell,
                };
                
                return (
                  <DropdownMenuItem
                    key={notification._id}
                    className="cursor-pointer p-0 focus:bg-gray-50"
                    onClick={() => handleNotificationClick(
                      notification._id,
                      notification.type,
                      notification.metadata
                    )}
                  >
                    <div className={`w-full px-4 py-3 ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}>
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          !notification.isRead ? 'bg-orange-500' : 'bg-gray-200'
                        }`}>
                          {typeConfig.icon && React.createElement(typeConfig.icon, {
                            className: `w-4 h-4 ${!notification.isRead ? 'text-white' : 'text-gray-600'}`
                          })}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                            {notification.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link
                to="/notifications"
                className="block w-full text-center py-2 text-sm text-orange-600 hover:text-orange-700 font-medium hover:bg-orange-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};