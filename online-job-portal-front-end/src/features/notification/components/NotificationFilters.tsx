import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons/icons';
import { NotificationType } from '../notification.type';
import { NOTIFICATION_TYPE_FILTER_OPTIONS, NOTIFICATION_TYPE_CONFIG } from '../notification.constants';

interface NotificationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: NotificationType | 'all';
  onTypeChange: (type: NotificationType | 'all') => void;
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  search,
  onSearchChange,
  type,
  onTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}) => {

  const handleClearFilters = () => {
    onSearchChange('');
    onTypeChange('all');
    onDateFromChange('');
    onDateToChange('');
  };

  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSearchChange('');
  };

  const handleClearType = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTypeChange('all');
  };

  const handleClearDateRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateFromChange('');
    onDateToChange('');
  };

  const hasActiveFilters = search || type !== 'all' || dateFrom || dateTo;
  const activeTypeLabel = NOTIFICATION_TYPE_FILTER_OPTIONS.find(
    t => t.value === type
  )?.label;

  return (
    <div className="bg-white rounded-xl shadow-md border border-orange-100 p-3 space-y-3">
      
      {/* Title */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <Icons.filter className="w-4 h-4 text-orange-500" />
        <h2 className="text-base font-bold text-gray-900">Filter</h2>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* Search - Full Width on Mobile */}
        <div className="md:col-span-2">
          <Label htmlFor="search-input" className="text-xs font-medium text-gray-700 mb-1.5">
            Search
          </Label>
          <div className="relative">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              id="search-input"
              placeholder="Title, content..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm border-gray-200 focus:border-orange-400 focus:ring-orange-400"
            />
          </div>
        </div>

        {/* Type Filter - FIX: DÙNG <select> HTML NATIVE */}
        <div>
          <Label htmlFor="type-select" className="text-xs font-medium text-gray-700 mb-1.5">
            Notifications Type
          </Label>
          <div className="relative">
            <Icons.tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none z-10" />
            <select
              id="type-select"
              value={type}
              onChange={(e) => onTypeChange(e.target.value as NotificationType | 'all')}
              className="w-full pl-9 h-9 text-sm border border-gray-200 rounded-md focus:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white cursor-pointer"
            >
              {NOTIFICATION_TYPE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-1.5">
            Date Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {/* From Date */}
            <div>
              <Input
                type="date"
                id="date-from"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="h-9 text-xs border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>

            {/* To Date */}
            <div>
              <Input
                type="date"
                id="date-to"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="h-9 text-xs border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex gap-2 items-start flex-wrap pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Icons.filter className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-700 font-semibold whitespace-nowrap">Đang lọc:</span>
          </div>
          
          {search && (
            <Badge variant="secondary" className="gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
              <Icons.search className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[120px]">"{search}"</span>
              <button 
                onClick={handleClearSearch} 
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors flex-shrink-0"
              >
                <Icons.x className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {type !== 'all' && (
            <Badge 
              variant="secondary" 
              className={`gap-1.5 text-xs font-semibold shadow-sm ${NOTIFICATION_TYPE_CONFIG[type].color}`}
            >
              {React.createElement(NOTIFICATION_TYPE_CONFIG[type].icon, { 
                className: "w-3 h-3 flex-shrink-0" 
              })}
              <span className="truncate">{activeTypeLabel}</span>
              <button 
                onClick={handleClearType} 
                className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors flex-shrink-0"
              >
                <Icons.x className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {(dateFrom || dateTo) && (
            <Badge variant="secondary" className="gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
              <Icons.calendar className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {dateFrom && new Date(dateFrom).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} 
                {dateFrom && dateTo && ' → '}
                {dateTo ? new Date(dateTo).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : (!dateFrom && 'Hôm nay')}
              </span>
              <button 
                onClick={handleClearDateRange} 
                className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors flex-shrink-0"
              >
                <Icons.x className="w-3 h-3" />
              </button>
            </Badge>
          )}

          <ButtonLowercase 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters} 
            className="text-xs h-7 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all font-medium ml-auto whitespace-nowrap"
          >
            <Icons.x className="w-3.5 h-3.5 mr-1" />
            Clear All Filters
          </ButtonLowercase>
        </div>
      )}
    </div>
  );
};