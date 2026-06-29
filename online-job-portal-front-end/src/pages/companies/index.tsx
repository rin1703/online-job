import { useState, useCallback } from "react";
import { Building2, AlertCircle } from "lucide-react";
import {
  CompanyFilters,
  type UICompanyFilters,
} from "@/features/companies/components/CompanyFilters";
import { CompanyCard } from "@/features/companies/components/CompanyCard";
import { useGetFilteredCompaniesQuery } from "@/features/companies/api/companies.service";
import { Button } from "@/components/ui/Btn";
import type { FilterCompaniesParams } from "@/features/companies/api/company.type";

const CompanySkeleton = () => (
  <div className="rounded-2xl border border-gray-200 p-6 h-[280px] bg-white animate-pulse">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-16 h-16 bg-gray-200 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2 mb-6">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-full" />
    </div>
    <div className="h-10 bg-gray-200 rounded-lg w-full mt-auto" />
  </div>
);

export default function CompanyPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State lưu trữ params cho API
  const [apiFilters, setApiFilters] = useState<Partial<FilterCompaniesParams>>({});

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useGetFilteredCompaniesQuery({
    page: currentPage,
    limit: itemsPerPage,
    ...({ verificationStatus: "verified" } as any),
    ...apiFilters,
  });

  const companies = responseData?.data || [];
  const totalRecords = responseData?.pagination?.total || 0;
  const totalPages = responseData?.pagination?.totalPages || 1;

  const handleFilterChange = useCallback((uiFilters: UICompanyFilters) => {
    const newParams: Partial<FilterCompaniesParams> = {
      name: uiFilters.search,
      industry: uiFilters.industry,
      employeeCount: uiFilters.employeeCount,
    };

    // Mapping Founded Year
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

    // Mapping Sort
    if (uiFilters.sortBy === "name") newParams.sort = "asc";
    else if (uiFilters.sortBy === "newest") newParams.sort = "desc";
    else if (uiFilters.sortBy === "oldest") newParams.sort = "asc";
    else newParams.sort = "desc";

    setApiFilters(newParams);
    setCurrentPage(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-section/30 via-white to-section/20 py-12 mt-20">
      <div className="w-[80%] xl:w-256 mx-auto">
        <div className="text-center mb-12 space-y-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />

          <div className="inline-flex items-center justify-center relative group">
            <div className="relative p-4 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-2xl backdrop-blur-sm border border-primary/20">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-default text-5xl font-bold text-gray-900">Top Hiring Companies</h1>
            <p className="text-text-blur text-lg max-w-2xl mx-auto">
              Discover your next career move with our curated list.
            </p>
          </div>

          <div className="flex items-center justify-center gap-8 pt-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-600">
                <span className="font-bold text-gray-900">{totalRecords}</span> Results Found
              </span>
            </div>
          </div>
        </div>

        {/* Component Filter Mới */}
        <CompanyFilters onFilterChange={handleFilterChange} />

        <div className="min-h-[400px] mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[...Array(6)].map((_, i) => (
                <CompanySkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-red-100 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold">Failed to load data</h3>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
              <Building2 className="w-10 h-10 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900">No companies found</h3>
              <p className="text-gray-500">Adjust your filters to see more results.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {companies.map((company, index) => (
                <div
                  key={company._id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500 transition-transform hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CompanyCard company={company} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mt-8">
            <p className="text-sm text-gray-600 font-medium">
              Page <span className="text-gray-900 font-bold">{currentPage}</span> of{" "}
              <span className="text-gray-900 font-bold">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-semibold"
              >
                Previous
              </button>

              <div className="hidden sm:flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i + 1;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  if (pageNum <= 0) return null;

                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[40px] h-10 rounded-lg text-sm font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-primary text-white shadow-lg shadow-primary/25"
                          : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
