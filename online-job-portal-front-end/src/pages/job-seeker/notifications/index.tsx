import { useEffect } from 'react';
import { NotificationPageLayout } from '@/features/notification/components/NotificationPageLayout';
import { NotificationPageContent } from '@/features/notification/components/NotificationPageContent';

export default function JobSeekerNotificationsPage() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <NotificationPageLayout variant="jobseeker">
      <NotificationPageContent maxWidth="max-w-7xl" />
    </NotificationPageLayout>
  );
}
