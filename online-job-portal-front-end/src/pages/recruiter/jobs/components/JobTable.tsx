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
import JobTableRow from "./JobTableRow";
import TablePagination from "./TablePagination";

interface JobTableProps {
  posts: RecruiterJobPosting[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  filteredCount: number;
  onPageChange: (page: number) => void;
  onViewDetails: (jobId: string) => void;
  onChangeStatus: (id: string, status: "active" | "hidden" | "closed" | "draft") => void;
  onOpenStatusDialog: (id: string, status: "active" | "closed") => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  isApproved: boolean;
}

export default function JobTable({
  posts,
  isLoading,
  currentPage,
  totalPages,
  itemsPerPage,
  filteredCount,
  onPageChange,
  onViewDetails,
  onChangeStatus,
  onOpenStatusDialog,
  onDelete,
  onEdit,
  isApproved,
}: JobTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-stroke">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="pl-6">Job Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Compensation</TableHead>
            <TableHead>Info</TableHead>
            <TableHead className="text-center">Actions</TableHead>
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
              <JobTableRow
                key={post.id}
                post={post}
                onViewDetails={onViewDetails}
                onChangeStatus={onChangeStatus}
                onOpenStatusDialog={onOpenStatusDialog}
                onDelete={onDelete}
                onEdit={onEdit}
                isApproved={isApproved}
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
