import { Calendar, Eye } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import type { RecruiterJobPosting } from "@/features/jobs/api/job.type";
import JobStatusBadge from "@/pages/recruiter/jobs/components/JobStatusBadge";
import { formatCurrency, formatDate } from "@/pages/recruiter/jobs/utils/formatters";

interface JobListingRowProps {
  post: RecruiterJobPosting;
  onJobClick: (jobId: string, jobTitle: string) => void;
}

export default function JobListingRow({
  post,
  onJobClick,
}: JobListingRowProps) {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onJobClick(post.id, post.title)}
    >
      <TableCell>
        <p className="font-semibold pl-4">{post.title}</p>
        <p className="text-xs text-gray-600 pl-4">{post.experienceLevel}</p>
      </TableCell>

      <TableCell>
        <JobStatusBadge status={post.status} />
      </TableCell>

      <TableCell>
        {formatCurrency(post.salaryMin)} - {formatCurrency(post.salaryMax)}
      </TableCell>

      <TableCell>
        <div className="text-xs text-gray-600 flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          {formatDate(post.createdAt)}
        </div>
        <div className="text-xs text-gray-600 flex items-center gap-2">
          <Eye className="w-3 h-3" />
          {post.views} views
        </div>
      </TableCell>

      <TableCell>
        <div className="text-sm font-semibold text-gray-900">
          {post.totalApplications || 0}
        </div>
        <div className="text-xs text-gray-500">applications</div>
      </TableCell>
    </TableRow>
  );
}
