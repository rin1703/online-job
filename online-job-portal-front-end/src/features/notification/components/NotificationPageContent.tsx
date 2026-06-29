import { useState, useMemo } from 'react';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Bell, Check, Loader2, Search, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotificationFilters } from './NotificationFilters';
import { NotificationItem } from './NotificationItem';
import { NotificationType } from '../notification.type';
import { NOTIFICATION_CONSTANTS } from '../notification.constants';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useGetUnreadCountQuery,
} from '@/redux/features/notification/notificationsApi';
import { toast } from 'sonner';

export interface NotificationPageContentProps {
  maxWidth?: string;
}

export function NotificationPageContent({ maxWidth = 'max-w-5xl' }: NotificationPageContentProps) {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all' as NotificationType | 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const { data: notifications = [], isLoading } = useGetNotificationsQuery({});
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchLower) ||
          n.content.toLowerCase().includes(searchLower)
      );
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter((n) => n.type === filters.type);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((n) => new Date(n.createdAt) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((n) => new Date(n.createdAt) <= endDate);
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, filters]);

  const totalPages = Math.ceil(
    filteredNotifications.length / NOTIFICATION_CONSTANTS.ITEMS_PER_PAGE
  );
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * NOTIFICATION_CONSTANTS.ITEMS_PER_PAGE,
    currentPage * NOTIFICATION_CONSTANTS.ITEMS_PER_PAGE
  );

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      toast.success('Marked as read', { duration: 1500 });
    } catch {
      toast.error('Cannot mark as read', { duration: 2000 });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success('Marked all as read', { duration: 1500 });
    } catch {
      toast.error('Cannot mark all as read', { duration: 2000 });
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      await deleteNotification(deleteConfirm.id).unwrap();
      toast.success('Deleted successfully!', { duration: 1500 });
      setDeleteConfirm({ open: false, id: null });
    } catch {
      toast.error('Cannot delete notification', { duration: 2000 });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ open: false, id: null });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
            <p className="text-gray-600 font-medium text-sm">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasFilters = filters.search || filters.type !== 'all' || filters.dateFrom || filters.dateTo;

  return (
    <>
      <div className="container mx-auto px-4 py-4">
        <div className={`${maxWidth} mx-auto space-y-4`}>
          {/* Header - Compact */}
          <div className="bg-white rounded-xl shadow-md border border-orange-100 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                      You have <span className="font-semibold text-orange-600">{unreadCount}</span>{' '}
                      unread notifications
                    </p>
                  )}
                </div>
              </div>

              {unreadCount > 0 && (
                <ButtonLowercase
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all shadow-sm h-8 text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Mark all as read
                </ButtonLowercase>
              )}
            </div>
          </div>

          {/* Filters - Compact */}
          <NotificationFilters
            search={filters.search}
            onSearchChange={(value) => handleFilterChange('search', value)}
            type={filters.type}
            onTypeChange={(value) => handleFilterChange('type', value)}
            dateFrom={filters.dateFrom}
            onDateFromChange={(value) => handleFilterChange('dateFrom', value)}
            dateTo={filters.dateTo}
            onDateToChange={(value) => handleFilterChange('dateTo', value)}
          />

          {/* Results Count - Compact */}
          {hasFilters && (
            <div className="flex items-center gap-2 px-2">
              <Search className="w-3.5 h-3.5 text-orange-500" />
              <p className="text-xs text-gray-700 font-medium">
                Found{' '}
                <span className="text-orange-600 font-bold">{filteredNotifications.length}</span>{' '}
                notifications
              </p>
            </div>
          )}

          {/* List - Compact spacing */}
          {paginatedNotifications.length > 0 ? (
            <div className="space-y-2">
              {paginatedNotifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
              <EmptyState
                icon={Bell}
                message={hasFilters ? 'No notifications match the filters' : 'No notifications yet'}
              />
            </div>
          )}

          {/* Pagination - Compact */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-2">
              <ButtonLowercase
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="disabled:opacity-50 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all h-8 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Before
              </ButtonLowercase>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-medium text-xs transition-all ${currentPage === pageNum
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-300'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <ButtonLowercase
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="disabled:opacity-50 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all h-8 text-xs"
              >
                After
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </ButtonLowercase>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={cancelDelete}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Confirmation</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this notification?
              <br />
              This action cannot be undone.
            </p>

            <div className="flex gap-3 pt-4 border-t">
              <ButtonLowercase variant="outline" onClick={cancelDelete} className="flex-1 h-10">
                Cancel
              </ButtonLowercase>
              <ButtonLowercase
                onClick={confirmDelete}
                className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </ButtonLowercase>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
