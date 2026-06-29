import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import type { Job } from '@/features/job-seeker/components/jobs/types/job.types.tsx';
import { PAGINATION, UI_DIMENSIONS } from '@/features/job-seeker/constants/jobseeker.constants';
import { Badge } from '@/components/ui/badge';
import { ButtonLowercase } from '@/components/ui/button-lowercase';

interface SimilarJobsProps {
  similarJobs: Job[];
}

interface SimilarJobCardProps {
  job: any;
  onSaveToggle?: (jobId: string) => void;
  isSaved?: boolean;
}

function SimilarJobCard({ job, onSaveToggle, isSaved }: SimilarJobCardProps) {
  const companyName = typeof job.company === 'string'
    ? job.company
    : (job.company as any)?.name || job.companyName || 'Unknown';

  const city = job.city || (job.location as any)?.city || 'Unknown City';

  const formatSalary = (salary: number) => {
    return (salary / 1000000).toFixed(0);
  };

  const salaryDisplay = job.salary && typeof job.salary === 'object'
    ? `${formatSalary(job.salary.min)}M - ${formatSalary(job.salary.max)}M`
    : job.salaryMin && job.salaryMax
      ? `${formatSalary(job.salaryMin)}M - ${formatSalary(job.salaryMax)}M`
      : '';

  return (
    <Link to={`/job/${job.id}`}>
      <div className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer">
        {/* Company and Save Button */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm line-clamp-2 text-gray-900">
              {job.title}
            </h4>
            <p className="text-xs text-gray-600 truncate mt-0.5">{companyName}</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSaveToggle?.(job.id);
            }}
            className="flex-shrink-0 p-1"
          >
            <Bookmark
              size={16}
              className={isSaved ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}
            />
          </button>
        </div>

        {/* Location and Experience */}
        <div className="flex gap-2 mb-2 text-xs text-gray-600">
          <span className="truncate">{city}</span>
          {job.experience || job.experienceLevel ? (
            <span>•</span>
          ) : null}
          <span className="truncate">{job.experience || job.experienceLevel}</span>
        </div>

        {/* Salary */}
        {salaryDisplay && (
          <div className="text-xs font-medium text-green-600 mb-2">
            {salaryDisplay}
          </div>
        )}

        {/* Benefits Tags */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {job.benefits.slice(0, 2).map((benefit: string, idx: number) => (
              <Badge key={idx} variant="orange" className="text-xs px-2 py-0.5 truncate max-w-[100px]">
                {benefit}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function SimilarJobs({ similarJobs }: SimilarJobsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm sticky top-28">
      <h3 className="font-bold text-gray-800 mb-3 text-base">Related Jobs</h3>
      <div
        className="space-y-2 overflow-y-auto"
        style={{ maxHeight: UI_DIMENSIONS.SIMILAR_JOBS_MAX_HEIGHT }}
      >
        {similarJobs.length > 0 ? (
          <>
            {similarJobs
              .slice(0, PAGINATION.SIMILAR_JOBS_LIMIT)
              .map((job) => (
                <SimilarJobCard
                  key={job.id}
                  job={job}
                />
              ))}
            {similarJobs.length > PAGINATION.SIMILAR_JOBS_LIMIT && (
              <p className="text-xs text-gray-500 text-center py-2">
                Showing {PAGINATION.SIMILAR_JOBS_LIMIT} of {similarJobs.length} related jobs
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No related jobs available</p>
            <p className="text-xs text-gray-400 mt-2">Check back soon for similar positions</p>
          </div>
        )}
      </div>
    </div>
  );
}
