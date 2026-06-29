import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Bell, Check, Trash2, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import type { Notification } from '../notification.type';
import { NOTIFICATION_TYPE_CONFIG } from '../notification.constants';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { normalizeNotificationUrl } from '../notification.routes';
import { toast } from 'sonner';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const navigate = useNavigate(); 
  const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type] || {
    label: 'Others',
    color: 'bg-gray-100 text-gray-800',
    icon: Bell,
  };

  const handleCardClick = async () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    
    const targetUrl = normalizeNotificationUrl(
      notification.metadata?.actionUrl,
      notification.type,
      notification.metadata
    );
    
    console.log('🔗 Notification click:', {
      type: notification.type,
      originalUrl: notification.metadata?.actionUrl,
      normalizedUrl: targetUrl,
      metadata: notification.metadata,
    });
    
    // ✅ FIX: Kiểm tra nếu navigate đến detail page có applicationId hợp lệ
    if (targetUrl.includes('/applications/') && notification.metadata?.applicationId) {
      try {
        // Navigate và xem có lỗi không
        navigate(targetUrl);
        
        // ✅ OPTION: Check nếu 404, fallback về list page
        // Cần implement error boundary hoặc check response
      } catch (error) {
        console.error('❌ Navigation failed:', error);
        toast.error('Cannot open application details. Redirecting to list...');
        
        // Fallback về list page
        const listUrl = targetUrl.split('/').slice(0, -1).join('/');
        navigate(listUrl);
      }
    } else {
      if (targetUrl.startsWith('http')) {
        window.open(targetUrl, '_blank');
      } else {
        navigate(targetUrl);
      }
    }
  };

  const IconComponent = typeConfig.icon;

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border-l-4 ${
        !notification.isRead 
          ? 'border-l-orange-500 bg-gradient-to-r from-orange-50/40 to-white shadow-md' 
          : 'border-l-gray-300 bg-white hover:border-l-orange-400'
      }`}
      onClick={handleCardClick}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm transition-transform hover:scale-105 ${
              !notification.isRead ? 'bg-gradient-to-br from-orange-400 to-orange-500' : 'bg-gray-100'
            }`}>
              {!notification.isRead ? (
                <Bell className="w-5 h-5 text-white" />
              ) : (
                <IconComponent className="w-5 h-5" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <h3 className={`text-sm font-bold leading-snug ${
                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {notification.title}
              </h3>

              <Badge 
                variant="secondary" 
                className={`text-xs shrink-0 font-semibold px-2 py-0.5 flex items-center gap-1 ${typeConfig.color}`}
              >
                <IconComponent className="w-3 h-3" />
                {typeConfig.label}
              </Badge>
            </div>

            {/* Message */}
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
              {notification.content}
            </p>

            {/* ✅ DEBUG INFO (Xóa sau khi fix)
            {process.env.NODE_ENV === 'development' && notification.metadata?.applicationId && (
              <div className="text-[10px] text-gray-400 bg-gray-50 p-1 rounded">
                App ID: {notification.metadata.applicationId}
              </div>
            )} */}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1.5 border-t border-gray-100">
              
              {/* Time Info */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-500" />
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-orange-500" />
                  {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                {!notification.isRead && (
                  <ButtonLowercase
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification._id);
                    }}
                    className="text-xs h-7 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100 transition-all font-medium"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Mark as Read
                  </ButtonLowercase>
                )}

                <ButtonLowercase
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification._id);
                  }}
                  className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-100 transition-all font-medium"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </ButtonLowercase>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};