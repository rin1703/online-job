import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { useGetJobsQuery, type SearchJobsParams } from '@/redux/features/jobs/jobApi.ts';
import type { RootState } from '@/redux/store';

// Simple debounce utility
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export function useJobSearch(sortBy: string = 'newest') {
  console.log('[useJobSearch] Hook called!');
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();

  // State for user inputs and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Industries');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: [] as string[],
    location: [] as string[],
    experience: [] as string[],
    level: [] as string[],
    salary: { min: 0, max: 100000000 },
    workType: [] as string[],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load filters from URL on mount
  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    const industryIds = searchParams.getAll('industryIds');
    const locationIds = searchParams.getAll('locationIds');
    const experienceLevels = searchParams.getAll('experienceLevels');
    const levels = searchParams.getAll('level');
    const workTypes = searchParams.getAll('workType');
    const salaryMin = searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : 0;
    const salaryMax = searchParams.get('salaryMax') ? Number(searchParams.get('salaryMax')) : 100000000;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

    setSearchTerm(keyword);
    setAppliedSearchTerm(keyword);
    setCurrentPage(page);
    setFilters({
      industry: industryIds,
      location: locationIds,
      experience: experienceLevels,
      level: levels,
      salary: { min: salaryMin, max: salaryMax },
      workType: workTypes,
    });
    setIsInitialized(true);
  }, []); // Run only on mount

  // Update URL when filters change
  useEffect(() => {
    if (!isInitialized) return;

    const newParams = new URLSearchParams();
    if (appliedSearchTerm) newParams.set('keyword', appliedSearchTerm);
    filters.industry.forEach((id) => newParams.append('industryIds', id));
    filters.location.forEach((id) => newParams.append('locationIds', id));
    filters.experience.forEach((exp) => newParams.append('experienceLevels', exp));
    filters.level.forEach((level) => newParams.append('level', level));
    if (filters.salary.min > 0) newParams.set('salaryMin', String(filters.salary.min));
    if (filters.salary.max < 100000000) newParams.set('salaryMax', String(filters.salary.max));
    filters.workType.forEach((type) => newParams.append('workType', type));
    newParams.set('page', String(currentPage));
    newParams.set('sortBy', sortBy);

    setSearchParams(newParams);
  }, [appliedSearchTerm, filters, currentPage, sortBy, isInitialized]);

  // Build search params from filters
  const apiSearchParams = useMemo((): SearchJobsParams => {
    const params: SearchJobsParams = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy: sortBy === 'newest' ? 'newest' : sortBy,
    };

    // Add keyword if search term is applied
    if (appliedSearchTerm) {
      params.keyword = appliedSearchTerm;
    }

    // Add industry filters (using IDs)
    if (filters.industry && filters.industry.length > 0) {
      params.industryIds = filters.industry;
    }

    // Add location filters - send all selected locations
    if (filters.location && filters.location.length > 0) {
      params.locationIds = filters.location;
    }

    // Add experience filter - send all selected experience levels
    if (filters.experience && filters.experience.length > 0) {
      params.experienceLevels = filters.experience;
    }

    // Add salary range
    if (filters.salary.min > 0 || filters.salary.max < 100000000) {
      if (filters.salary.min > 0) params.salaryMin = filters.salary.min;
      if (filters.salary.max < 100000000) params.salaryMax = filters.salary.max;
    }

    // Add work type filters
    if (filters.workType && filters.workType.length > 0) {
      params.isRemote = filters.workType.includes('remote');
      params.isHybrid = filters.workType.includes('hybrid');
    }

    return params;
  }, [appliedSearchTerm, filters, currentPage, itemsPerPage, sortBy]);

  // 1. Fetch jobs from /jobs/search endpoint with filters applied server-side
  console.log('[useJobSearch] Calling API with params:', apiSearchParams);
  console.log('[useJobSearch] Calling useGetJobsQuery now...');
  const queryResult = useGetJobsQuery(apiSearchParams);
  console.log('[useJobSearch] Query result:', queryResult);
  const {
    data: jobsResponse,
    isLoading,
    isError,
    error: apiError,
  } = queryResult;
  console.log('[useJobSearch] Response:', jobsResponse);

  // Extract jobs and pagination info from response
  const paginatedJobs = jobsResponse?.jobs || [];
  const totalJobs = jobsResponse?.pagination?.total || 0;
  const totalPages = jobsResponse?.pagination?.totalPages || 1;

  // 2. Merge with user favorite data if authenticated
  const enhancedJobs = useMemo(() => {
    if (!isAuthenticated) return paginatedJobs;
    // Jobs from /jobs/search already have isFavorite if user is logged in
    return paginatedJobs;
  }, [paginatedJobs, isAuthenticated]);

  // Fallback for errors
  const finalJobs = useMemo(() => {
    if (isError) {
      console.error('[useJobSearch] API error, falling back to DEMO_JOBS', apiError);
      return enhancedJobs;
    }
    return enhancedJobs;
  }, [isError, enhancedJobs, apiError]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return (
      (filters.industry?.length || 0) +
      (filters.location?.length || 0) +
      (filters.experience?.length || 0) +
      (filters.level?.length || 0) +
      (filters.workType?.length || 0) +
      (selectedCategory === 'All Industries' ? 0 : 1) +
      (selectedLocation === 'All Locations' ? 0 : 1)
    );
  }, [filters, selectedCategory, selectedLocation]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Create debounced version of setAppliedSearchTerm
  const debouncedSetAppliedSearchTerm = useRef(
    debounce((term: string) => {
      setAppliedSearchTerm(term);
      setCurrentPage(1);
    }, 300)
  ).current;

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term); // Update local state immediately for UI feedback
      debouncedSetAppliedSearchTerm(term); // Debounce the API call
    },
    [debouncedSetAppliedSearchTerm]
  );

  const handleSearchClick = (term?: string) => {
    const newSearchTerm = typeof term === 'string' ? term : searchTerm;
    setSearchTerm(newSearchTerm);
    setAppliedSearchTerm(newSearchTerm); // Immediate apply (not debounced)
    setCurrentPage(1);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedLocation,
    setSelectedLocation,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    paginatedJobs: finalJobs,
    totalJobs,
    totalPages,
    activeFilterCount,
    handleFilterChange,
    handleSearchClick,
    handleSearchChange, // New debounced handler
    isLoading,
    error: isError,
    apiError,
  };
}
