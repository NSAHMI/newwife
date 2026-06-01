import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { CONFIG, STORAGE_KEYS } from '../constants/config';
import * as SecureStore from 'expo-secure-store';

export function useAppState(onReturnFromBackground: () => void) {
  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  async function handleAppStateChange(nextState: AppStateStatus) {
    if (appState.current.match(/inactive|background/) && nextState === 'active') {
      const now = Date.now();
      const lastBackground = backgroundTime.current;

      if (lastBackground) {
        const elapsed = now - lastBackground;
        const timeoutStr = await SecureStore.getItemAsync(STORAGE_KEYS.RE_LOCK_TIMEOUT);
        const timeout = timeoutStr ? parseInt(timeoutStr, 10) : CONFIG.RE_LOCK_TIMEOUT_MS;

        if (elapsed >= timeout) {
          onReturnFromBackground();
        }
      }
    }

    if (nextState.match(/inactive|background/)) {
      backgroundTime.current = Date.now();
    }

    appState.current = nextState;
  }
}
