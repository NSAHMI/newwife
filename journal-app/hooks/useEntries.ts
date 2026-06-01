import { useState, useEffect, useCallback } from 'react';
import { Entry, CreateEntryData, UpdateEntryData } from '../types/entry';
import {
  subscribeToEntries,
  createEntry as createEntryService,
  updateEntry as updateEntryService,
  deleteEntry as deleteEntryService,
  getEntry as getEntryService,
} from '../services/entryService';

export function useEntries(userId: string | null) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToEntries(
      userId,
      (fetchedEntries) => {
        setEntries(fetchedEntries);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addEntry = useCallback(
    async (data: CreateEntryData): Promise<Entry> => {
      if (!userId) throw new Error('User not authenticated');
      return createEntryService(userId, data);
    },
    [userId]
  );

  const editEntry = useCallback(
    async (entryId: string, data: UpdateEntryData): Promise<void> => {
      if (!userId) throw new Error('User not authenticated');
      return updateEntryService(userId, entryId, data);
    },
    [userId]
  );

  const removeEntry = useCallback(
    async (entryId: string): Promise<void> => {
      if (!userId) throw new Error('User not authenticated');
      return deleteEntryService(userId, entryId);
    },
    [userId]
  );

  const getEntry = useCallback(
    async (entryId: string): Promise<Entry | null> => {
      if (!userId) return null;
      return getEntryService(userId, entryId);
    },
    [userId]
  );

  return {
    entries,
    isLoading,
    error,
    addEntry,
    editEntry,
    removeEntry,
    getEntry,
  };
}
