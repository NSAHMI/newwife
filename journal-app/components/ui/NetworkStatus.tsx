/**
 * NetworkStatus Component
 * Displays a banner when the device is offline
 */

import { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import * as Network from 'expo-network';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';

interface NetworkStatusProps {
  /** Show banner in full width */
  fullWidth?: boolean;
}

/**
 * Network status banner component
 */
export function NetworkStatus({ fullWidth = true }: NetworkStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [showBanner, setShowBanner] = useState(false);
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const checkInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Check network state
   */
  const checkNetworkState = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      setIsConnected(networkState.isConnected ?? false);
    } catch (error) {
      console.error('Error checking network state:', error);
    }
  };

  useEffect(() => {
    // Initial check
    checkNetworkState();

    // Periodic check every 5 seconds
    checkInterval.current = setInterval(checkNetworkState, 5000);

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isConnected === false) {
      setShowBanner(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else if (isConnected === true && showBanner) {
      // Briefly show "back online" message
      setTimeout(() => {
        Animated.spring(slideAnim, {
          toValue: -50,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start(() => setShowBanner(false));
      }, 2000);
    }
  }, [isConnected, slideAnim, showBanner]);

  if (!showBanner) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        { transform: [{ translateY: slideAnim }] },
        isConnected && styles.containerOnline,
      ]}
    >
      <Ionicons
        name={isConnected ? 'cloud-done' : 'cloud-offline'}
        size={16}
        color={COLORS.surface}
      />
      <Text style={styles.text}>
        {isConnected ? 'Back online' : 'No internet connection'}
      </Text>
      {!isConnected && (
        <Text style={styles.subtext}>
          Changes will sync when you reconnect
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.warning,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  fullWidth: {
    width: '100%',
  },
  containerOnline: {
    backgroundColor: COLORS.success,
  },
  text: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  subtext: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.xs,
    opacity: 0.9,
  },
});

export default NetworkStatus;
