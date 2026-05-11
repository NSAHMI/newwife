/**
 * BiometricGate Component
 * Wraps journal screens and enforces authentication on foreground
 * Handles automatic re-lock when app returns from background after timeout
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../hooks/useAppState';
import { COLORS } from '../../constants/theme';

/**
 * BiometricGate props
 */
interface BiometricGateProps {
  /** Children to render when authenticated */
  children: React.ReactNode;
}

/**
 * BiometricGate component
 * Protects journal screens by checking authentication state
 * Automatically locks when app returns from background after timeout
 */
export function BiometricGate({ children }: BiometricGateProps) {
  const { isAuthenticated, lock, isAuthenticating } = useAuth();

  /**
   * Handle app state changes for re-lock logic
   */
  useAppState({
    onLock: lock,
    isAuthenticated,
  });

  /**
   * Redirect to lock screen if not authenticated
   */
  useEffect(() => {
    if (!isAuthenticated && !isAuthenticating) {
      console.log('BiometricGate: Not authenticated, redirecting to lock screen');
      router.replace('/(auth)/lock');
    }
  }, [isAuthenticated, isAuthenticating]);

  // Show loading while checking authentication
  if (isAuthenticating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default BiometricGate;
