import { Edit2 } from 'lucide-react';

import type { WorkExperience } from '@/features/job-seeker/components/profile/types/profile.types.tsx';

interface WorkExperienceCardProps {
  experience: WorkExperience;
  onEdit?: () => void;
}

export function WorkExperienceCard({ experience, onEdit }: WorkExperienceCardProps) {
  const formatDateRange = (start: string | Date, end: string | Date | null | undefined, isCurrent: boolean) => {
    if (!start) return 'No date set';
    const startDate = new Date(start).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    const endDate =
      end && !isCurrent
        ? new Date(end).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })
        : 'Present';
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="group rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground">
            {experience.title || 'Untitled Position'}
          </h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {experience.company || 'Company not specified'}
          </p>
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            {formatDateRange(experience.startDate, experience.endDate, experience.isCurrent)}
          </p>
          {experience.description && (
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              {experience.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {experience.isCurrent ? (
            <span className="inline-flex items-center justify-center px-4 pb-2 py-1 text-2xs leading-none font-semibold text-green-800 bg-green-100 rounded-full">
              Current
            </span>
          ) : (
            <span className="inline-flex items-center justify-center px-4   py-2 text-2xs leading-none font-semibold text-red-800 bg-red-100 rounded-full">
              Old
            </span>
          )}
          {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20"
            aria-label="Edit work experience"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          )}
        </div>
      </div>
    </div>
  );
}
