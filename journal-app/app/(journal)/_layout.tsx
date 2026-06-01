import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';
import { BiometricGate } from '../../components/auth/BiometricGate';

export default function JournalLayout() {
  return (
    <BiometricGate>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.borderLight,
            height: 88,
            paddingBottom: 28,
          },
          tabBarLabelStyle: {
            fontSize: FONTS.xs,
            fontWeight: FONTS.medium,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Journal',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="new-entry"
          options={{
            title: 'New Entry',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="create" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </BiometricGate>
  );
}
