/**
 * Lock Screen
 * Biometric authentication gate - app entry point
 * Users must authenticate to access the journal
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { useBiometric } from '../../hooks/useBiometric';
import { useAuth } from '../../context/AuthContext';

/**
 * Lock screen component
 * Displays the biometric unlock interface
 */
export default function LockScreen() {
  const [error, setError] = useState<string | null>(null);
  const [showNotEnrolled, setShowNotEnrolled] = useState(false);

  const {
    hasBiometrics,
    isEnrolled,
    isAuthenticating,
    isLoading: isBiometricLoading,
    authenticate,
    getPrimaryBiometricType,
  } = useBiometric();

  const {
    isAuthenticated,
    isAuthenticating: isUnlocking,
    unlock,
    error: authError,
    clearError,
  } = useAuth();

  /**
   * Redirect to journal if already authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(journal)/');
    }
  }, [isAuthenticated]);

  /**
   * Show biometrics not enrolled warning
   */
  useEffect(() => {
    if (!isBiometricLoading && hasBiometrics && !isEnrolled) {
      setShowNotEnrolled(true);
    }
  }, [isBiometricLoading, hasBiometrics, isEnrolled]);

  /**
   * Handle unlock button press
   * Triggers biometric authentication, then Firebase sign in
   */
  const handleUnlock = async () => {
    setError(null);
    clearError();

    // If biometrics not enrolled, show message
    if (!isEnrolled) {
      setShowNotEnrolled(true);
      return;
    }

    // Authenticate with biometrics
    const result = await authenticate();

    if (result.success) {
      // Biometric auth successful, now unlock (Firebase sign in)
      await unlock();
    } else if (result.warning) {
      setShowNotEnrolled(true);
    } else if (result.error) {
      setError(result.error);
    }
  };

  /**
   * Get the appropriate icon based on biometric type
   */
  const getBiometricIcon = (): keyof typeof Ionicons.glyphMap => {
    const primaryType = getPrimaryBiometricType();
    if (primaryType === 'Face ID') {
      return 'scan-outline';
    }
    return 'finger-print';
  };

  /**
   * Get button text based on biometric type
   */
  const getButtonText = (): string => {
    if (isBiometricLoading) return 'Loading...';
    if (!hasBiometrics) return 'Use Device Passcode';
    const primaryType = getPrimaryBiometricType();
    return `Unlock with ${primaryType}`;
  };

  const isProcessing = isAuthenticating || isUnlocking || isBiometricLoading;

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* App Logo/Icon Area */}
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="book" size={48} color={COLORS.accent} />
            </View>
            <Text style={styles.appName}>Journal</Text>
            <Text style={styles.tagline}>Your private thoughts, secured</Text>
          </View>

          {/* Lock Icon */}
          <View style={styles.lockIconContainer}>
            <Ionicons name="lock-closed" size={64} color={COLORS.surface} />
          </View>

          {/* Error Message */}
          {(error || authError) && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error || authError}</Text>
            </View>
          )}

          {/* Not Enrolled Warning */}
          {showNotEnrolled && !error && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={20} color={COLORS.warning} />
              <Text style={styles.warningText}>
                Set up Face ID or Fingerprint in your device settings to use Journal Lock.
              </Text>
            </View>
          )}

          {/* Unlock Button */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.unlockButton,
                pressed && styles.unlockButtonPressed,
                isProcessing && styles.unlockButtonDisabled,
              ]}
              onPress={handleUnlock}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <>
                  <Ionicons name={getBiometricIcon()} size={24} color={COLORS.primary} />
                  <Text style={styles.unlockButtonText}>{getButtonText()}</Text>
                </>
              )}
            </Pressable>

            <Text style={styles.fallbackText}>
              {hasBiometrics && isEnrolled
                ? `Use ${getPrimaryBiometricType()} or Device Passcode`
                : 'Biometric authentication required'}
            </Text>
          </View>
        </View>

        {/* Version Info */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xxxxxl,
    paddingHorizontal: SPACING.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.xxxxxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  appName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  lockIconContainer: {
    opacity: 0.3,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.error}20`,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.surface,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}20`,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    maxWidth: '100%',
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.surface,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    gap: SPACING.md,
    minHeight: 56,
  },
  unlockButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  unlockButtonDisabled: {
    opacity: 0.7,
  },
  unlockButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  fallbackText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    paddingBottom: SPACING.lg,
  },
});
