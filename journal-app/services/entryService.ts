import { api } from './api';
import { Entry, CreateEntryData, UpdateEntryData } from '../types/entry';
import { countWords, toDateKey } from '../utils/dateUtils';

interface ApiEntry {
  id: string;
  userId: string;
  title: string;
  body: string;
  mood: string;
  imageUrl: string | null;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
  dateKey: string;
  tags: string[];
  wordCount: number;
}

function toEntry(raw: ApiEntry): Entry {
  return {
    id: raw.id,
    userId: raw.userId,
    title: raw.title,
    body: raw.body,
    mood: raw.mood as Entry['mood'],
    imageUrl: raw.imageUrl ?? null,
    imagePath: raw.imagePath ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    dateKey: raw.dateKey,
    tags: raw.tags ?? [],
    wordCount: raw.wordCount ?? 0,
  };
}

export async function createEntry(
  userId: string,
  data: CreateEntryData
): Promise<Entry> {
  const raw = await api.createEntry(userId, {
    title: data.title,
    body: data.body,
    mood: data.mood,
    imageUrl: data.imageUrl,
    imagePath: data.imagePath,
    tags: data.tags,
  });
  return toEntry(raw);
}

export async function updateEntry(
  userId: string,
  entryId: string,
  data: UpdateEntryData
): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.body !== undefined) updateData.body = data.body;
  if (data.mood !== undefined) updateData.mood = data.mood;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.imagePath !== undefined) updateData.imagePath = data.imagePath;
  if (data.tags !== undefined) updateData.tags = data.tags;

  await api.updateEntry(userId, entryId, updateData);
}

export async function deleteEntry(
  userId: string,
  entryId: string
): Promise<void> {
  await api.deleteEntry(userId, entryId);
}

export async function getEntry(
  userId: string,
  entryId: string
): Promise<Entry | null> {
  try {
    const raw = await api.getEntry(userId, entryId);
    return toEntry(raw);
  } catch {
    return null;
  }
}

export async function getEntries(userId: string): Promise<Entry[]> {
  const raw = await api.getEntries(userId);
  return raw.map(toEntry);
}

export async function deleteAllEntries(userId: string): Promise<void> {
  await api.deleteAllEntries(userId);
}

/**
 * Polling-based subscription that fetches entries at a regular interval.
 * Returns an unsubscribe function.
 */
export function subscribeToEntries(
  userId: string,
  callback: (entries: Entry[]) => void,
  onError?: (error: Error) => void
): () => void {
  let active = true;

  const poll = async () => {
    if (!active) return;
    try {
      const entries = await getEntries(userId);
      if (active) callback(entries);
    } catch (err) {
      if (active && onError) onError(err as Error);
    }
  };

  poll();
  const interval = setInterval(poll, 5000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}
