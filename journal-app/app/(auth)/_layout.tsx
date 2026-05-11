/**
 * Auth Layout
 * Layout for authentication screens (lock screen)
 */

import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';

/**
 * Auth stack layout
 * Contains the lock screen and any future auth-related screens
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.primary },
        animation: 'fade',
      }}
    >
      <Stack.Screen
        name="lock"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
