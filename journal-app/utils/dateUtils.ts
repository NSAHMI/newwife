import { format, isToday, isYesterday, parseISO } from 'date-fns';

function toDate(date: Date | string): Date {
  if (typeof date === 'string') return parseISO(date);
  return date;
}

export function formatDate(date: Date | string): string {
  return format(toDate(date), 'EEEE, MMMM d, yyyy');
}

export function formatShortDate(date: Date | string): string {
  return format(toDate(date), 'MMM d');
}

export function formatTime(date: Date | string): string {
  return format(toDate(date), 'h:mm a');
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
