'use client';

import type React from 'react';

import type { Job } from '@/features/job-seeker/components/jobs/types/job.types.tsx';

import JobCard from './JobCard.tsx';

interface JobGridProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onQuickView: (job: Job) => void;
  onSaveToggle?: (jobId: string, e: React.MouseEvent) => void;
}

export default function JobGrid({
  jobs,
  onSelectJob,
  onQuickView,
  onSaveToggle,
}: JobGridProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-12 text-center">
        <p className="text-muted-foreground text-lg">Can not find any job</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map((job) => (
        <div key={job.id} className="h-full">
          <JobCard
            job={job}
            onClick={() => onSelectJob(job)}
            onQuickView={() => onQuickView(job)}
            isSaved={job.isFavorite}
            onSaveToggle={(e) => onSaveToggle?.(job.id, e)}
            useUniformHeight={true}
          />
        </div>
      ))}
    </div>
  );
}
