import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { JournalProvider } from '../context/JournalContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <JournalProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)/lock" />
          <Stack.Screen name="(journal)" />
          <Stack.Screen name="entry" />
        </Stack>
      </JournalProvider>
    </AuthProvider>
  );
}
