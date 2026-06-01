import { Timestamp } from 'firebase/firestore';

export type Mood = 'happy' | 'calm' | 'sad' | 'angry' | 'anxious' | 'grateful';

export interface MoodConfig {
  label: string;
  emoji: string;
  color: string;
}

export interface Entry {
  id: string;
  userId: string;
  title: string;
  body: string;
  mood: Mood;
  imageUrl: string | null;
  imagePath: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dateKey: string;
  tags: string[];
  wordCount: number;
}

export interface EntrySection {
  title: string;
  monthKey: string;
  data: Entry[];
}

export interface CreateEntryData {
  title: string;
  body: string;
  mood: Mood;
  imageUrl?: string | null;
  imagePath?: string | null;
  tags?: string[];
}

export interface UpdateEntryData extends Partial<CreateEntryData> {}
