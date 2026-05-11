/**
 * useAppState Hook
 * Detects when app goes to background/foreground for re-lock logic
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/config';

/**
 * Props for useAppState hook
 */
interface UseAppStateProps {
  /** Function to call when app should be locked */
  onLock: () => void;
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;
  /** Custom timeout in milliseconds (optional) */
  timeoutMs?: number;
}

/**
 * Hook to detect app background/foreground state and trigger re-lock
 * @param props Configuration props
 */
export function useAppState({ onLock, isAuthenticated, timeoutMs }: UseAppStateProps) {
  // Ref to store the timestamp when app went to background
  const backgroundTimestampRef = useRef<number | null>(null);

  // Ref to store the current app state
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Get the configured timeout
  const timeout = timeoutMs ?? CONFIG.RE_LOCK_TIMEOUT_MS;

  /**
   * Load custom timeout from SecureStore if set
   */
  const loadCustomTimeout = useCallback(async (): Promise<number> => {
    try {
      const storedTimeout = await SecureStore.getItemAsync(
        CONFIG.SECURE_STORE_KEYS.RE_LOCK_TIMEOUT
      );
      if (storedTimeout) {
        return parseInt(storedTimeout, 10);
      }
    } catch (error) {
      console.error('Error loading custom timeout:', error);
    }
    return timeout;
  }, [timeout]);

  /**
   * Handle app state changes
   */
  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      const previousState = appStateRef.current;

      console.log(`App state changed: ${previousState} -> ${nextAppState}`);

      // App is going to background
      if (
        previousState === 'active' &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        backgroundTimestampRef.current = Date.now();
        console.log('App went to background, recording timestamp');

        // Store the timestamp in SecureStore for persistence across app kills
        try {
          await SecureStore.setItemAsync(
            CONFIG.SECURE_STORE_KEYS.LAST_ACTIVE,
            backgroundTimestampRef.current.toString()
          );
        } catch (error) {
          console.error('Error storing last active timestamp:', error);
        }
      }

      // App is coming to foreground
      if (
        nextAppState === 'active' &&
        (previousState === 'background' || previousState === 'inactive')
      ) {
        const backgroundTime = backgroundTimestampRef.current;

        if (backgroundTime && isAuthenticated) {
          const currentTimeout = await loadCustomTimeout();
          const elapsedTime = Date.now() - backgroundTime;

          console.log(
            `App returned to foreground. Elapsed: ${elapsedTime}ms, Timeout: ${currentTimeout}ms`
          );

          if (elapsedTime > currentTimeout) {
            console.log('Timeout exceeded, locking app');
            onLock();
          } else {
            console.log('Within timeout, staying authenticated');
          }
        }

        // Clear the background timestamp
        backgroundTimestampRef.current = null;
      }

      // Update the app state ref
      appStateRef.current = nextAppState;
    },
    [isAuthenticated, onLock, loadCustomTimeout]
  );

  /**
   * Check if app was killed while in background (cold start check)
   */
  const checkColdStart = useCallback(async () => {
    try {
      const storedTimestamp = await SecureStore.getItemAsync(
        CONFIG.SECURE_STORE_KEYS.LAST_ACTIVE
      );

      if (storedTimestamp) {
        const lastActiveTime = parseInt(storedTimestamp, 10);
        const currentTimeout = await loadCustomTimeout();
        const elapsedTime = Date.now() - lastActiveTime;

        console.log(
          `Cold start check. Last active: ${new Date(lastActiveTime).toISOString()}, Elapsed: ${elapsedTime}ms`
        );

        // Clear the stored timestamp
        await SecureStore.deleteItemAsync(CONFIG.SECURE_STORE_KEYS.LAST_ACTIVE);

        // If the app was killed while the timeout was exceeded, stay locked
        // (The app will already be locked on cold start, so we don't need to call onLock)
        if (elapsedTime > currentTimeout) {
          console.log('App was killed while timeout was exceeded');
          return true; // Indicates lock is required
        }
      }
    } catch (error) {
      console.error('Error checking cold start:', error);
    }

    return false; // No lock required from cold start
  }, [loadCustomTimeout]);

  /**
   * Subscribe to app state changes
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Check cold start on mount
    checkColdStart();

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange, checkColdStart]);

  return {
    currentAppState: appStateRef.current,
    checkColdStart,
  };
}

export default useAppState;
