import { format, isToday, isYesterday, parseISO } from 'date-fns';

export function formatDate(date: Date | { toDate: () => Date }): string {
  const d = 'toDate' in date ? date.toDate() : date;
  return format(d, 'EEEE, MMMM d, yyyy');
}

export function formatShortDate(date: Date | { toDate: () => Date }): string {
  const d = 'toDate' in date ? date.toDate() : date;
  return format(d, 'MMM d');
}

export function formatTime(date: Date | { toDate: () => Date }): string {
  const d = 'toDate' in date ? date.toDate() : date;
  return format(d, 'h:mm a');
}

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getSectionTitle(dateKey: string): string {
  const date = parseISO(dateKey);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM yyyy');
}

export function getMonthKey(dateKey: string): string {
  return dateKey.substring(0, 7);
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function getReadTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 200);
  if (minutes < 1) return 'Less than 1 min read';
  return `${minutes} min read`;
}
