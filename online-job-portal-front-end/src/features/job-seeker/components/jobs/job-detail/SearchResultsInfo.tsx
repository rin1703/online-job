'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';

import type { Job } from '@/features/job-seeker/components/jobs/types/job.types.tsx';

interface SearchResultsInfoProps {
  jobs: Job[];
  searchTerm: string;
  activeFilterCount: number;
}

export default function SearchResultsInfo({
  jobs,
  searchTerm,
  activeFilterCount,
}: SearchResultsInfoProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-card border-2 border-border rounded-lg p-8 text-center">
        <AlertCircle size={48} className="mx-auto mb-3 text-accent opacity-50" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
        <p className="text-muted-foreground mb-4">
          {searchTerm
            ? `No jobs found for "${searchTerm}"`
            : 'Try searching with a different keyword'}
        </p>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>💡 Tips:</p>
          <ul className="space-y-0.5">
            <li>• Check your spelling</li>
            <li>• Try a more general keyword</li>
            {activeFilterCount > 0 && <li>• Try removing some filters</li>}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-secondary/50 to-secondary/30 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
      <CheckCircle size={20} className="text-primary flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{jobs.length}</span> jobs{' '}
          {searchTerm ? `found for "${searchTerm}"` : ''}
          {activeFilterCount > 0 && ` - ${activeFilterCount} filters applied`}
        </p>
      </div>
    </div>
  );
}
