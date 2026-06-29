'use client';

import { useState } from 'react';
import { ChevronDown, Grid3x3, List } from 'lucide-react';


interface SortAndViewProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  jobCount: number;
  onItemsPerPageChange?: (count: number) => void;
  itemsPerPage?: number;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', icon: '🕐' },
  { value: 'oldest', label: 'Oldest', icon: '📅' },
  { value: 'highestSalary', label: 'Salary: High to Low', icon: '💰' },
  { value: 'lowestSalary', label: 'Salary: Low to High', icon: '💵' },
];

export default function SortAndView({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  jobCount,
  onItemsPerPageChange,
  itemsPerPage = 10,
}: SortAndViewProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const currentSort = SORT_OPTIONS.find((opt) => opt.value === sortBy);

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Left: Results count */}
      <div className="text-sm text-muted-foreground">
        Found <span className="font-bold text-foreground">{jobCount}</span> jobs
      </div>

      {/* Right: Sort and view controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort Dropdown */}
        <div className="relative">
          <button

            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg hover:bg-secondary transition text-sm font-medium text-foreground"
          >
            <span>{currentSort?.icon}</span>
            <span>{currentSort?.label}</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showSortDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 transition flex items-center gap-2 ${
                    sortBy === option.value
                      ? 'bg-primary/20 text-primary font-semibold'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <span>{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-input rounded-lg p-1">
          <button

            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded transition ${
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="List view"
            title="List view"
          >
            <List size={18} />
          </button>
          <button

            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded transition ${
              viewMode === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Grid view"
            title="Grid view"
          >
            <Grid3x3 size={18} />
          </button>
        </div>

        {/* Items per page (optional) */}
        {onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        )}
      </div>
    </div>
  );
}
