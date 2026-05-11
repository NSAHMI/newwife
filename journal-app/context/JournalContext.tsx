/**
 * JournalContext
 * Provides journal entries state and CRUD actions throughout the app
 * Manages real-time Firestore synchronization
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { Unsubscribe } from 'firebase/firestore';
import {
  Entry,
  EntrySection,
  CreateEntryData,
  UpdateEntryData,
  MarkedDates,
} from '../types/entry';
import { useAuth } from './AuthContext';
import {
  createEntry as createEntryService,
  updateEntry as updateEntryService,
  deleteEntry as deleteEntryService,
  getEntry as getEntryService,
  subscribeToEntries,
} from '../services/entryService';
import { deleteImage } from '../services/mediaService';
import { groupEntriesByMonth, generateMarkedDates } from '../utils/sectionUtils';

/**
 * Journal state interface
 */
interface JournalState {
  entries: Entry[];
  sections: EntrySection[];
  markedDates: MarkedDates;
  isLoading: boolean;
  error: string | null;
}

/**
 * Journal context actions
 */
interface JournalActions {
  addEntry: (data: CreateEntryData) => Promise<Entry>;
  editEntry: (entryId: string, data: UpdateEntryData) => Promise<void>;
  removeEntry: (entryId: string) => Promise<void>;
  getEntry: (entryId: string) => Promise<Entry | null>;
  refreshEntries: () => void;
  clearError: () => void;
}

/**
 * Combined journal context value
 */
interface JournalContextValue extends JournalState, JournalActions {}

/**
 * Initial journal state
 */
const initialState: JournalState = {
  entries: [],
  sections: [],
  markedDates: {},
  isLoading: true,
  error: null,
};

/**
 * Journal action types
 */
type JournalAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ENTRIES'; payload: Entry[] }
  | { type: 'ADD_ENTRY'; payload: Entry }
  | { type: 'UPDATE_ENTRY'; payload: { id: string; data: Partial<Entry> } }
  | { type: 'REMOVE_ENTRY'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

/**
 * Journal reducer function
 */
function journalReducer(state: JournalState, action: JournalAction): JournalState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ENTRIES': {
      const entries = action.payload;
      const sections = groupEntriesByMonth(entries);
      const markedDates = generateMarkedDates(entries);
      return {
        ...state,
        entries,
        sections,
        markedDates,
        isLoading: false,
        error: null,
      };
    }

    case 'ADD_ENTRY': {
      const entries = [action.payload, ...state.entries];
      const sections = groupEntriesByMonth(entries);
      const markedDates = generateMarkedDates(entries);
      return {
        ...state,
        entries,
        sections,
        markedDates,
      };
    }

    case 'UPDATE_ENTRY': {
      const entries = state.entries.map((entry) =>
        entry.id === action.payload.id
          ? { ...entry, ...action.payload.data }
          : entry
      );
      const sections = groupEntriesByMonth(entries);
      const markedDates = generateMarkedDates(entries);
      return {
        ...state,
        entries,
        sections,
        markedDates,
      };
    }

    case 'REMOVE_ENTRY': {
      const entries = state.entries.filter((entry) => entry.id !== action.payload);
      const sections = groupEntriesByMonth(entries);
      const markedDates = generateMarkedDates(entries);
      return {
        ...state,
        entries,
        sections,
        markedDates,
      };
    }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

/**
 * Journal context
 */
const JournalContext = createContext<JournalContextValue | undefined>(undefined);

/**
 * Journal provider props
 */
interface JournalProviderProps {
  children: React.ReactNode;
}

/**
 * Journal provider component
 * Wraps the app and provides journal entries state and actions
 */
export function JournalProvider({ children }: JournalProviderProps) {
  const [state, dispatch] = useReducer(journalReducer, initialState);
  const { userId, isAuthenticated } = useAuth();

  /**
   * Subscribe to entries when authenticated
   */
  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    if (isAuthenticated && userId) {
      dispatch({ type: 'SET_LOADING', payload: true });

      unsubscribe = subscribeToEntries(
        userId,
        (entries) => {
          dispatch({ type: 'SET_ENTRIES', payload: entries });
        },
        (error) => {
          console.error('Error subscribing to entries:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
        }
      );

      console.log('Subscribed to Firestore entries');
    } else {
      // Clear entries when not authenticated
      dispatch({ type: 'SET_ENTRIES', payload: [] });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('Unsubscribed from Firestore entries');
      }
    };
  }, [isAuthenticated, userId]);

  /**
   * Add a new entry
   */
  const addEntry = useCallback(
    async (data: CreateEntryData): Promise<Entry> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const entry = await createEntryService(userId, data);

        // Optimistically add to local state
        // (will be updated by Firestore listener anyway)
        dispatch({ type: 'ADD_ENTRY', payload: entry });

        return entry;
      } catch (error) {
        console.error('Error creating entry:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to create entry',
        });
        throw error;
      }
    },
    [userId]
  );

  /**
   * Edit an existing entry
   */
  const editEntry = useCallback(
    async (entryId: string, data: UpdateEntryData): Promise<void> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Store original entry for rollback
      const originalEntry = state.entries.find((e) => e.id === entryId);

      try {
        // Optimistically update local state
        dispatch({ type: 'UPDATE_ENTRY', payload: { id: entryId, data } });

        await updateEntryService(userId, entryId, data);
      } catch (error) {
        console.error('Error updating entry:', error);

        // Rollback on error
        if (originalEntry) {
          dispatch({ type: 'UPDATE_ENTRY', payload: { id: entryId, data: originalEntry } });
        }

        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to update entry',
        });
        throw error;
      }
    },
    [userId, state.entries]
  );

  /**
   * Remove an entry
   */
  const removeEntry = useCallback(
    async (entryId: string): Promise<void> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get entry to check for image
      const entry = state.entries.find((e) => e.id === entryId);

      try {
        // Optimistically remove from local state
        dispatch({ type: 'REMOVE_ENTRY', payload: entryId });

        // Delete from Firestore
        await deleteEntryService(userId, entryId);

        // Delete associated image from Supabase if exists
        if (entry?.imagePath) {
          try {
            await deleteImage(entry.imagePath);
          } catch (imageError) {
            console.warn('Failed to delete image:', imageError);
            // Don't throw - entry is already deleted
          }
        }
      } catch (error) {
        console.error('Error deleting entry:', error);

        // Rollback on error
        if (entry) {
          dispatch({ type: 'ADD_ENTRY', payload: entry });
        }

        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to delete entry',
        });
        throw error;
      }
    },
    [userId, state.entries]
  );

  /**
   * Get a single entry by ID
   */
  const getEntry = useCallback(
    async (entryId: string): Promise<Entry | null> => {
      // First check local state
      const localEntry = state.entries.find((e) => e.id === entryId);
      if (localEntry) {
        return localEntry;
      }

      // If not in local state, fetch from Firestore
      if (!userId) {
        return null;
      }

      try {
        return await getEntryService(userId, entryId);
      } catch (error) {
        console.error('Error fetching entry:', error);
        return null;
      }
    },
    [userId, state.entries]
  );

  /**
   * Manually refresh entries (re-subscribe)
   */
  const refreshEntries = useCallback(() => {
    // The useEffect will handle re-subscription when dependencies change
    // This is mainly for forcing a refresh if needed
    dispatch({ type: 'SET_LOADING', payload: true });
  }, []);

  /**
   * Clear any errors
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  /**
   * Context value
   */
  const contextValue: JournalContextValue = useMemo(
    () => ({
      // State
      entries: state.entries,
      sections: state.sections,
      markedDates: state.markedDates,
      isLoading: state.isLoading,
      error: state.error,

      // Actions
      addEntry,
      editEntry,
      removeEntry,
      getEntry,
      refreshEntries,
      clearError,
    }),
    [
      state.entries,
      state.sections,
      state.markedDates,
      state.isLoading,
      state.error,
      addEntry,
      editEntry,
      removeEntry,
      getEntry,
      refreshEntries,
      clearError,
    ]
  );

  return (
    <JournalContext.Provider value={contextValue}>
      {children}
    </JournalContext.Provider>
  );
}

/**
 * Hook to access journal context
 * @throws Error if used outside of JournalProvider
 */
export function useJournal(): JournalContextValue {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
}

export default JournalContext;
