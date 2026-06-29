"use client";

import { useState } from "react";
import { Briefcase, ChevronDown, MapPin, Search, TrendingUp, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Job } from "../types/job.types";

interface FindJobPageHeaderProps {
  jobs?: Job[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: { industry: string[]; location: string[] };
  onFilterChange: (filters: any) => void;
  onSearchClick: () => void;
}

export default function FindJobPageHeader({
  jobs = [],
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onSearchClick,
}: FindJobPageHeaderProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);


  const trendingSearches = [
    "Frontend Developer",
    "UI/UX Designer",
    "Product Manager",
    "Data Analyst",
  ];
  const popularLocations = ["Hanoi", "Ho Chi Minh City", "Da Nang", "Remote"];

  const handleMultiSelect = (key: "industry" | "location", value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    onFilterChange({ ...filters, [key]: updated });
  };

  const handleSuggestionClick = (term: string) => {
    onSearchChange(term);
    setShowSuggestions(false);
    onSearchClick();
  };

  const handleLocationSuggestion = (loc: string) => {
    handleMultiSelect("location", loc);
  };

  return (
    <div className="bg-gradient-to-r pt-32 pb-5 text-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Headline */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Find the opportunity made for you</h1>
          <p className="text-lg text-orange-100">
            Thousands of jobs in Vietnam are waiting for you
          </p>
        </div>

        {/* Search Bar - Fully Responsive */}
        <div className="relative max-w-5xl mx-auto">
          <div
            className={`
              bg-white rounded-2xl sm:rounded-full shadow-2xl overflow-hidden
              transition-all duration-300
              ${showSuggestions ? "shadow-3xl ring-4 ring-orange-100" : ""}
            `}
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
              {/* Search Input */}
              <div className="flex items-center flex-1 px-5 py-4">
                <Search className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Job title, keyword, company..."
                  className="w-full text-gray-900 placeholder-gray-400 focus:outline-none text-base bg-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px bg-gray-300 mx-4" aria-hidden="true" />

              {/* Industry Dropdown */}




              {/* Search Button - Perfect on all devices */}
              <div className="p-4 sm:p-0 sm:pr-4">
                <button
                  onClick={onSearchClick}
                  className="
                    w-full sm:w-auto
                    bg-gradient-to-r from-orange-500 to-orange-600
                    hover:from-orange-600 hover:to-orange-700
                    active:from-orange-700 active:to-orange-800
                    text-white font-semibold
                    rounded-full
                    flex items-center justify-center gap-2.5
                    px-8 py-4 m-2
                    shadow-lg hover:shadow-xl active:shadow
                    transition-all duration-200
                    active:scale-95
                    whitespace-nowrap
                  "
                >
                  <Search className="h-5 w-5" />
                  <span className="hidden xs:inline">Search Jobs</span>
                  <span className="xs:hidden">Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions Dropdown - Only on desktop/tablet */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 hidden sm:block">
              <div className="p-6 max-w-5xl mx-auto">
                <div className="grid grid-cols-2 gap-10">
                  {/* Trending Searches */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      <h3 className="font-semibold text-gray-800">Trending Searches</h3>
                    </div>
                    <div className="space-y-2">
                      {trendingSearches.map((term) => (
                        <button
                          key={term}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSuggestionClick(term)}
                          className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-medium text-sm transition-all border border-transparent hover:border-orange-200"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Locations */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-orange-500" />
                      <h3 className="font-semibold text-gray-800">Popular Locations</h3>
                    </div>
                    <div className="space-y-2">
                      {popularLocations.map((loc) => (
                        <button
                          key={loc}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleLocationSuggestion(loc)}
                          className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-medium text-sm transition-all border border-transparent hover:border-orange-200"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-white-900">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>
              <strong className="text-white font-bold">2,847</strong> new jobs today
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>
              <strong className="text-white font-bold">15,234</strong> active candidates
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span>
              <strong className="text-white font-bold">1,200+</strong> companies hiring
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
