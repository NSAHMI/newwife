/**
 * AuthContext
 * Provides authentication state and actions throughout the app
 * Manages user authentication state, Firebase anonymous auth, and re-lock logic
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { signInAnonymously, User } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../services/firebase';
import { CONFIG } from '../constants/config';
import { AuthState, AuthContextValue } from '../types/auth';

/**
 * Initial authentication state
 */
const initialState: AuthState = {
  isAuthenticated: false,
  lastActiveAt: null,
  userId: null,
  isAuthenticating: false,
  error: null,
};

/**
 * Auth action types
 */
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { userId: string } }
  | { type: 'AUTH_FAILURE'; payload: { error: string } }
  | { type: 'LOCK' }
  | { type: 'REFRESH_ACTIVITY' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_SESSION'; payload: { userId: string } };

/**
 * Auth reducer function
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isAuthenticating: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isAuthenticating: false,
        userId: action.payload.userId,
        lastActiveAt: Date.now(),
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticating: false,
        error: action.payload.error,
      };
    case 'LOCK':
      return {
        ...state,
        isAuthenticated: false,
        lastActiveAt: null,
      };
    case 'REFRESH_ACTIVITY':
      return {
        ...state,
        lastActiveAt: Date.now(),
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESTORE_SESSION':
      return {
        ...state,
        userId: action.payload.userId,
      };
    default:
      return state;
  }
}

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth provider component
 * Wraps the app and provides authentication state and actions
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Restore user ID from SecureStore on mount
   */
  useEffect(() => {
    restoreUserId();
  }, []);

  /**
   * Restore user ID from secure storage
   */
  const restoreUserId = async (): Promise<void> => {
    try {
      const storedUserId = await SecureStore.getItemAsync(CONFIG.SECURE_STORE_KEYS.USER_ID);
      if (storedUserId) {
        dispatch({ type: 'RESTORE_SESSION', payload: { userId: storedUserId } });
        console.log('Restored user ID from secure storage');
      }
    } catch (error) {
      console.error('Error restoring user ID:', error);
    }
  };

  /**
   * Unlock the app after successful biometric authentication
   * Signs in anonymously to Firebase and stores the user ID
   */
  const unlock = useCallback(async (): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Check if we already have a stored user ID
      const storedUserId = await SecureStore.getItemAsync(CONFIG.SECURE_STORE_KEYS.USER_ID);

      let userId: string;

      if (storedUserId && auth.currentUser?.uid === storedUserId) {
        // Use existing session
        userId = storedUserId;
        console.log('Using existing Firebase session');
      } else {
        // Sign in anonymously to Firebase
        const userCredential = await signInAnonymously(auth);
        userId = userCredential.user.uid;

        // Store user ID in secure storage
        await SecureStore.setItemAsync(CONFIG.SECURE_STORE_KEYS.USER_ID, userId);
        console.log('Created new anonymous Firebase session');
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: { userId } });
    } catch (error) {
      console.error('Error during unlock:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: {
          error: error instanceof Error ? error.message : 'Failed to authenticate',
        },
      });
    }
  }, []);

  /**
   * Lock the app and require re-authentication
   */
  const lock = useCallback((): void => {
    dispatch({ type: 'LOCK' });
    console.log('App locked');
  }, []);

  /**
   * Update the last active timestamp
   * Called when user interacts with the app
   */
  const refreshActivity = useCallback((): void => {
    dispatch({ type: 'REFRESH_ACTIVITY' });
  }, []);

  /**
   * Clear any authentication errors
   */
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  /**
   * Context value
   */
  const contextValue: AuthContextValue = {
    // State
    isAuthenticated: state.isAuthenticated,
    lastActiveAt: state.lastActiveAt,
    userId: state.userId,
    isAuthenticating: state.isAuthenticating,
    error: state.error,

    // Actions
    unlock,
    lock,
    refreshActivity,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
