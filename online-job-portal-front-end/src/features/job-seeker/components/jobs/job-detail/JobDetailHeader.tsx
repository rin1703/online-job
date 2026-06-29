import type { Job } from '@/features/job-seeker/components/jobs/types/job.types.tsx';

interface JobDetailHeaderProps {
  job: Job;
}

const formatSalary = (salary: number) => {
  return (salary / 1000000).toFixed(0);
};

const getSalaryString = (salary: Job['salary']) => {
  if (typeof salary === 'object' && salary !== null) {
    return `${formatSalary(salary.min)}M - ${formatSalary(salary.max)}M`;
  }
  return salary;
};

export default function JobDetailHeader({ job }: JobDetailHeaderProps) {
  // Safely extract company name - handle both string and object types
  const companyName = typeof job.company === 'string'
    ? job.company
    : (job.company as any)?.name || 'Unknown Company';

  // Safely extract location - handle both string and object types
  const locationString = typeof job.location === 'string'
    ? job.location
    : (job.location as any)?.address
      ? `${(job.location as any).address}, ${(job.location as any).district}, ${(job.location as any).city}`
      : 'Unknown Location';

  return (
    <div className="bg-gradient-to-r from-orange-50 to-green-50 border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-wrap">{job.title}</h2>
          <p className="text-gray-600 font-medium text-lg text-wrap">{companyName}</p>
        </div>
      </div>

      {/* Basic Info Grid */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Salary</p>
          <p className="text-xl font-bold text-green-600">{getSalaryString(job.salary)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Location</p>
          <p className="text-base font-bold text-gray-800">{locationString}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Experience</p>
          <p className="text-base font-bold text-gray-800">{job.experience}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Application Deadline</p>
          <p className="text-base font-bold text-gray-800">December 31, 2024</p>
        </div>
      </div>
    </div>
  );
}
