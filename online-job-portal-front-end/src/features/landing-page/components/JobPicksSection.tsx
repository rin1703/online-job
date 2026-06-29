import JobCard from "@/components/shared/jobCard";
import { useGetJobListingSummariesQuery } from "@/features/jobs/api/job.service";
import { Button } from "@/components/ui/Btn";

interface JobPicksSectionProps {
  limit?: number;
  onJobClick?: (jobId: string) => void;
  onLoadMore?: () => void;
}

const JobPicksSection = ({ limit = 4, onJobClick, onLoadMore }: JobPicksSectionProps) => {
  const { data: jobSummaries = [], isLoading, error } = useGetJobListingSummariesQuery();

  return (
    <section id="jobs" className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-primary text-center mb-12">Job picks for you</h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 mt-4">Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load jobs. Please try again later.</p>
          </div>
        ) : jobSummaries.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {jobSummaries.slice(0, limit).map((job) => (
                <JobCard key={job.id} job={job} onJobClick={onJobClick} />
              ))}
            </div>

            {onLoadMore && (
              <div className="text-center">
                <Button variant="outlineOrange" className="px-8" onClick={onLoadMore}>
                  More Opportunities
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No jobs available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobPicksSection;
