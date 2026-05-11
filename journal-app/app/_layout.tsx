/**
 * Root Layout
 * Main application layout that wraps all screens with providers
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { AuthProvider } from '../context/AuthContext';
import { JournalProvider } from '../context/JournalContext';
import { isFirebaseConfigured, getFirebaseStatus } from '../services/firebase';
import { isSupabaseConfigured, getSupabaseStatus } from '../services/supabase';

/**
 * Root layout component
 * Sets up the navigation stack and global providers
 */
export default function RootLayout() {
  useEffect(() => {
    // Log initialization status on app start
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
  }, []);

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
