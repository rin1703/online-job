import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_FILTER_OPTIONS } from './application.constants';

type StatusValue = 'all' | 'pending' | 'reviewed' | 'approved' | 'rejected' | 'interview_scheduled' | 'withdrawn';

interface ApplicationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: StatusValue;
  onStatusChange: (value: StatusValue) => void;
}

export function ApplicationFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
}: ApplicationFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search input */}
      <div className="flex-1">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="search"
            type="text"
            placeholder="Search by job title..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Status filter */}
      <div className="w-full md:w-64">
        <Label htmlFor="status-filter" className="sr-only">
          Filter by status
        </Label>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <Select value={selectedStatus} onValueChange={(value) => onStatusChange(value as StatusValue)}>
            <SelectTrigger id="status-filter" className="pl-10">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
