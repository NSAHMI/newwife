/**
 * Root Layout
 * Main application layout that wraps all screens with providers
 */

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import { AuthProvider } from '../context/AuthContext';
import { JournalProvider } from '../context/JournalContext';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { isFirebaseConfigured, getFirebaseStatus } from '../services/firebase';
import { isSupabaseConfigured, getSupabaseStatus } from '../services/supabase';

/**
 * Root layout component
 * Sets up the navigation stack and global providers
 */
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Log initialization status on app start
    try {
      const firebaseStatus = getFirebaseStatus();
      const supabaseStatus = getSupabaseStatus();

      console.log('=== Journal App Initialization ===');
      console.log('Firebase Status:', firebaseStatus);
      console.log('Supabase Status:', supabaseStatus);

      if (!isFirebaseConfigured()) {
        console.warn('Firebase is not properly configured. Check your .env.local file.');
      }

      if (!isSupabaseConfigured()) {
        console.warn('Supabase is not properly configured. Check your .env.local file.');
      }
    } catch (error) {
      console.error('Error during initialization:', error);
    }

    // Mark as ready
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <JournalProvider>
          <View style={styles.container}>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(auth)"
                options={{
                  headerShown: false,
                  animation: 'fade',
                }}
              />
              <Stack.Screen
                name="(journal)"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
          </View>
        </JournalProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
