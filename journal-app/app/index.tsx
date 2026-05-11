/**
 * App Entry Point
 * Redirects to the lock screen on app launch
 */

import { Redirect } from 'expo-router';

/**
 * Index route that redirects to the authentication lock screen
 */
export default function Index() {
  return <Redirect href="/(auth)/lock" />;
}
