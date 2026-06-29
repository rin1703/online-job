import React from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterOptions?: FilterOption[];
  onFilterChange?: (value: string) => void;
  selectedFilter?: string;
  placeholder?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  filterOptions,
  onFilterChange,
  selectedFilter,
  placeholder = "Search...",
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-4 py-2.5 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-default focus:border-default transition-all"
      />
      {filterOptions && onFilterChange && selectedFilter !== undefined && (
        <select
          value={selectedFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2.5 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-default focus:border-default transition-all bg-white"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
