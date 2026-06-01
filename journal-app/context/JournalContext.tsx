import React, { createContext, useContext, useMemo } from 'react';
import { useEntries } from '../hooks/useEntries';
import { useAuth } from './AuthContext';
import { groupEntriesByMonth } from '../utils/sectionUtils';
import { Entry, EntrySection, CreateEntryData, UpdateEntryData } from '../types/entry';

interface JournalContextType {
  entries: Entry[];
  sections: EntrySection[];
  markedDates: Record<string, { marked: boolean; dotColor: string }>;
  isLoading: boolean;
  error: string | null;
  addEntry: (data: CreateEntryData) => Promise<Entry>;
  editEntry: (entryId: string, data: UpdateEntryData) => Promise<void>;
  removeEntry: (entryId: string) => Promise<void>;
  getEntry: (entryId: string) => Promise<Entry | null>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const { entries, isLoading, error, addEntry, editEntry, removeEntry, getEntry } =
    useEntries(userId);

  const sections = useMemo(() => groupEntriesByMonth(entries), [entries]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string }> = {};
    for (const entry of entries) {
      if (!marks[entry.dateKey]) {
        marks[entry.dateKey] = { marked: true, dotColor: '#EF8354' };
      }
    }
    return marks;
  }, [entries]);

  return (
    <JournalContext.Provider
      value={{
        entries,
        sections,
        markedDates,
        isLoading,
        error,
        addEntry,
        editEntry,
        removeEntry,
        getEntry,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal(): JournalContextType {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
}
