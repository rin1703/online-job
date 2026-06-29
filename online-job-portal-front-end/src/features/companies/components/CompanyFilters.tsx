import React, { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { COMPANY_SIZES } from "@/features/companies/company.schema";

export interface UICompanyFilters {
  industry: string;
  employeeCount: string;
  foundedYear: string;
  sortBy: string;
  search: string;
}

interface CompanyFiltersProps {
  onFilterChange: (filters: UICompanyFilters) => void;
  className?: string;
  initialFilters?: Partial<UICompanyFilters>;
}

export const CompanyFilters: React.FC<CompanyFiltersProps> = ({
  onFilterChange,
  className,
  initialFilters,
}) => {
  const [searchValue, setSearchValue] = useState(initialFilters?.search || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<Omit<UICompanyFilters, "search">>({
    industry: initialFilters?.industry || "",
    employeeCount: initialFilters?.employeeCount || "",
    foundedYear: initialFilters?.foundedYear || "",
    sortBy: initialFilters?.sortBy || "newest",
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({ ...filters, search: searchValue });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue, filters, onFilterChange]);

  const handleFilterChange = (key: keyof Omit<UICompanyFilters, "search">, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setSearchValue("");
    setFilters({
      industry: "",
      employeeCount: "",
      foundedYear: "",
      sortBy: "newest",
    });
  };

  return (
    <div className={`w-full z-10 ${className}`}>
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              aria-label="Search company by name"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search company by name..."
              className="w-full pl-12 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* ... (Phần Industry giữ nguyên) ... */}
            <div className="relative flex-1 md:flex-initial">
              <select
                aria-label="Filter by industry"
                value={filters.industry}
                onChange={(e) => handleFilterChange("industry", e.target.value)}
                className="w-full md:w-48 appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none cursor-pointer hover:border-gray-300"
              >
                <option value="">All Industries</option>
                <option value="tech">Technology</option>
                <option value="finance">Finance</option>
                <option value="medical">Medical</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
              </select>
            </div>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isFilterOpen
                  ? "border-primary text-primary bg-primary/5"
                  : "border-gray-200 text-gray-700 bg-white hover:border-gray-300"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="filter-employee-count"
                  className="text-xs font-semibold text-gray-500 uppercase"
                >
                  Company Size
                </label>

                {/* SỬA: Map qua mảng COMPANY_SIZES từ schema */}
                <select
                  id="filter-employee-count"
                  value={filters.employeeCount}
                  onChange={(e) => handleFilterChange("employeeCount", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                >
                  <option value="">All Sizes</option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* ... (Các filter khác giữ nguyên) ... */}
              <div className="space-y-1.5">
                <label
                  htmlFor="filter-founded-year"
                  className="text-xs font-semibold text-gray-500 uppercase"
                >
                  Founded Year
                </label>
                <select
                  id="filter-founded-year"
                  value={filters.foundedYear}
                  onChange={(e) => handleFilterChange("foundedYear", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                >
                  <option value="">Any Year</option>
                  <option value="2020+">2020 or later</option>
                  <option value="2015-2020">2015-2020</option>
                  <option value="before-2010">Before 2010</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="filter-sort-by"
                  className="text-xs font-semibold text-gray-500 uppercase"
                >
                  Sort By
                </label>
                <select
                  id="filter-sort-by"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
