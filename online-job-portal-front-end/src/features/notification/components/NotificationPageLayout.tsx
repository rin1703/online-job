import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface NotificationPageLayoutProps {
  children: ReactNode;
  variant?: 'jobseeker' | 'recruiter';
}

export function NotificationPageLayout({
  children,
  variant = 'recruiter',
}: NotificationPageLayoutProps) {
  const isJobSeeker = variant === 'jobseeker';

  return (
    <div className={cn('min-h-screen', !isJobSeeker && 'bg-white')}>
      {/* Gradient background - only for job seeker */}
      {isJobSeeker && (
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,#F97A00_40%,#FFFFFF_40%)]"
        />
      )}

      {/* Content with variant-specific padding */}
      <div className={cn(isJobSeeker && 'pt-32')}>{children}</div>
    </div>
  );
}
