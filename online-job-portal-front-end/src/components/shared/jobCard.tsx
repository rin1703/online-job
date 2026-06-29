import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Btn";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons/icons";
import type { JobListingSummary } from "../../features/jobs/api/job.type";
import { useFavoriteJobs } from "@/features/job-seeker/api/useFavoriteJobs";
import { ButtonLowercase } from "@/components/ui/button-lowercase.tsx";

interface JobCardProps {
  job: JobListingSummary;
  onJobClick?: (jobId: string) => void;
}

const JobCard = ({ job, onJobClick }: JobCardProps) => {
  // Use favorite jobs hook
  const { isFavorite, toggleFavorite } = useFavoriteJobs();
  const isSaved = isFavorite(job.id);

  const handleJobDetails = () => {
    if (onJobClick) {
      onJobClick(job.id);
    }
    // If no callback provided, Link component will handle navigation
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    await toggleFavorite(job.id);
  };

  const formatSalary = () => {
    if (job.salaryMin && job.salaryMax) {
      return `${job.salaryMin}-${job.salaryMax} USD`;
    } else if (job.salaryMin) {
      return `From ${job.salaryMin}`;
    } else if (job.salaryMax) {
      return `Up to ${job.salaryMax} USD`;
    }
    return "Negotiable";
  };

  return (
    <Card className="overflow-visible shadow-lg transition-all duration-300 group hover:shadow-xl">
      <CardContent className="bg-white rounded-lg">
        <div className="flex items-start justify-between  mb-4">
          <Link to={`/job/${job.id}`} className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={
                job.logo ||
                "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop"
              }
              alt={job.companyName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-bold text-xl hover:text-primary transition">{job.title}</h3>
              <p className="text-foreground-secondary text-base font-normal">{job.companyName}</p>
            </div>
          </Link>
          <ButtonLowercase
            variant={isSaved ? "orange" : "outline"}
            className="w-10 h-10 p-0 transition-colors"
            onClick={handleToggleSave}
          >
            <Icons.bookmark className={isSaved ? "fill-current" : ""} />
          </ButtonLowercase>
        </div>

        <div className="space-y-3 my-4 min-h-25">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-base text-gray-700">
              <div>
                <Icons.building2 className="size-6" />
              </div>
              <span>{job.companyName}</span>
            </div>
            <div className="flex items-center gap-2 text-base text-gray-700">
              <div>
                <Icons.mapPin className="size-6 font-700" />
              </div>
              <span>{job.city}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-base text-gray-700">
              <div>
                <Icons.briefcase className={"size-6 font-700"} />
              </div>
              <span>{job.experienceLevel}</span>
            </div>
            <div className="flex items-center gap-2 text-base text-gray-700">
              <Icons.circleDollarSign className="size-6 font-700" />
              <span>{formatSalary()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="orange">{job.experienceLevel}</Badge>
          {job.city && <Badge variant="orange">{job.city}</Badge>}
        </div>
        <div className="h-[1px] bg-stroke mb-4"></div>

        <div className="flex items-center justify-end">
          <Link to={`/job/${job.id}`}>
            <Button variant="default" onClick={handleJobDetails}>
              Job Details &gt;
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
