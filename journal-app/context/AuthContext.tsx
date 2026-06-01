import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants/config';
import { AuthContextType } from '../types/auth';

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 10);
  return `${ts}-${rand}`;
}

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
      let storedUserId = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
      if (!storedUserId) {
        storedUserId = generateId();
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, storedUserId);
      }

      setUserId(storedUserId);
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
