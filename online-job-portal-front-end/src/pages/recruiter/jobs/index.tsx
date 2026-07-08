import { useState, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Btn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useChangeJobStatusMutation,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useGetRecruiterJobDetailQuery,
  useGetJobForEditQuery,
  useGetRecruiterJobsFilterQuery,
} from "@/features/jobs/api/job.service";
import type { JobFormValues } from "@/features/jobs/job.schema";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import JobTable from "./components/JobTable";
import JobDetailsDialog from "./components/JobDetailsDialog";
import JobForm from "@/features/jobs/components/RefactorJobForm";

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

export default function JobManagementPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [jobToUpdate, setJobToUpdate] = useState<{
    id: string;
    status: "active" | "closed";
  } | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("approved");
  const [pageInput, setPageInput] = useState("1");

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

  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const [deleteJob] = useDeleteJobMutation();
  const [changeJobStatus] = useChangeJobStatusMutation();

  const { data: detailJob, isLoading: isDetailLoading } = useGetRecruiterJobDetailQuery(
    selectedJobId || "",
    { skip: !selectedJobId },
  );

  const { data: editJobData, isLoading: isEditJobLoading } = useGetJobForEditQuery(
    jobToEdit || "",
    { skip: !jobToEdit },
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setPageInput("1");
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setCurrentPage(1);
    setPageInput("1");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    setPageInput("1");
    setSearchTerm("");
    setSelectedFilter("all");
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput(page.toString());
    }
  };

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
    const pageNum = parseInt(value);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handleLimitChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
    setPageInput("1");
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedFilter("all");
    setCurrentPage(1);
    setPageInput("1");
  };

  const hasActiveFilters = searchTerm !== "" || selectedFilter !== "all";

  const handleCreateJobSubmit = (data: JobFormValues) => {
    createJob(data)
      .unwrap()
      .then(() => {
        toast.success("Job created successfully!");
        setIsCreateModalOpen(false);
      })
      .catch((err: any) => toast.error(err?.data?.message || "Failed to create job"));
  };

  const handleUpdateJobSubmit = (data: JobFormValues) => {
    if (!jobToEdit) return;

    updateJob({ id: jobToEdit, data })
      .unwrap()
      .then(() => {
        toast.success("Job updated successfully!");
        setIsEditModalOpen(false);
        setJobToEdit(null);
      })
      .catch((err: any) => toast.error(err?.data?.message || "Failed to update job"));
  };

  const handleEditJob = (jobId: string) => {
    setJobToEdit(jobId);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setJobToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteJob = () => {
    if (!jobToDelete) return;

    deleteJob(jobToDelete)
      .unwrap()
      .then(() => {
        toast.success("Job deleted successfully!");
        setDeleteModalOpen(false);
        setJobToDelete(null);
      })
      .catch((err: any) => toast.error(err?.data?.message || "Failed to delete job"));
  };

  const handleChangeStatus = (id: string, status: "active" | "hidden" | "closed" | "draft") => {
    changeJobStatus({ id, data: { status } })
      .unwrap()
      .then(() => toast.success(`Status changed to "${status}"`))
      .catch((err: any) => toast.error(err?.data?.message || "Failed to update status"));
  };

  const openStatusDialog = (id: string, status: "active" | "closed") => {
    setJobToUpdate({ id, status });
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!jobToUpdate) return;
    handleChangeStatus(jobToUpdate.id, jobToUpdate.status);
    setStatusDialogOpen(false);
    setJobToUpdate(null);
  };

  const handleViewDetails = (jobId: string) => {
    setSelectedJobId(jobId);
    setViewDetailsOpen(true);
  };

  const handleCloseViewDetails = () => {
    setViewDetailsOpen(false);
    setSelectedJobId(null);
  };

  return (
    <div className="w-full max-w-full pl-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Management</h1>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button variant="default" startIcon={<Plus size={18} />}>
              Create new job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle>Create New Job Posting</DialogTitle>
            </DialogHeader>
            <div className="px-2 pb-6">
              <JobForm onSubmit={handleCreateJobSubmit} isSubmitting={isCreating} mode="create" />
            </div>
          </DialogContent>
        </Dialog>
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
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-8"
              />
            </div>

            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllFilters}
                className="whitespace-nowrap"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}

            <div className="h-8 w-px bg-border" />

            <div className="flex items-center gap-2">
              <Label htmlFor="page-input" className="text-sm font-medium whitespace-nowrap">
                Page:
              </Label>
              <Input
                id="page-input"
                type="number"
                min="1"
                max={totalPages}
                value={pageInput}
                onChange={(e) => handlePageInputChange(e.target.value)}
                className="w-16 h-9"
              />
              <span className="text-sm text-muted-foreground">/ {totalPages}</span>
            </div>

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

          <JobTable
            posts={paginatedJobs}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            filteredCount={totalRecords}
            onPageChange={handlePageChange}
            onViewDetails={handleViewDetails}
            onEdit={handleEditJob}
            onChangeStatus={handleChangeStatus}
            onOpenStatusDialog={openStatusDialog}
            onDelete={openDeleteModal}
            isApproved={activeTab === "approved"}
          />
        </TabsContent>
      </Tabs>

      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setJobToEdit(null);
        }}
      >
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Edit Job Posting</DialogTitle>
          </DialogHeader>
          <div className="px-2 pb-6">
            {isEditJobLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : editJobData ? (
              <JobForm
                onSubmit={handleUpdateJobSubmit}
                isSubmitting={isUpdating}
                initialData={editJobData}
                mode="update"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <JobDetailsDialog
        open={viewDetailsOpen}
        job={detailJob}
        isLoading={isDetailLoading}
        onClose={handleCloseViewDetails}
      />

      <ConfirmDialog
        open={statusDialogOpen}
        title="Change Job Status"
        description={`Are you sure you want to change status to "${jobToUpdate?.status}"?`}
        confirmText="Yes, change"
        cancelText="Cancel"
        confirmVariant="destructive"
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteModalOpen}
        title="Delete Job"
        description="Are you sure you want to delete this job? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        onConfirm={handleDeleteJob}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
