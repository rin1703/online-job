import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { CompanyDetailDialog } from "@/features/companies/components/CompanyDetailDialog";

import {
  CompanyFilters,
  type UICompanyFilters,
} from "@/features/companies/components/CompanyFilters";

import {
  useGetFilteredCompaniesQuery,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} from "@/features/companies/api/companies.service";

import CompanyTable from "@/features/companies/components/CompanyTable";
import type { FilterCompaniesParams, Company } from "@/features/companies/api/company.type";

export default function CompanyManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Delete State ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  // --- Status Update State ---
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    id: string;
    status: "verified" | "rejected" | "pending";
  } | null>(null);

  // --- View Details State ---
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [apiFilters, setApiFilters] = useState<Partial<FilterCompaniesParams>>({});

  // --- API Queries ---
  const { data: responseData, isLoading } = useGetFilteredCompaniesQuery({
    page: currentPage,
    limit: itemsPerPage,
    verificationStatus: activeTab === "all" ? undefined : activeTab,
    ...apiFilters,
  });

  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
  const [deleteCompany] = useDeleteCompanyMutation();

  const companies = responseData?.data || [];
  const totalRecords = responseData?.pagination?.total || 0;
  const totalPages = responseData?.pagination?.totalPages || 0;

  const handleFilterChange = useCallback((uiFilters: UICompanyFilters) => {
    const newParams: Partial<FilterCompaniesParams> = {
      name: uiFilters.search,
      industry: uiFilters.industry,
      employeeCount: uiFilters.employeeCount,
    };

    if (uiFilters.foundedYear) {
      if (uiFilters.foundedYear === "2020+") {
        newParams.foundedYearFrom = 2020;
      } else if (uiFilters.foundedYear === "2015-2020") {
        newParams.foundedYearFrom = 2015;
        newParams.foundedYearTo = 2020;
      } else if (uiFilters.foundedYear === "before-2010") {
        newParams.foundedYearTo = 2010;
      }
    }

    if (uiFilters.sortBy === "name") newParams.sort = "asc";
    else if (uiFilters.sortBy === "newest") newParams.sort = "desc";
    else if (uiFilters.sortBy === "oldest") newParams.sort = "asc";
    else newParams.sort = "desc";

    setApiFilters(newParams);
    setCurrentPage(1);
  }, []);

  // --- Handle Status Logic ---
  const handleStatusChangeRequest = (id: string, status: "verified" | "rejected" | "pending") => {
    setPendingStatusUpdate({ id, status });
    setStatusConfirmOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;
    try {
      await updateCompany({
        _id: pendingStatusUpdate.id,
        verificationStatus: pendingStatusUpdate.status,
      }).unwrap();
      toast.success(`Company status updated to ${pendingStatusUpdate.status}`);
      setStatusConfirmOpen(false);
      setPendingStatusUpdate(null);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  // --- Handle Delete Logic ---
  const handleDelete = async () => {
    if (!companyToDelete) return;
    try {
      await deleteCompany(companyToDelete).unwrap();
      toast.success("Company deleted successfully!");
      setDeleteModalOpen(false);
      setCompanyToDelete(null);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete company");
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedCompanyId(id);
    setViewDetailsOpen(true);
  };

  return (
    <div className="w-full max-w-full pl-10">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setCurrentPage(1);
        }}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Companies</TabsTrigger>
          <TabsTrigger value="verified" className="flex items-center gap-2">
            Verified
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {
                (responseData?.data || []).filter(
                  (c: Company) => c.verificationStatus === "verified",
                ).length
              }
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              {
                (responseData?.data || []).filter(
                  (c: Company) => c.verificationStatus === "pending",
                ).length
              }
            </span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            Rejected
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {
                (responseData?.data || []).filter(
                  (c: Company) => c.verificationStatus === "rejected",
                ).length
              }
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="flex justify-between items-center gap-6 mt-4 mb-6">
          <CompanyFilters onFilterChange={handleFilterChange} className="mb-0" />
          <div className="flex justify-end mt-2 text-sm text-muted-foreground whitespace-nowrap">
            {totalRecords > 0
              ? `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalRecords)} of ${totalRecords}`
              : "No results"}
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <CompanyTable
            companies={companies}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            filteredCount={totalRecords}
            onPageChange={setCurrentPage}
            onViewDetails={handleViewDetails}
            onDelete={(id) => {
              setCompanyToDelete(id);
              setDeleteModalOpen(true);
            }}
            onStatusChange={handleStatusChangeRequest}
          />
        </TabsContent>
      </Tabs>

      <CompanyDetailDialog
        companyId={selectedCompanyId}
        open={viewDetailsOpen}
        onOpenChange={(open) => {
          setViewDetailsOpen(open);
          if (!open) setSelectedCompanyId(null);
        }}
      />

      <ConfirmDialog
        open={deleteModalOpen}
        title="Delete Company"
        description="Are you sure you want to delete this company? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <ConfirmDialog
        open={statusConfirmOpen}
        title="Update Status"
        description={`Are you sure you want to change this company's status to "${pendingStatusUpdate?.status}"?`}
        confirmText="Update"
        cancelText="Cancel"
        confirmVariant="default"
        loading={isUpdating}
        onConfirm={handleConfirmStatusUpdate}
        onCancel={() => {
          setStatusConfirmOpen(false);
          setPendingStatusUpdate(null);
        }}
      />
    </div>
  );
}
