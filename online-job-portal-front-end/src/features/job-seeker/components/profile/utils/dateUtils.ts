/**
 * Date utility functions for profile forms
 */

/**
 * Convert Date or ISO string to YYYY-MM-DD format for input[type="date"]
 */
export function toDateInputValue(date: string | Date | null | undefined): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) return '';

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

/**
 * Convert date input value to ISO string for API
 */
export function toISOString(dateString: string): string | undefined {
  if (!dateString) return undefined;

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return undefined;

    return date.toISOString();
  } catch {
    return undefined;
  }
}

/**
 * Format date for display (e.g., "January 2023", "Jan 2023 - Present")
 */
export function formatDateDisplay(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  isCurrent?: boolean
): string {
  if (!startDate) return '';

  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;

    if (isNaN(start.getTime())) return '';

    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startYear = start.getFullYear();

    if (isCurrent) {
      return `${startMonth} ${startYear} - Present`;
    }

    if (!endDate) {
      return `${startMonth} ${startYear}`;
    }

    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    if (isNaN(end.getTime())) {
      return `${startMonth} ${startYear}`;
    }

    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const endYear = end.getFullYear();

    return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  } catch {
    return '';
  }
}

/**
 * Calculate duration between two dates (e.g., "2 years 3 months")
 */
export function calculateDuration(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  isCurrent?: boolean
): string {
  if (!startDate) return '';

  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;

    if (isNaN(start.getTime())) return '';

    const end = isCurrent || !endDate
      ? new Date()
      : (typeof endDate === 'string' ? new Date(endDate) : endDate);

    if (isNaN(end.getTime())) return '';

    const diffMs = end.getTime() - start.getTime();
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));

    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;

    if (years === 0 && months === 0) return '1 month';
    if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
    if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;

    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
  } catch {
    return '';
  }
}

/**
 * Check if a date is in the past
 */
export function isDateInPast(date: string | Date | null | undefined): boolean {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return false;

    return dateObj.getTime() < Date.now();
  } catch {
    return false;
  }
}

/**
 * Check if a date is in the future
 */
export function isDateInFuture(date: string | Date | null | undefined): boolean {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return false;

    return dateObj.getTime() > Date.now();
  } catch {
    return false;
  }
}
