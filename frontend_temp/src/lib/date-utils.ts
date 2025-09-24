import { 
  format, 
  formatDistanceToNow, 
  formatDistanceToNowStrict, 
  parseISO,
  type Locale,
  type FirstWeekContainsDate,
  type FormatOptions
} from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';

type DateLike = Date | string | number;

const DEFAULT_DATE_FORMAT = 'MMM d, yyyy';
const DEFAULT_TIME_FORMAT = 'h:mm a';
const DEFAULT_DATETIME_FORMAT = `${DEFAULT_DATE_FORMAT} 'at' ${DEFAULT_TIME_FORMAT}`;

/**
 * Format a date or timestamp into a human-readable string
 */
export function formatDate(
  date: DateLike,
  formatStr: string = DEFAULT_DATE_FORMAT,
  options: Omit<FormatOptions, 'locale' | 'weekStartsOn' | 'firstWeekContainsDate'> & {
    locale?: Locale;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    firstWeekContainsDate?: FirstWeekContainsDate;
  } = {}
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(dateObj, formatStr, {
      locale: enUS,
      ...options,
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date or timestamp into a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: DateLike,
  options?: {
    addSuffix?: boolean;
    includeSeconds?: boolean;
    locale?: Locale;
  }
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: enUS,
      ...options,
    });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date or timestamp into a relative time string with strict formatting
 */
export function formatRelativeTimeStrict(
  date: DateLike,
  options?: {
    addSuffix?: boolean;
    unit?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
    roundingMethod?: 'floor' | 'ceil' | 'round';
    locale?: Locale;
  }
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return formatDistanceToNowStrict(dateObj, {
      addSuffix: true,
      locale: enUS,
      ...options,
    });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date or timestamp into a time string (e.g., "2:30 PM")
 */
export function formatTime(
  date: DateLike,
  formatStr: string = DEFAULT_TIME_FORMAT
): string {
  return formatDate(date, formatStr);
}

/**
 * Format a date or timestamp into a date and time string
 */
export function formatDateTime(
  date: DateLike,
  formatStr: string = DEFAULT_DATETIME_FORMAT
): string {
  return formatDate(date, formatStr);
}

/**
 * Get the time difference between two dates in milliseconds
 */
export function getTimeDifference(a: DateLike, b: DateLike): number {
  try {
    const dateA = typeof a === 'string' ? parseISO(a) : new Date(a);
    const dateB = typeof b === 'string' ? parseISO(b) : new Date(b);
    return dateA.getTime() - dateB.getTime();
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return 0;
  }
}

/**
 * Check if a date is today
 */
export function isToday(date: DateLike): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
}

/**
 * Check if a date is in the past
 */
export function isPast(date: DateLike): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return dateObj < new Date();
  } catch (error) {
    console.error('Error checking if date is in the past:', error);
    return false;
  }
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: DateLike): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return dateObj > new Date();
  } catch (error) {
    console.error('Error checking if date is in the future:', error);
    return false;
  }
}

// Example usage:
/*
const now = new Date();

// Format dates
console.log(formatDate(now)); // "Jan 1, 2023"
console.log(formatTime(now)); // "2:30 PM"
console.log(formatDateTime(now)); // "Jan 1, 2023 at 2:30 PM"

// Relative time
console.log(formatRelativeTime(new Date(Date.now() - 3600000))); // "1 hour ago"
console.log(formatRelativeTimeStrict(new Date(Date.now() - 3600000))); // "1 hour ago"

// Date checks
console.log(isToday(now)); // true
console.log(isPast('2022-01-01')); // true
console.log(isFuture('2024-01-01')); // true
*/
