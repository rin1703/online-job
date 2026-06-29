"use client";

import { useMemo, useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";

interface AdvancedFiltersProps {
  filters: {
    industry: string[];
    location: string[];
    experience: string[];
    level: string[];
    salary: { min: number; max: number };
    workType: string[];
  };
  onFilterChange: (filters: any) => void;
  industries?: string[];
  locations?: string[];
  experienceLevels?: string[];
  jobTypes?: string[];
  salaryRange?: { min: number; max: number; currency: string };
  workModes?: { remote: number; hybrid: number; onsite: number };
  jobLevels?: string[];
  onSavePreset?: (name: string, filters: any) => void;
  onLoadPreset?: (preset: any) => void;
}

// Fallback defaults if API data not available
const DEFAULT_EXPERIENCE_LEVELS = ["No experience required", "1 year", "2 years", "3 years", "5+ years"];
const DEFAULT_LEVELS = ["Staff", "Manager", "Director"];
const DEFAULT_WORK_TYPES = ["onsite", "remote", "hybrid"];

export default function AdvancedFilters({
  filters,
  onFilterChange,
  industries = [],
  locations = [],
  experienceLevels,
  workModes,
  jobLevels,
}: AdvancedFiltersProps) {
  // Use dynamic data or fallback to defaults
  const experienceOptions = experienceLevels || DEFAULT_EXPERIENCE_LEVELS;
  const levelOptions = jobLevels || DEFAULT_LEVELS;

  // Convert workModes to workType options based on API data
  const workTypeOptions = workModes
    ? Object.entries(workModes)
        .filter(([_, count]) => count > 0)
        .map(([type]) => type)
    : DEFAULT_WORK_TYPES;
  const [expandedSections, setExpandedSections] = useState({
    industry: true,
    location: true,
    experience: true,
    level: false,
    salary: true,
    workType: false,
  });

  const [industrySearch, setIndustrySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  type SectionName = keyof typeof expandedSections;

  const toggleSection = (section: SectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMultiSelect = (key: string, value: string) => {
    const currentArray = Array.isArray(filters[key as keyof typeof filters])
      ? (filters[key as keyof typeof filters] as string[])
      : [];

    const updated = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    onFilterChange({
      ...filters,
      [key]: updated,
    });
  };

  const handleClearSection = (key: keyof AdvancedFiltersProps["filters"]) => {
    onFilterChange({
      ...filters,
      [key]: Array.isArray(filters[key])
        ? []
        : key === "salary"
          ? { min: 0, max: 100000000 }
          : filters[key],
    });
  };

  // const handleSalaryChange = (type: "min" | "max", value: number) => {
  //   onFilterChange({
  //     ...filters,
  //     salary: {
  //       ...filters.salary,
  //       [type]: value,
  //     },
  //   });
  // };

  const resetAllFilters = () => {
    onFilterChange({
      industry: [],
      location: [],
      experience: [],
      level: [],
      salary: { min: 0, max: 100000000 },
      workType: [],
    });
  };

  const activeFilterCount = useMemo(
    () =>
      [
        ...(filters.industry || []),
        ...(filters.location || []),
        ...(filters.experience || []),
        ...(filters.level || []),
        ...(filters.workType || []),
      ].length,
    [filters],
  );
  type SectionKey = keyof typeof expandedSections;

  const FilterSection = ({
    title,
    section,
    count = 0,
    onClear,
    children
  }: {
    title: string;
    section: SectionKey;
    count?: number;
    onClear?: () => void;
    children: React.ReactNode;
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow transition">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between px-5 py-4 rounded-xl hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {count > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500 text-white">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${expandedSections[section] ? "rotate-180" : ""}`}
        />
      </button>

      {expandedSections[section] && (
        <div className="px-5 pb-5 border-t border-gray-100 mt-2 pt-4">
          {onClear && count > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium mb-3"
            >
              Clear selection
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
  const FilterTag = ({
    value,
    onRemove,
  }: {
    key?: string; // 👈 Thêm dòng này
    value: string;
    onRemove: () => void;
  }) => (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-medium">
      <span>{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-primary/80 transition"
        aria-label="Remove filter"
      >
        {/* <X size={14} /> */}
      </button>
    </div>
  );

  const visibleIndustries = useMemo(
    () =>
      industries
        .filter((ind) => ind !== "all")
        .filter((ind) =>
          industrySearch.trim() ? ind.toLowerCase().includes(industrySearch.toLowerCase()) : true,
        ),
    [industries, industrySearch],
  );

  const visibleLocations = useMemo(
    () =>
      locations
        .filter((loc) => loc !== "all")
        .filter((loc) =>
          locationSearch.trim() ? loc.toLowerCase().includes(locationSearch.toLowerCase()) : true,
        ),
    [locations, locationSearch],
  );

  return (
    <div className="space-y-4 sticky top-24">
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="bg-secondary/30 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">
              {activeFilterCount} filters applied
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1"
            >
              <RotateCcw size={14} />
              Reset all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.industry?.map((item) => (
              <FilterTag
                key={`industry-${item}`}
                value={item}
                onRemove={() => handleMultiSelect("industry", item)}
              />
            ))}
            {filters.location?.map((item) => (
              <FilterTag
                key={`location-${item}`}
                value={item}
                onRemove={() => handleMultiSelect("location", item)}
              />
            ))}
            {filters.experience?.map((item) => (
              <FilterTag
                key={`experience-${item}`}
                value={item}
                onRemove={() => handleMultiSelect("experience", item)}
              />
            ))}
            {filters.level?.map((item) => (
              <FilterTag
                key={`level-${item}`}
                value={item}
                onRemove={() => handleMultiSelect("level", item)}
              />
            ))}
            {filters.workType?.map((item) => (
              <FilterTag
                key={`worktype-${item}`}
                value={item}
                onRemove={() => handleMultiSelect("workType", item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Industry Filter */}
      <FilterSection
        title="Industry"
        section="industry"
        count={filters.industry.length}
        onClear={() => handleClearSection("industry")}
      >
        <input
          type="text"
          value={industrySearch}
          onChange={(e) => setIndustrySearch(e.target.value)}
          placeholder="Search industry..."
          className="w-full mb-2 px-3 py-2 bg-input border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
        />
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {visibleIndustries.map((industry) => (
            <label
              key={industry}
              htmlFor={`industry-${industry}`}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            >
              <input
                id={`industry-${industry}`}
                type="checkbox"
                checked={(filters.industry || []).includes(industry)}
                onChange={() => handleMultiSelect("industry", industry)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-foreground">{industry}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Location Filter */}
      <FilterSection
        title="Location"
        section="location"
        count={filters.location.length}
        onClear={() => handleClearSection("location")}
      >
        <input
          type="text"
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
          placeholder="Search location..."
          className="w-full mb-2 px-3 py-2 bg-input border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
        />
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {visibleLocations.map((location) => (
            <label
              key={location}
              htmlFor={`location-${location}`}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            >
              <input
                id={`location-${location}`}
                type="checkbox"
                checked={(filters.location || []).includes(location)}
                onChange={() => handleMultiSelect("location", location)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-foreground">{location}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Experience Filter */}
      <FilterSection
        title="Experience"
        section="experience"
        count={filters.experience.length}
        onClear={() => handleClearSection("experience")}
      >
        <div className="space-y-2">
          {experienceOptions.map((exp) => (
            <label
              key={exp}
              htmlFor={`experience-${exp}`}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            >
              <input
                id={`experience-${exp}`}
                type="checkbox"
                checked={(filters.experience || []).includes(exp)}
                onChange={() => handleMultiSelect("experience", exp)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-foreground">{exp}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Level Filter */}
      <FilterSection
        title="Level"
        section="level"
        count={filters.level.length}
        onClear={() => handleClearSection("level")}
      >
        <div className="space-y-2">
          {levelOptions.map((level) => (
            <label
              key={level}
              htmlFor={`level-${level}`}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            >
              <input
                id={`level-${level}`}
                type="checkbox"
                checked={(filters.level || []).includes(level)}
                onChange={() => handleMultiSelect("level", level)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-foreground capitalize">{level}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Salary Range Filter */}
      <FilterSection title="Salary Range" section="salary">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-2">
              Minimum Salary (VND)
            </label>
            <input
              type="number"
              value={filters.salary.min}
              onChange={(e) => {
                const newMin = Math.max(0, Number(e.target.value) || 0);
                onFilterChange({
                  ...filters,
                  salary: {
                    ...filters.salary,
                    min: newMin,
                  },
                });
              }}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-2">
              Maximum Salary (VND)
            </label>
            <input
              type="number"
              value={filters.salary.max}
              onChange={(e) => {
                const newMax = Math.max(0, Number(e.target.value) || 100000000);
                // Ensure max is not less than min
                const finalMax = Math.max(newMax, filters.salary.min);
                onFilterChange({
                  ...filters,
                  salary: {
                    ...filters.salary,
                    max: finalMax,
                  },
                });
              }}
              placeholder="100000000"
              min="0"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            {filters.salary.max < filters.salary.min && (
              <p className="text-xs text-red-600 mt-1">Maximum must be greater than minimum</p>
            )}
          </div>
          {filters.salary.min > 0 || filters.salary.max < 100000000 ? (
            <button
              onClick={() =>
                onFilterChange({
                  ...filters,
                  salary: { min: 0, max: 100000000 },
                })
              }
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear salary range
            </button>
          ) : null}
        </div>
      </FilterSection>

      {/* Work Type Filter */}
      <FilterSection
        title="Work Type"
        section="workType"
        count={filters.workType.length}
        onClear={() => handleClearSection("workType")}
      >
        <div className="space-y-2">
          {workTypeOptions.map((type) => (
            <label
              key={type}
              htmlFor={`workType-${type}`}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            >
              <input
                id={`workType-${type}`}
                type="checkbox"
                checked={(filters.workType || []).includes(type)}
                onChange={() => handleMultiSelect("workType", type)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-foreground capitalize">
                {type === "onsite" ? "Onsite" : type === "remote" ? "Remote" : "Hybrid"}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
