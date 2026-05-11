/**
 * Date Utilities
 * Helper functions for date formatting and manipulation
 */

import {
  format,
  isToday,
  isYesterday,
  parseISO,
  startOfMonth,
  isSameMonth,
} from 'date-fns';
import { Timestamp } from 'firebase/firestore';

/**
 * Format a date to a full readable format
 * Example: "Monday, May 11, 2026"
 * @param date - Date to format (Date, string, or Timestamp)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | Timestamp): string {
  const dateObj = normalizeDate(date);
  return format(dateObj, 'EEEE, MMMM d, yyyy');
}

/**
 * Format a date to a short format
 * Example: "May 11"
 * @param date - Date to format (Date, string, or Timestamp)
 * @returns Short formatted date string
 */
export function formatShortDate(date: Date | string | Timestamp): string {
  const dateObj = normalizeDate(date);
  return format(dateObj, 'MMM d');
}

/**
 * Format a date with time
 * Example: "May 11, 2026 at 6:30 AM"
 * @param date - Date to format (Date, string, or Timestamp)
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string | Timestamp): string {
  const dateObj = normalizeDate(date);
  return format(dateObj, "MMMM d, yyyy 'at' h:mm a");
}

/**
 * Convert a date to a date key string
 * Example: "2026-05-11"
 * @param date - Date to convert (Date, string, or Timestamp)
 * @returns Date key in YYYY-MM-DD format
 */
export function toDateKey(date: Date | string | Timestamp): string {
  const dateObj = normalizeDate(date);
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Convert a date to a month key string
 * Example: "2026-05"
 * @param date - Date to convert (Date, string, or Timestamp)
 * @returns Month key in YYYY-MM format
 */
export function toMonthKey(date: Date | string | Timestamp): string {
  const dateObj = normalizeDate(date);
  return format(dateObj, 'yyyy-MM');
}

/**
 * Get a section title for grouping entries
 * Returns "Today", "Yesterday", or the month name (e.g., "May 2026")
 * @param dateKey - Date key in YYYY-MM-DD format
 * @returns Section title string
 */
export function getSectionTitle(dateKey: string): string {
  const date = parseISO(dateKey);

  if (isToday(date)) {
    return 'Today';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  return format(date, 'MMMM yyyy');
}

/**
 * Get the month title for a date
 * Example: "May 2026"
 * @param date - Date to format (Date, string, or Timestamp)
 * @returns Month title string
 */
export function getMonthTitle(date: Date | string | Timestamp): string {
  const dateObj = normalizeDate(date);
  return format(dateObj, 'MMMM yyyy');
}

/**
 * Count words in a text string
 * @param text - Text to count words in
 * @returns Number of words
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }

  // Split by whitespace and filter empty strings
  const words = trimmed.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

/**
 * Calculate estimated read time in minutes
 * Assumes average reading speed of 200 words per minute
 * @param wordCount - Number of words
 * @returns Estimated read time in minutes (minimum 1)
 */
export function getReadTime(wordCount: number): number {
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Normalize various date types to a Date object
 * @param date - Date to normalize (Date, string, or Timestamp)
 * @returns Date object
 */
export function normalizeDate(date: Date | string | Timestamp): Date {
  if (date instanceof Date) {
    return date;
  }

  if (typeof date === 'string') {
    return parseISO(date);
  }

  if (date && typeof date === 'object' && 'toDate' in date) {
    return date.toDate();
  }

  // Fallback to current date
  return new Date();
}

/**
 * Check if two dates are in the same month
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are in the same month
 */
export function isSameMonthDate(
  date1: Date | string | Timestamp,
  date2: Date | string | Timestamp
): boolean {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  return isSameMonth(d1, d2);
}

/**
 * Get the start of the month for a date
 * @param date - Date to get start of month for
 * @returns Date object representing start of month
 */
export function getStartOfMonth(date: Date | string | Timestamp): Date {
  const dateObj = normalizeDate(date);
  return startOfMonth(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago", "yesterday")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | Timestamp): string {
  const dateObj = normalizeDate(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  }

  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }

  return formatShortDate(dateObj);
}
