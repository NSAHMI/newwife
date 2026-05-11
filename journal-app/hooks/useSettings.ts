/**
 * useSettings Hook
 * Manages app settings stored in SecureStore
 */

import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { CONFIG, STORAGE_KEYS } from '../constants/config';

/**
 * App settings interface
 */
export interface AppSettings {
  /** Re-lock timeout in milliseconds */
  reLockTimeout: number;
  /** Whether to show mood selector in entry list */
  showMoodInList: boolean;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: AppSettings = {
  reLockTimeout: CONFIG.DEFAULT_RE_LOCK_TIMEOUT,
  showMoodInList: true,
};

/**
 * useSettings hook return type
 */
interface UseSettingsReturn {
  /** Current settings */
  settings: AppSettings;
  /** Whether settings are loading */
  isLoading: boolean;
  /** Update re-lock timeout setting */
  setReLockTimeout: (timeout: number) => Promise<void>;
  /** Update show mood in list setting */
  setShowMoodInList: (show: boolean) => Promise<void>;
  /** Reset all settings to defaults */
  resetSettings: () => Promise<void>;
  /** Get the re-lock timeout label */
  getReLockTimeoutLabel: () => string;
}

/**
 * Hook for managing app settings
 * @returns Settings state and update functions
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load settings from SecureStore on mount
   */
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load all settings from SecureStore
   */
  const loadSettings = async () => {
    try {
      const [reLockTimeoutStr, showMoodInListStr] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.RE_LOCK_TIMEOUT),
        SecureStore.getItemAsync(STORAGE_KEYS.SHOW_MOOD_IN_LIST),
      ]);

      setSettings({
        reLockTimeout: reLockTimeoutStr
          ? parseInt(reLockTimeoutStr, 10)
          : DEFAULT_SETTINGS.reLockTimeout,
        showMoodInList: showMoodInListStr
          ? showMoodInListStr === 'true'
          : DEFAULT_SETTINGS.showMoodInList,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use defaults on error
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update re-lock timeout setting
   */
  const setReLockTimeout = useCallback(async (timeout: number) => {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.RE_LOCK_TIMEOUT,
        timeout.toString()
      );
      setSettings((prev) => ({ ...prev, reLockTimeout: timeout }));
    } catch (error) {
      console.error('Error saving re-lock timeout:', error);
      throw error;
    }
  }, []);

  /**
   * Update show mood in list setting
   */
  const setShowMoodInList = useCallback(async (show: boolean) => {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.SHOW_MOOD_IN_LIST,
        show.toString()
      );
      setSettings((prev) => ({ ...prev, showMoodInList: show }));
    } catch (error) {
      console.error('Error saving show mood in list:', error);
      throw error;
    }
  }, []);

  /**
   * Reset all settings to defaults
   */
  const resetSettings = useCallback(async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.RE_LOCK_TIMEOUT),
        SecureStore.deleteItemAsync(STORAGE_KEYS.SHOW_MOOD_IN_LIST),
      ]);
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }, []);

  /**
   * Get the label for current re-lock timeout
   */
  const getReLockTimeoutLabel = useCallback((): string => {
    const option = CONFIG.RE_LOCK_OPTIONS.find(
      (opt) => opt.value === settings.reLockTimeout
    );
    return option?.label || 'Unknown';
  }, [settings.reLockTimeout]);

  return {
    settings,
    isLoading,
    setReLockTimeout,
    setShowMoodInList,
    resetSettings,
    getReLockTimeoutLabel,
  };
}

export default useSettings;
