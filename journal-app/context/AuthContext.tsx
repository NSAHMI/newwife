import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { auth, signInAnonymously } from '../services/firebase';
import { STORAGE_KEYS } from '../constants/config';
import { AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastActiveAt, setLastActiveAt] = useState<number | null>(null);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  async function checkExistingAuth() {
    try {
      const storedUserId = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
      if (storedUserId) {
        setUserId(storedUserId);
      }
    } catch (err) {
      console.error('Failed to check existing auth:', err);
    }
  }

  const unlock = useCallback(async () => {
    try {
      if (!auth.currentUser) {
        const result = await signInAnonymously(auth);
        const uid = result.user.uid;
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, uid);
        setUserId(uid);
      } else {
        setUserId(auth.currentUser.uid);
      }
      setIsAuthenticated(true);
      setLastActiveAt(Date.now());
    } catch (err) {
      console.error('Failed to unlock:', err);
      throw err;
    }
  }, []);

  const lock = useCallback(() => {
    setIsAuthenticated(false);
    setLastActiveAt(null);
  }, []);

  const refreshActivity = useCallback(() => {
    setLastActiveAt(Date.now());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        lastActiveAt,
        unlock,
        lock,
        refreshActivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
