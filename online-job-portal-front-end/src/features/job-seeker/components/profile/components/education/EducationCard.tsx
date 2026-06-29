import { Edit2 } from 'lucide-react';

import type { Education } from '@/features/job-seeker/components/profile/types/profile.types.tsx';

interface EducationCardProps {
  education: Education;
  onEdit?: () => void;
}

export function EducationCard({ education, onEdit }: EducationCardProps) {
  const formatDateRange = (start: string | Date, end: string | Date | undefined) => {
    if (!start) return 'No date set';
    const startDate = new Date(start).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    const endDate = end ? new Date(end).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }) : 'Present';
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="group rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground">
            {education.degree || 'Untitled Degree'} at {education.school || 'Unknown Institution'}
          </h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {formatDateRange(education.startDate, education.endDate)}
          </p>
          {education.description && (
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              {education.description}
            </p>
          )}
        </div>
        {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="ml-4 rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20"
          aria-label="Edit education entry"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        )}
      </div>
    </div>
  );
}
