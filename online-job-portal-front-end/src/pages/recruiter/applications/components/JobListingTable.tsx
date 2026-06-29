import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { RecruiterJobPosting } from "@/features/jobs/api/job.type";
import JobListingRow from "./JobListingRow.tsx";
import TablePagination from "@/pages/recruiter/jobs/components/TablePagination";

interface JobListingTableProps {
  posts: RecruiterJobPosting[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  filteredCount: number;
  onPageChange: (page: number) => void;
  onJobClick: (jobId: string, jobTitle: string) => void;
}

export default function JobListingTable({
  posts,
  isLoading,
  currentPage,
  totalPages,
  itemsPerPage,
  filteredCount,
  onPageChange,
  onJobClick,
}: JobListingTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-stroke">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="pl-6">Job Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Compensation</TableHead>
            <TableHead>Info</TableHead>
            <TableHead>Total Applications</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <LoadingSpinner /> Loading...
              </TableCell>
            </TableRow>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <JobListingRow
                key={post.id}
                post={post}
                onJobClick={onJobClick}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                No jobs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="p-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing {(currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, filteredCount)} of {filteredCount}
        </p>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
