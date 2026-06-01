import { Mood, MoodConfig } from '../types/entry';

export const COLORS = {
  primary: '#2D3142',
  accent: '#EF8354',
  background: '#F9F7F4',
  surface: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
};

export const MOOD_COLORS: Record<Mood, MoodConfig> = {
  happy: { label: 'Happy', emoji: '😊', color: '#F59E0B' },
  calm: { label: 'Calm', emoji: '😌', color: '#10B981' },
  sad: { label: 'Sad', emoji: '😢', color: '#6366F1' },
  angry: { label: 'Angry', emoji: '😠', color: '#EF4444' },
  anxious: { label: 'Anxious', emoji: '😰', color: '#8B5CF6' },
  grateful: { label: 'Grateful', emoji: '🙏', color: '#EC4899' },
};

export const FONTS = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 32,
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};
