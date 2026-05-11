/**
 * Section Utilities
 * Helper functions for grouping entries into sections for SectionList
 */

import { Entry, EntrySection, MarkedDates } from '../types/entry';
import { toMonthKey, getMonthTitle, normalizeDate } from './dateUtils';
import { COLORS } from '../constants/theme';

/**
 * Group entries by month for SectionList display
 * Entries are sorted by createdAt descending within each section
 * Sections are sorted by most recent month first
 * @param entries - Array of entries to group
 * @returns Array of EntrySection objects
 */
export function groupEntriesByMonth(entries: Entry[]): EntrySection[] {
  if (!entries || entries.length === 0) {
    return [];
  }

  // Create a map of month key to entries
  const monthMap = new Map<string, Entry[]>();

  entries.forEach((entry) => {
    const monthKey = toMonthKey(entry.createdAt);

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
    }

    monthMap.get(monthKey)!.push(entry);
  });

  // Convert map to array of sections
  const sections: EntrySection[] = [];

  monthMap.forEach((monthEntries, monthKey) => {
    // Sort entries within section by createdAt descending
    const sortedEntries = monthEntries.sort((a, b) => {
      const dateA = normalizeDate(a.createdAt).getTime();
      const dateB = normalizeDate(b.createdAt).getTime();
      return dateB - dateA;
    });

    // Get the month title from the first entry
    const firstEntry = sortedEntries[0];
    const title = getMonthTitle(firstEntry.createdAt);

    sections.push({
      title,
      monthKey,
      data: sortedEntries,
    });
  });

  // Sort sections by month key descending (most recent first)
  sections.sort((a, b) => b.monthKey.localeCompare(a.monthKey));

  return sections;
}

/**
 * Generate marked dates object for react-native-calendars
 * Creates a dot marker for each date that has entries
 * @param entries - Array of entries
 * @param accentColor - Color for the dot markers (optional)
 * @returns Object with date keys and marker configuration
 */
export function generateMarkedDates(
  entries: Entry[],
  accentColor: string = COLORS.accent
): MarkedDates {
  const markedDates: MarkedDates = {};

  entries.forEach((entry) => {
    const dateKey = entry.dateKey;

    // Only add if not already marked
    if (!markedDates[dateKey]) {
      markedDates[dateKey] = {
        marked: true,
        dotColor: accentColor,
      };
    }
  });

  return markedDates;
}

/**
 * Filter entries by date key
 * @param entries - Array of entries
 * @param dateKey - Date key to filter by (YYYY-MM-DD)
 * @returns Filtered array of entries
 */
export function filterEntriesByDate(entries: Entry[], dateKey: string): Entry[] {
  return entries.filter((entry) => entry.dateKey === dateKey);
}

/**
 * Filter entries by month key
 * @param entries - Array of entries
 * @param monthKey - Month key to filter by (YYYY-MM)
 * @returns Filtered array of entries
 */
export function filterEntriesByMonth(entries: Entry[], monthKey: string): Entry[] {
  return entries.filter((entry) => {
    const entryMonthKey = toMonthKey(entry.createdAt);
    return entryMonthKey === monthKey;
  });
}

/**
 * Get entry by ID from an array
 * @param entries - Array of entries
 * @param id - Entry ID to find
 * @returns Entry or undefined if not found
 */
export function getEntryById(entries: Entry[], id: string): Entry | undefined {
  return entries.find((entry) => entry.id === id);
}

/**
 * Calculate total word count for all entries
 * @param entries - Array of entries
 * @returns Total word count
 */
export function getTotalWordCount(entries: Entry[]): number {
  return entries.reduce((total, entry) => total + (entry.wordCount || 0), 0);
}

/**
 * Calculate estimated storage size for entries
 * Based on average bytes per character in UTF-8
 * @param entries - Array of entries
 * @returns Estimated size in bytes
 */
export function estimateStorageSize(entries: Entry[]): number {
  let totalBytes = 0;

  entries.forEach((entry) => {
    // Estimate bytes for text content
    totalBytes += (entry.title?.length || 0) * 2; // UTF-16 characters
    totalBytes += (entry.body?.length || 0) * 2;
    totalBytes += entry.tags.join('').length * 2;

    // Add overhead for metadata
    totalBytes += 200; // Approximate bytes for other fields
  });

  return totalBytes;
}

/**
 * Format storage size to human-readable string
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "500 KB")
 */
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 KB';

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

/**
 * Get unique tags from all entries
 * @param entries - Array of entries
 * @returns Array of unique tags
 */
export function getUniqueTags(entries: Entry[]): string[] {
  const tagsSet = new Set<string>();

  entries.forEach((entry) => {
    entry.tags.forEach((tag) => {
      tagsSet.add(tag.toLowerCase());
    });
  });

  return Array.from(tagsSet).sort();
}

/**
 * Search entries by title, body, or tags
 * @param entries - Array of entries
 * @param query - Search query
 * @returns Filtered array of entries matching the query
 */
export function searchEntries(entries: Entry[], query: string): Entry[] {
  if (!query || query.trim().length === 0) {
    return entries;
  }

  const lowerQuery = query.toLowerCase().trim();

  return entries.filter((entry) => {
    const titleMatch = entry.title.toLowerCase().includes(lowerQuery);
    const bodyMatch = entry.body.toLowerCase().includes(lowerQuery);
    const tagsMatch = entry.tags.some((tag) =>
      tag.toLowerCase().includes(lowerQuery)
    );

    return titleMatch || bodyMatch || tagsMatch;
  });
}
