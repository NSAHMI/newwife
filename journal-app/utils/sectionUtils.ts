import { Entry, EntrySection } from '../types/entry';
import { getMonthKey, getSectionTitle } from './dateUtils';

export function groupEntriesByMonth(entries: Entry[]): EntrySection[] {
  const grouped = new Map<string, Entry[]>();

  const sortedEntries = [...entries].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });

  for (const entry of sortedEntries) {
    const monthKey = getMonthKey(entry.dateKey);
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(entry);
  }

  const sections: EntrySection[] = [];
  for (const [monthKey, sectionEntries] of grouped) {
    sections.push({
      title: getSectionTitle(sectionEntries[0].dateKey),
      monthKey,
      data: sectionEntries,
    });
  }

  return sections;
}

export function getEntriesForDate(entries: Entry[], dateKey: string): Entry[] {
  return entries
    .filter((entry) => entry.dateKey === dateKey)
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
}
