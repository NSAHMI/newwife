import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Entry, CreateEntryData, UpdateEntryData } from '../types/entry';
import { countWords } from '../utils/dateUtils';
import { toDateKey } from '../utils/dateUtils';

function getEntriesCollection(userId: string) {
  return collection(db, 'users', userId, 'entries');
}

function getEntryRef(userId: string, entryId: string) {
  return doc(db, 'users', userId, 'entries', entryId);
}

function docToEntry(docSnap: DocumentData): Entry {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    userId: data.userId,
    title: data.title,
    body: data.body,
    mood: data.mood,
    imageUrl: data.imageUrl ?? null,
    imagePath: data.imagePath ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    dateKey: data.dateKey,
    tags: data.tags ?? [],
    wordCount: data.wordCount ?? 0,
  };
}

export async function createEntry(
  userId: string,
  data: CreateEntryData
): Promise<Entry> {
  const now = Timestamp.now();
  const dateKey = toDateKey(new Date());
  const wordCount = countWords(data.body);

  const docRef = await addDoc(getEntriesCollection(userId), {
    userId,
    title: data.title,
    body: data.body,
    mood: data.mood,
    imageUrl: data.imageUrl ?? null,
    imagePath: data.imagePath ?? null,
    createdAt: now,
    updatedAt: now,
    dateKey,
    tags: data.tags ?? [],
    wordCount,
  });

  return {
    id: docRef.id,
    userId,
    title: data.title,
    body: data.body,
    mood: data.mood,
    imageUrl: data.imageUrl ?? null,
    imagePath: data.imagePath ?? null,
    createdAt: now,
    updatedAt: now,
    dateKey,
    tags: data.tags ?? [],
    wordCount,
  };
}

export async function updateEntry(
  userId: string,
  entryId: string,
  data: UpdateEntryData
): Promise<void> {
  const updateData: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.body !== undefined) {
    updateData.body = data.body;
    updateData.wordCount = countWords(data.body);
  }
  if (data.mood !== undefined) updateData.mood = data.mood;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.imagePath !== undefined) updateData.imagePath = data.imagePath;
  if (data.tags !== undefined) updateData.tags = data.tags;

  await updateDoc(getEntryRef(userId, entryId), updateData);
}

export async function deleteEntry(
  userId: string,
  entryId: string
): Promise<void> {
  await deleteDoc(getEntryRef(userId, entryId));
}

export async function getEntry(
  userId: string,
  entryId: string
): Promise<Entry | null> {
  const docSnap = await getDoc(getEntryRef(userId, entryId));
  if (!docSnap.exists()) return null;
  return docToEntry(docSnap);
}

export async function getEntries(userId: string): Promise<Entry[]> {
  const q = query(
    getEntriesCollection(userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToEntry);
}

export function subscribeToEntries(
  userId: string,
  callback: (entries: Entry[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    getEntriesCollection(userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const entries = snapshot.docs.map(docToEntry);
      callback(entries);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function getEntriesByDate(
  userId: string,
  dateKey: string
): Promise<Entry[]> {
  const entries = await getEntries(userId);
  return entries.filter((entry) => entry.dateKey === dateKey);
}
