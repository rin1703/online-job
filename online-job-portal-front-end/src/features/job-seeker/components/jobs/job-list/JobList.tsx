'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

import JobCard from '@/features/job-seeker/components/jobs/job-list/JobCard.tsx';
import type { Job } from '@/features/job-seeker/components/jobs/types/job.types.tsx';

interface JobListProps {

  jobs: Job[];

  onSelectJob: (job: Job) => void;

  onSaveToggle?: (jobId: string, e: React.MouseEvent) => void;

}



export default function JobList({ jobs, onSelectJob, onSaveToggle }: JobListProps) {

  if (jobs.length === 0) {

    return (

      <div className="bg-card rounded-lg border border-border p-12 text-center">

        <AlertCircle size={40} className="mx-auto mb-3 text-accent opacity-50" />

        <p className="text-muted-foreground text-lg">Không tìm thấy công việc nào phù hợp</p>

      </div>

    );

  }



  return (

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {jobs.map((job) => (

        <JobCard

          key={job.id}

          job={job}

          onClick={() => onSelectJob(job)}

          isSaved={job.isFavorite}

          onSaveToggle={(e) => onSaveToggle?.(job.id, e)}

          useUniformHeight={true}

        />

      ))}

    </div>

  );

}
