import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetRecruiterJobsFilterQuery } from "@/features/jobs/api/job.service";
import JobListingTable from "./components/JobListingTable";

const filterOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "hidden", label: "Hidden" },
  { value: "closed", label: "Closed" },
];

const limitOptions = [
  { value: "5", label: "5 per page" },
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
];

export default function JobListingForApplications() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState<string>("approved");

  const shouldFilter = searchTerm !== "" || selectedFilter !== "all";

  const { data: filterData, isLoading } = useGetRecruiterJobsFilterQuery({
    page: 1,
    limit: 100,
    keyword: shouldFilter && searchTerm ? searchTerm : undefined,
    status: shouldFilter && selectedFilter !== "all" ? selectedFilter : undefined,
  });

  const filteredJobsByApprovalStatus = useMemo(() => {
    const allJobs = filterData?.data || [];
    return allJobs.filter((job: any) => {
      if (activeTab === "approved") return job.approvalStatus === "approved";
      if (activeTab === "pending") return job.approvalStatus === "pending";
      if (activeTab === "rejected") return job.approvalStatus === "rejected";
      return true;
    });
  }, [filterData?.data, activeTab]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredJobsByApprovalStatus.slice(startIndex, endIndex);
  }, [filteredJobsByApprovalStatus, currentPage, itemsPerPage]);

  const totalRecords = filteredJobsByApprovalStatus.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  };

  const handleLimitChange = (value: string) => {
    setItemsPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ✅ Navigate to applications of selected job
  const handleJobClick = (jobId: string, jobTitle: string) => {
    navigate(`/recruiter/applications/jobs/${jobId}`, {
      state: { jobTitle }
    });
  };

  return (
    <div className="w-full max-w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Applications by Job</h1>
        <p className="text-gray-600 mt-1">Select a job to view its applications</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="approved" className="flex items-center gap-2">
            Approved
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {
                (filterData?.data || []).filter(
                  (j: any) => j.approvalStatus === "approved" && !j.isDeleted,
                ).length
              }
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              {
                (filterData?.data || []).filter(
                  (j: any) => j.approvalStatus === "pending" && !j.isDeleted,
                ).length
              }
            </span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            Rejected
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {
                (filterData?.data || []).filter(
                  (j: any) => j.approvalStatus === "rejected" && !j.isDeleted,
                ).length
              }
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Input
                type="text"
                placeholder="Search by post title..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="h-9"
              />
            </div>

            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Select value={itemsPerPage.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
              {paginatedJobs.length > 0 ? (
                <>
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords}
                </>
              ) : (
                "No results"
              )}
            </div>
          </div>

          <JobListingTable
            posts={paginatedJobs}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            filteredCount={totalRecords}
            onPageChange={handlePageChange}
            onJobClick={handleJobClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
