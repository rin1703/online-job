/**
 * Utility Helper Functions
 * Consolidated utility functions for various operations
 */

import { VALIDATION_CONSTANTS, ERROR_MESSAGES } from "./constants.helper";

// ============== OBJECT UTILITIES ==============

/**
 * Filters object properties by keys and removes undefined values
 */
export const filterDefinedProperties = <T extends object>(
  obj: T,
  keys: (keyof T)[]
) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([k, v]) => keys.includes(k as keyof T) && v !== undefined
    )
  );

// Backward compatibility
export const checkUndefined = filterDefinedProperties;

// ============== URL & DOMAIN UTILITIES ==============

/**
 * Normalizes domain by converting to lowercase and removing www prefix
 */
export function normalizeDomain(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

/**
 * Extracts domain from URL string
 */
export function extractDomainFromUrl(input: string): string | null {
  try {
    const url = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const u = new URL(url);
    return normalizeDomain(u.hostname);
  } catch {
    return null;
  }
}

// ============== COMPANY NAME UTILITIES ==============

/**
 * Normalizes company name by removing diacritics, legal suffixes, and standardizing format
 */
export function normalizeCompanyName(name: string): string {
  let s = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  s = s.replace(/[.,/\\\-–—()&]+/g, " ");

  const legalParts = [
    "cong ty", "ct", "cty", "cthd", "tct", "tong cong ty",
    "ctcp", "co phan", "jsc", "joint stock company",
    "tnhh", "trach nhiem huu han", "limited", "ltd", "llc", "pte", "pte ltd",
    "tap doan", "group", "holding", "holdings", "corporation", "corp", "inc", "plc",
    "cn", "chi nhanh", "vpdd", "van phong dai dien", "branch", "office",
    "viet nam", "vietnam", "vn",
  ];

  const escapedParts = legalParts.map((p) =>
    p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const pattern = new RegExp(
    `(?:^|[^a-z0-9])(${escapedParts.join("|")})(?=$|[^a-z0-9])`,
    "gi"
  );
  s = s.replace(pattern, " ");
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

/**
 * Checks if two company names match after normalization
 */
export function isSameCompanyName(name1: string, name2: string): boolean {
  return normalizeCompanyName(name1) === normalizeCompanyName(name2);
}

/**
 * Creates a searchable key from company name
 */
export function getCompanySearchKey(name: string): string {
  return normalizeCompanyName(name);
}

// ============== EMAIL UTILITIES ==============

/**
 * Validates email format using regex pattern
 */
export function validateEmailFormat(email: string): string | null {
  if (!email) {
    return ERROR_MESSAGES.MISSING_FIELDS;
  }
  return VALIDATION_CONSTANTS.EMAIL_REGEX.test(email) 
    ? null 
    : ERROR_MESSAGES.INVALID_EMAIL_FORMAT;
}

/**
 * Normalizes email to lowercase for consistent storage
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ============== DATE UTILITIES ==============

/**
 * Checks if a date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date < new Date();
}

/**
 * Checks if a date is in the future
 */
export function isFutureDate(date: Date): boolean {
  return date > new Date();
}

/**
 * Adds days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Adds minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Calculates difference in minutes between two dates
 */
export function getMinutesDifference(date1: Date, date2: Date): number {
  return Math.floor((date1.getTime() - date2.getTime()) / 60000);
}
