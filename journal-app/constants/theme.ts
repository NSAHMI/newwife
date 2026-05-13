/**
 * Design System Theme Constants
 * Contains all colors, typography, spacing, and mood configurations for the Journal App
 */

/**
 * Primary color palette for the application
 */
export const COLORS = {
  // Primary brand colors
  primary: '#2D3142',      // Deep navy - main brand color
  primaryLight: '#3D4156', // Lighter navy for hover states
  primaryDark: '#1D2132',  // Darker navy for pressed states
  accent: '#EF8354',       // Warm orange - accent/CTA color
  accentLight: '#F4A785',  // Light orange for backgrounds
  accentDark: '#D86B3D',   // Dark orange for pressed states

  // Background colors
  background: '#F9F7F4',   // Warm off-white - main background
  backgroundSecondary: '#F3F0EC', // Slightly darker for contrast
  surface: '#FFFFFF',      // Pure white - cards, modals
  surfaceElevated: '#FEFEFE', // Slightly elevated surface

  // Text colors
  textPrimary: '#1A1A2E',  // Near black - primary text
  textSecondary: '#6B7280', // Gray - secondary/muted text
  textTertiary: '#9CA3AF', // Lighter gray for hints
  textInverse: '#FFFFFF',  // White text on dark backgrounds

  // UI colors
  border: '#E5E7EB',       // Light gray - borders, dividers
  borderLight: '#F3F4F6',  // Very light border
  error: '#DC2626',        // Red - error states
  errorLight: '#FEE2E2',   // Light red background
  success: '#10B981',      // Green - success states
  successLight: '#D1FAE5', // Light green background
  warning: '#F59E0B',      // Amber - warning states
  warningLight: '#FEF3C7', // Light amber background
  info: '#3B82F6',         // Blue - info states
  infoLight: '#DBEAFE',    // Light blue background

  // Lock screen gradient colors
  gradientStart: '#2D3142',
  gradientMiddle: '#3D4A5C',
  gradientEnd: '#4A5568',

  // Additional gradients for visual interest
  warmGradientStart: '#EF8354',
  warmGradientEnd: '#F59E0B',
  coolGradientStart: '#6366F1',
  coolGradientEnd: '#8B5CF6',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // Card backgrounds with subtle colors
  cardWarm: '#FFF8F5',
  cardCool: '#F5F7FF',
  cardNeutral: '#F8F9FA',
} as const;

/**
 * Mood colors and configurations
 * Each mood has a unique color, emoji, and label
 */
export const MOOD_COLORS = {
  happy: '#F59E0B',    // Amber
  calm: '#10B981',     // Green
  sad: '#6366F1',      // Indigo
  angry: '#EF4444',    // Red
  anxious: '#8B5CF6',  // Purple
  grateful: '#EC4899', // Pink
} as const;

/**
 * Complete mood configuration with emoji and labels
 */
export const MOOD_CONFIG = {
  happy: {
    label: 'Happy',
    emoji: '😊',
    color: MOOD_COLORS.happy,
  },
  calm: {
    label: 'Calm',
    emoji: '😌',
    color: MOOD_COLORS.calm,
  },
  sad: {
    label: 'Sad',
    emoji: '😢',
    color: MOOD_COLORS.sad,
  },
  angry: {
    label: 'Angry',
    emoji: '😠',
    color: MOOD_COLORS.angry,
  },
  anxious: {
    label: 'Anxious',
    emoji: '😰',
    color: MOOD_COLORS.anxious,
  },
  grateful: {
    label: 'Grateful',
    emoji: '🙏',
    color: MOOD_COLORS.grateful,
  },
} as const;

/**
 * Font size scale
 * xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26, xxxl: 32
 */
export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 32,
} as const;

/**
 * Font weight constants
 */
export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/**
 * Spacing scale (in pixels)
 * Based on 4px grid system
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
  xxxxxl: 48,
} as const;

/**
 * Border radius values
 */
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

/**
 * Shadow presets for different elevation levels
 */
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/**
 * Animation duration constants (in milliseconds)
 */
export const ANIMATION = {
  instant: 100,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

/**
 * Gradient presets for consistent styling
 */
export const GRADIENTS = {
  primary: [COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd],
  warm: [COLORS.warmGradientStart, COLORS.warmGradientEnd],
  cool: [COLORS.coolGradientStart, COLORS.coolGradientEnd],
  sunset: ['#FF6B6B', '#FFA07A', '#FFD93D'],
  ocean: ['#4FACFE', '#00F2FE'],
  forest: ['#134E5E', '#71B280'],
  lavender: ['#E0C3FC', '#8EC5FC'],
} as const;

/**
 * Z-index layers for stacking context
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  toast: 40,
  overlay: 50,
} as const;
