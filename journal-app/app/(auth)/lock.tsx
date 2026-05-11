/**
 * Lock Screen
 * Biometric authentication gate - app entry point
 * Users must authenticate to access the journal
 */

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useBiometric } from '../../hooks/useBiometric';
import { useAuth } from '../../context/AuthContext';

/**
 * Lock screen component
 * Displays the biometric unlock interface with smooth animations
 */
export default function LockScreen() {
  const [error, setError] = useState<string | null>(null);
  const [showNotEnrolled, setShowNotEnrolled] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lockAnim = useRef(new Animated.Value(0)).current;

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
   * Entrance animation on mount
   */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Start pulse animation for lock icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [fadeAnim, slideAnim, pulseAnim]);

  /**
   * Redirect to journal if already authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      // Animate out before navigating
      Animated.timing(lockAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/(journal)/');
      });
    }
  }, [isAuthenticated, lockAnim]);

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
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                {
                  scale: lockAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.9],
                  }),
                },
              ],
            },
          ]}
        >
          {/* App Logo/Icon Area */}
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="book" size={48} color={COLORS.accent} />
            </View>
            <Text style={styles.appName}>Journal</Text>
            <Text style={styles.tagline}>Your private thoughts, secured</Text>
          </View>

          {/* Lock Icon with Pulse Animation */}
          <Animated.View
            style={[
              styles.lockIconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.lockCircle}>
              <Ionicons name="lock-closed" size={48} color={COLORS.surface} />
            </View>
          </Animated.View>

          {/* Status Messages */}
          <View style={styles.messageContainer}>
            {/* Error Message */}
            {(error || authError) && (
              <Animated.View
                style={[
                  styles.errorContainer,
                  { opacity: fadeAnim },
                ]}
              >
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{error || authError}</Text>
              </Animated.View>
            )}

            {/* Not Enrolled Warning */}
            {showNotEnrolled && !error && (
              <Animated.View
                style={[
                  styles.warningContainer,
                  { opacity: fadeAnim },
                ]}
              >
                <Ionicons name="warning" size={20} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  Set up Face ID or Fingerprint in your device settings to use Journal Lock.
                </Text>
              </Animated.View>
            )}
          </View>

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
                  <View style={styles.buttonIconContainer}>
                    <Ionicons name={getBiometricIcon()} size={24} color={COLORS.surface} />
                  </View>
                  <Text style={styles.unlockButtonText}>{getButtonText()}</Text>
                </>
              )}
            </Pressable>

            <Text style={styles.fallbackText}>
              {hasBiometrics && isEnrolled
                ? `Tap to use ${getPrimaryBiometricType()}`
                : 'Biometric authentication required'}
            </Text>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
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
    marginTop: SPACING.xxxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  appName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.surface,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  lockIconContainer: {
    marginVertical: SPACING.xl,
  },
  lockCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  messageContainer: {
    width: '100%',
    minHeight: 80,
    justifyContent: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.error}20`,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
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
    marginBottom: SPACING.lg,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    gap: SPACING.md,
    minHeight: 60,
    ...SHADOWS.md,
  },
  unlockButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  unlockButtonDisabled: {
    opacity: 0.7,
  },
  buttonIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.surface,
  },
  fallbackText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  footerDivider: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
});
