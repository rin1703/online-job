/**
 * Pagination Helper
 * Centralized pagination utility to avoid code duplication across services
 */

import { PAGINATION_CONSTANTS } from "./constants.helper";

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Interface for validated pagination options
 */
export interface ValidatedPaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Interface for paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Validates and normalizes pagination parameters
 */
export function validatePaginationParams(
  params: PaginationParams
): ValidatedPaginationOptions {
  const page = normalizePage(params.page);
  const limit = normalizeLimit(params.limit);
  const skip = calculateSkipValue(page, limit);

  return { page, limit, skip };
}

/**
 * Normalizes page number to ensure it's within valid range
 */
function normalizePage(page?: number): number {
  if (!isValidNumber(page)) {
    return PAGINATION_CONSTANTS.DEFAULT_PAGE;
  }

  return Math.max(page, PAGINATION_CONSTANTS.MIN_PAGE);
}

/**
 * Normalizes page size limit to ensure it's within valid range
 */
function normalizeLimit(limit?: number): number {
  if (!isValidNumber(limit)) {
    return PAGINATION_CONSTANTS.DEFAULT_LIMIT;
  }

  const boundedLimit = Math.max(limit, PAGINATION_CONSTANTS.MIN_LIMIT);
  return Math.min(boundedLimit, PAGINATION_CONSTANTS.MAX_LIMIT);
}

/**
 * Checks if value is a valid positive number
 */
function isValidNumber(value?: number): value is number {
  return typeof value === 'number' && value > PAGINATION_CONSTANTS.MIN_PAGE - 1 && !isNaN(value);
}

/**
 * Calculates number of documents to skip for pagination
 */
function calculateSkipValue(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculates total number of pages
 */
export function calculateTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0 || pageSize <= 0) {
    return 0;
  }

  return Math.ceil(totalItems / pageSize);
}

/**
 * Checks if there is a next page
 */
export function hasNextPage(currentPage: number, totalPages: number): boolean {
  return currentPage < totalPages;
}

/**
 * Checks if there is a previous page
 */
export function hasPreviousPage(currentPage: number): boolean {
  return currentPage > PAGINATION_CONSTANTS.MIN_PAGE;
}

/**
 * Creates a standardized pagination response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = calculateTotalPages(totalItems, limit);

  return {
    data,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
      hasNextPage: hasNextPage(page, totalPages),
      hasPreviousPage: hasPreviousPage(page),
    },
  };
}

/**
 * Parses pagination parameters from query string
 */
export function parsePaginationQuery(query: any): PaginationParams {
  return {
    page: parsePositiveInteger(query.page),
    limit: parsePositiveInteger(query.limit),
  };
}

/**
 * Safely parses a string to positive integer
 */
function parsePositiveInteger(value: any): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = parseInt(value, 10);
  return isValidNumber(parsed) ? parsed : undefined;
}

/**
 * Builds MongoDB sort object from query parameters
 */
export function buildSortObject(
  sortBy?: string,
  sortOrder?: string
): Record<string, 1 | -1> {
  if (!sortBy) {
    return { createdAt: -1 };
  }

  const order = sortOrder?.toLowerCase() === 'asc' ? 1 : -1;
  return { [sortBy]: order };
}

/**
 * Legacy pagination helper for backward compatibility
 */
export default function paginationHelper(
  objectPagination: {
    currentPage: number;
    limitItems: number;
    skip: number;
    totalPage: number;
  },
  query: any,
  countRecords: number
) {
  const page = parseInt(query.page) || PAGINATION_CONSTANTS.DEFAULT_PAGE;
  const limit = parseInt(query.limit) || PAGINATION_CONSTANTS.DEFAULT_LIMIT;
  
  const totalPage = Math.ceil(countRecords / limit);
  const skip = (page - 1) * limit;

  return {
    currentPage: page,
    limitItems: limit,
    skip: skip,
    totalPage: totalPage,
  };
}
