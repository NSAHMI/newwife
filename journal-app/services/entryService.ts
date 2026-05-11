/**
 * Entry Service
 * Handles all Firestore CRUD operations for journal entries
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { Entry, CreateEntryData, UpdateEntryData } from '../types/entry';
import { countWords, toDateKey } from '../utils/dateUtils';

/**
 * Get the entries collection reference for a user
 * @param userId - The user's Firebase UID
 * @returns Collection reference
 */
const getEntriesCollection = (userId: string) => {
  return collection(db, 'users', userId, 'entries');
};

/**
 * Get a single entry document reference
 * @param userId - The user's Firebase UID
 * @param entryId - The entry document ID
 * @returns Document reference
 */
const getEntryDoc = (userId: string, entryId: string) => {
  return doc(db, 'users', userId, 'entries', entryId);
};

/**
 * Transform Firestore document to Entry type
 * @param docId - Document ID
 * @param data - Document data
 * @returns Entry object
 */
const transformEntry = (docId: string, data: DocumentData): Entry => {
  return {
    id: docId,
    userId: data.userId,
    title: data.title,
    body: data.body,
    mood: data.mood,
    imageUrl: data.imageUrl || null,
    imagePath: data.imagePath || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    dateKey: data.dateKey,
    tags: data.tags || [],
    wordCount: data.wordCount || 0,
  };
};

/**
 * Create a new journal entry
 * @param userId - The user's Firebase UID
 * @param data - Entry data to create
 * @returns Created entry with generated ID
 */
export async function createEntry(
  userId: string,
  data: CreateEntryData
): Promise<Entry> {
  const entriesCollection = getEntriesCollection(userId);
  const now = new Date();
  const wordCount = countWords(data.body);

  const entryData = {
    userId,
    title: data.title,
    body: data.body,
    mood: data.mood,
    imageUrl: data.imageUrl || null,
    imagePath: data.imagePath || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    dateKey: toDateKey(now),
    tags: data.tags || [],
    wordCount,
  };

  const docRef = await addDoc(entriesCollection, entryData);

  // Return the created entry with the generated ID
  return {
    id: docRef.id,
    userId,
    title: data.title,
    body: data.body,
    mood: data.mood,
    imageUrl: data.imageUrl || null,
    imagePath: data.imagePath || null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    dateKey: toDateKey(now),
    tags: data.tags || [],
    wordCount,
  };
}

/**
 * Update an existing journal entry
 * @param userId - The user's Firebase UID
 * @param entryId - The entry document ID
 * @param data - Entry data to update
 */
export async function updateEntry(
  userId: string,
  entryId: string,
  data: UpdateEntryData
): Promise<void> {
  const entryDoc = getEntryDoc(userId, entryId);

  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.body !== undefined) {
    updateData.body = data.body;
    updateData.wordCount = countWords(data.body);
  }

  if (data.mood !== undefined) {
    updateData.mood = data.mood;
  }

  if (data.imageUrl !== undefined) {
    updateData.imageUrl = data.imageUrl;
  }

  if (data.imagePath !== undefined) {
    updateData.imagePath = data.imagePath;
  }

  if (data.tags !== undefined) {
    updateData.tags = data.tags;
  }

  await updateDoc(entryDoc, updateData);
}

/**
 * Delete a journal entry
 * @param userId - The user's Firebase UID
 * @param entryId - The entry document ID
 */
export async function deleteEntry(userId: string, entryId: string): Promise<void> {
  const entryDoc = getEntryDoc(userId, entryId);
  await deleteDoc(entryDoc);
}

/**
 * Get a single journal entry
 * @param userId - The user's Firebase UID
 * @param entryId - The entry document ID
 * @returns Entry or null if not found
 */
export async function getEntry(
  userId: string,
  entryId: string
): Promise<Entry | null> {
  const entryDoc = getEntryDoc(userId, entryId);
  const docSnap = await getDoc(entryDoc);

  if (!docSnap.exists()) {
    return null;
  }

  return transformEntry(docSnap.id, docSnap.data());
}

/**
 * Subscribe to all entries for a user with real-time updates
 * @param userId - The user's Firebase UID
 * @param onEntriesChange - Callback function when entries change
 * @param onError - Callback function when an error occurs
 * @returns Unsubscribe function
 */
export function subscribeToEntries(
  userId: string,
  onEntriesChange: (entries: Entry[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const entriesCollection = getEntriesCollection(userId);

  // Query entries ordered by createdAt descending
  const entriesQuery = query(
    entriesCollection,
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(
    entriesQuery,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const entries: Entry[] = [];
      snapshot.forEach((doc) => {
        entries.push(transformEntry(doc.id, doc.data()));
      });
      onEntriesChange(entries);
    },
    (error) => {
      console.error('Error subscribing to entries:', error);
      onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Get entries for a specific date
 * @param userId - The user's Firebase UID
 * @param dateKey - Date in "YYYY-MM-DD" format
 * @param onEntriesChange - Callback function when entries change
 * @param onError - Callback function when an error occurs
 * @returns Unsubscribe function
 */
export function subscribeToEntriesByDate(
  userId: string,
  dateKey: string,
  onEntriesChange: (entries: Entry[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const entriesCollection = getEntriesCollection(userId);

  // Query entries for specific date
  const entriesQuery = query(
    entriesCollection,
    where('dateKey', '==', dateKey),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(
    entriesQuery,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const entries: Entry[] = [];
      snapshot.forEach((doc) => {
        entries.push(transformEntry(doc.id, doc.data()));
      });
      onEntriesChange(entries);
    },
    (error) => {
      console.error('Error subscribing to entries by date:', error);
      onError(error);
    }
  );

  return unsubscribe;
}
