/**
 * EmptyState Component
 * Displays a meaningful empty state with an action button
 * Enhanced with better visual design and animations
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

/**
 * EmptyState props
 */
interface EmptyStateProps {
  /** Icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Title text */
  title: string;
  /** Subtitle/description text */
  subtitle?: string;
  /** Button text (optional - no button if not provided) */
  buttonText?: string;
  /** Button press handler */
  onButtonPress?: () => void;
  /** Custom icon color */
  iconColor?: string;
  /** Custom icon size */
  iconSize?: number;
  /** Variant style: 'default' | 'compact' | 'illustrated' */
  variant?: 'default' | 'compact' | 'illustrated';
  /** Show decorative background elements */
  showDecoration?: boolean;
}

/**
 * Decorative floating circles for visual interest
 */
function FloatingCircle({
  size,
  color,
  position,
  delay,
}: {
  size: number;
  color: string;
  position: { top?: number; bottom?: number; left?: number; right?: number };
  delay: number;
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          delay,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.floatingCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          ...position,
          transform: [
            {
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10],
              }),
            },
          ],
          opacity: floatAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 0.6, 0.3],
          }),
        },
      ]}
    />
  );
}

/**
 * EmptyState component
 * Shows an illustrated empty state with optional action button
 */
export function EmptyState({
  icon = 'document-text-outline',
  title,
  subtitle,
  buttonText,
  onButtonPress,
  iconColor = COLORS.accent,
  iconSize = 48,
  variant = 'illustrated',
  showDecoration = true,
}: EmptyStateProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  if (variant === 'compact') {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.compactIconWrapper}>
          <Ionicons name={icon} size={32} color={iconColor} />
        </View>
        <Text style={styles.compactTitle}>{title}</Text>
        {subtitle && <Text style={styles.compactSubtitle}>{subtitle}</Text>}
        {buttonText && onButtonPress && (
          <Pressable
            style={({ pressed }) => [
              styles.compactButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onButtonPress}
          >
            <Text style={styles.compactButtonText}>{buttonText}</Text>
          </Pressable>
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Decorative floating elements */}
      {showDecoration && variant === 'illustrated' && (
        <>
          <FloatingCircle
            size={60}
            color={`${COLORS.accent}15`}
            position={{ top: 20, left: 30 }}
            delay={0}
          />
          <FloatingCircle
            size={40}
            color={`${COLORS.coolGradientStart}15`}
            position={{ top: 60, right: 40 }}
            delay={500}
          />
          <FloatingCircle
            size={30}
            color={`${COLORS.success}15`}
            position={{ bottom: 100, left: 50 }}
            delay={1000}
          />
          <FloatingCircle
            size={50}
            color={`${COLORS.warning}10`}
            position={{ bottom: 60, right: 60 }}
            delay={1500}
          />
        </>
      )}

      {/* Main content card */}
      <View style={styles.contentCard}>
        {/* Icon with gradient background */}
        <View style={styles.iconOuterWrapper}>
          <LinearGradient
            colors={[`${iconColor}20`, `${iconColor}05`]}
            style={styles.iconGradient}
          >
            <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}15` }]}>
              <Ionicons name={icon} size={iconSize} color={iconColor} />
            </View>
          </LinearGradient>
        </View>

        {/* Text content */}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        {/* Action button */}
        {buttonText && onButtonPress && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={onButtonPress}
            accessibilityLabel={buttonText}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[COLORS.accent, COLORS.accentDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={COLORS.surface}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>{buttonText}</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>

      {/* Hint text at bottom */}
      <View style={styles.hintContainer}>
        <Ionicons name="bulb-outline" size={14} color={COLORS.textTertiary} />
        <Text style={styles.hintText}>
          Writing regularly helps track your thoughts and mood patterns
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxxl,
    position: 'relative',
  },
  floatingCircle: {
    position: 'absolute',
  },
  contentCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xxxl,
    paddingTop: SPACING.xxxxl,
    paddingBottom: SPACING.xxl,
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  iconOuterWrapper: {
    marginBottom: SPACING.xl,
  },
  iconGradient: {
    borderRadius: 60,
    padding: SPACING.sm,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
    maxWidth: 280,
    paddingHorizontal: SPACING.sm,
  },
  button: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.sm,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  hintText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
  },
  // Compact variant styles
  compactContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  compactIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  compactTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  compactSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  compactButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  compactButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.surface,
  },
});

export default EmptyState;
