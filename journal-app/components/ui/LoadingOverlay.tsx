import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ message, fullScreen = true }: LoadingOverlayProps) {
  if (!fullScreen) {
    return (
      <View style={styles.inline}>
        <ActivityIndicator size="small" color={COLORS.accent} />
        {message && <Text style={styles.inlineText}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.lg,
    ...SHADOWS.lg,
  },
  message: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  inlineText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
});
