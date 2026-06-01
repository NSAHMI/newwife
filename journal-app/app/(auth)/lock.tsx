import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useBiometric } from '../../hooks/useBiometric';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function LockScreen() {
  const router = useRouter();
  const { isAuthenticated, unlock } = useAuth();
  const { hasBiometrics, isEnrolled, authenticate, isAuthenticating, error } =
    useBiometric();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(journal)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) setAuthError(error);
  }, [error]);

  const handleUnlock = async () => {
    setAuthError(null);
    const success = await authenticate();
    if (success) {
      try {
        await unlock();
        router.replace('/(journal)');
      } catch (err) {
        setAuthError('Failed to initialize. Please try again.');
      }
    }
  };

  if (isAuthenticated) return null;

  return (
    <LinearGradient
      colors={['#2D3142', '#3D4155', '#4A4E69']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="book" size={48} color={COLORS.accent} />
          </View>
          <Text style={styles.appName}>Journal</Text>
          <Text style={styles.tagline}>Your private thoughts, secured</Text>
        </View>

        <View style={styles.lockContainer}>
          <View style={styles.lockIcon}>
            <Ionicons
              name={hasBiometrics && isEnrolled ? 'finger-print' : 'lock-closed'}
              size={64}
              color={COLORS.accent}
            />
          </View>
        </View>

        <View style={styles.bottomContainer}>
          {authError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          {!hasBiometrics && (
            <Text style={styles.warningText}>
              Biometric authentication is not available on this device.
              Please use your device passcode.
            </Text>
          )}

          {hasBiometrics && !isEnrolled && (
            <Text style={styles.warningText}>
              No biometrics enrolled. Set up Face ID or Fingerprint in your
              device settings to use Journal Lock.
            </Text>
          )}

          <TouchableOpacity
            style={[styles.unlockButton, isAuthenticating && styles.unlockButtonDisabled]}
            onPress={handleUnlock}
            disabled={isAuthenticating}
            activeOpacity={0.8}
          >
            <Text style={styles.unlockText}>
              {isAuthenticating ? 'Authenticating...' : 'Unlock Journal'}
            </Text>
          </TouchableOpacity>

          {hasBiometrics && isEnrolled && (
            <Text style={styles.hintText}>
              Use {isEnrolled ? 'Face ID or Fingerprint' : 'Device Passcode'} to
              access your journal
            </Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.huge,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.huge * 2,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: 'rgba(239, 131, 84, 0.3)',
  },
  appName: {
    fontSize: FONTS.xxxl,
    fontWeight: FONTS.bold,
    color: COLORS.surface,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: FONTS.md,
    color: 'rgba(255,255,255,0.6)',
    marginTop: SPACING.sm,
  },
  lockContainer: {
    alignItems: 'center',
  },
  lockIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239, 131, 84, 0.2)',
  },
  bottomContainer: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
  },
  warningText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FONTS.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.lg,
  },
  unlockButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    width: '100%',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  unlockButtonDisabled: {
    opacity: 0.7,
  },
  unlockText: {
    color: COLORS.surface,
    fontSize: FONTS.lg,
    fontWeight: FONTS.semibold,
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: FONTS.xs,
    textAlign: 'center',
  },
});
