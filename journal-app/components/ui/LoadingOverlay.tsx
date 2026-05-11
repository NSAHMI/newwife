/**
 * LoadingOverlay Component
 * Full-screen loading indicator overlay
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, Z_INDEX } from '../../constants/theme';

/**
 * LoadingOverlay props
 */
interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Loading message to display */
  message?: string;
  /** Whether to use a modal (blocks interaction) */
  modal?: boolean;
}

/**
 * LoadingOverlay component
 * Shows a loading spinner with optional message
 */
export function LoadingOverlay({
  visible,
  message = 'Loading...',
  modal = true,
}: LoadingOverlayProps) {
  if (!visible) return null;

  const content = (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );

  if (modal) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        {content}
      </Modal>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    zIndex: Z_INDEX.overlay,
  },
  content: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    minWidth: 150,
  },
  message: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});

export default LoadingOverlay;
