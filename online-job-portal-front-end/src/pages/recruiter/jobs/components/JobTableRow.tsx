import { MoreHorizontal, Calendar, Eye, Lock } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/Btn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { RecruiterJobPosting } from "@/features/jobs/api/job.type";
import JobStatusBadge from "./JobStatusBadge";
import { formatCurrency, formatDate } from "../utils/formatters";

interface JobTableRowProps {
  post: RecruiterJobPosting;
  onViewDetails: (jobId: string) => void;
  onChangeStatus: (id: string, status: "active" | "hidden" | "closed" | "draft") => void;
  onOpenStatusDialog: (id: string, status: "active" | "closed") => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  isApproved: boolean;
}

export default function JobTableRow({
  post,
  onEdit,
  onViewDetails,
  onChangeStatus,
  onOpenStatusDialog,
  onDelete,
  isApproved,
}: JobTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <p className="font-semibold pl-4">{post.title}</p>
        <p className="text-xs text-gray-600 pl-4">{post.experienceLevel}</p>
      </TableCell>

      <TableCell>
        {isApproved ? (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer">
                    <JobStatusBadge status={post.status} />
                  </div>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to change status</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-40">
              {["draft", "hidden"].map((statusOption) => (
                <DropdownMenuItem
                  key={statusOption}
                  onClick={() => onChangeStatus(post.id, statusOption as any)}
                >
                  <JobStatusBadge status={statusOption} className="w-full" />
                </DropdownMenuItem>
              ))}
              {["active", "closed"].map((statusOption) => (
                <DropdownMenuItem
                  key={statusOption}
                  onClick={() => onOpenStatusDialog(post.id, statusOption as any)}
                >
                  <JobStatusBadge status={statusOption} className="w-full" />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <JobStatusBadge status={post.status} />
                <Lock className="w-3 h-3 text-gray-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Only approved jobs can change status</p>
            </TooltipContent>
          </Tooltip>
        )}
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

      <TableCell className="flex items-center justify-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(post.id)}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(post.id)}>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(post.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
