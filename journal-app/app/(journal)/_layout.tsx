/**
 * Journal Layout
 * Tab navigator layout for the main journal screens
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';

/**
 * Icon component props
 */
type TabIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

/**
 * Journal tab navigator layout
 * Contains Home, Calendar, New Entry, and Settings tabs
 */
export default function JournalLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: FONT_SIZES.lg,
          color: COLORS.textPrimary,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: SPACING.sm,
          paddingBottom: SPACING.sm,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Journal',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new-entry"
        options={{
          title: 'New Entry',
          tabBarLabel: 'Write',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      {/* Entry detail and edit screens - hidden from tabs */}
      <Tabs.Screen
        name="entry/[id]"
        options={{
          href: null, // Hide from tab bar
          title: 'Entry',
        }}
      />
      <Tabs.Screen
        name="entry/edit/[id]"
        options={{
          href: null, // Hide from tab bar
          title: 'Edit Entry',
        }}
      />
    </Tabs>
  );
}
