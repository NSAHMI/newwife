/**
 * Lock Screen
 * Biometric authentication gate - app entry point
 * Users must authenticate to access the journal
 */

import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

/**
 * Lock screen component
 * Displays the biometric unlock interface
 */
export default function LockScreen() {
  /**
   * Handle unlock button press
   * In Phase 2, this will trigger biometric authentication
   * For now, it navigates directly to the journal
   */
  const handleUnlock = () => {
    // TODO: Implement biometric authentication in Phase 2
    router.replace('/(journal)/');
  };

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

          {/* Unlock Button */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.unlockButton,
                pressed && styles.unlockButtonPressed,
              ]}
              onPress={handleUnlock}
            >
              <Ionicons name="finger-print" size={24} color={COLORS.primary} />
              <Text style={styles.unlockButtonText}>Unlock Journal</Text>
            </Pressable>

            <Text style={styles.fallbackText}>
              Use Face ID, Fingerprint, or Device Passcode
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
  },
  unlockButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
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
