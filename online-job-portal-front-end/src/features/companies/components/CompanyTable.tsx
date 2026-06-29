import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Btn";
import { MoreHorizontal, Globe, Mail, Calendar, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // Import thêm Tooltip
import CompanyStatusBadge from "./CompanyStatusBadge";
import TablePagination from "@/pages/recruiter/jobs/components/TablePagination";
import type { Company } from "../api/company.type";
import { getInitials } from "../lib/ultils";

interface CompanyTableProps {
  companies: Company[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  filteredCount: number;
  onPageChange: (page: number) => void;
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
  // Thêm prop này để nhận hàm xử lý từ cha
  onStatusChange: (id: string, status: "verified" | "rejected" | "pending") => void;
}

export default function CompanyTable({
  companies,
  isLoading,
  currentPage,
  totalPages,
  itemsPerPage,
  filteredCount,
  onPageChange,
  onViewDetails,
  onDelete,
  onStatusChange, // Destructure prop
}: CompanyTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-stroke">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="pl-6">Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Details</TableHead>
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
          ) : companies.length > 0 ? (
            companies.map((company) => {
              // Fallback logo
              const logoSrc = `https://ui-avatars.com/api/?name=${getInitials(company.name)}&background=random&color=fff&size=128`;

              return (
                <TableRow key={company._id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={logoSrc}
                          alt={company.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p
                          className="font-semibold text-gray-900 w-50 text-wrap truncate max-w-[200px]"
                          title={company.name}
                        >
                          {company.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* --- PHẦN SỬA STATUS (GIỐNG JOB TABLE) --- */}
                  <TableCell>
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer inline-block">
                              <CompanyStatusBadge status={company.verificationStatus} />
                            </div>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to change status</p>
                        </TooltipContent>
                      </Tooltip>

                      <DropdownMenuContent align="start" className="w-40">
                        {["verified", "pending", "rejected"].map((statusOption) => (
                          <DropdownMenuItem
                            key={statusOption}
                            onClick={() => onStatusChange(company._id, statusOption as any)}
                          >
                            <CompanyStatusBadge
                              status={statusOption}
                              className="w-full cursor-pointer"
                            />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {company.website && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Globe className="w-3 h-3" />
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline truncate max-w-[150px]"
                          >
                            {company.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                      {company.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{company.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Users className="w-3 h-3" /> {company.employeeCount || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" /> {company.foundedYear || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="default">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(company._id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDelete(company._id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                No companies found.
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
