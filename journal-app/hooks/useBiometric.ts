/**
 * useBiometric Hook
 * Handles biometric authentication capabilities and prompts
 */

import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { BiometricAuthResult, BiometricCapability } from '../types/auth';

/**
 * Hook for managing biometric authentication
 * @returns Biometric capabilities and authentication functions
 */
export function useBiometric() {
  const [hasBiometrics, setHasBiometrics] = useState<boolean>(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [biometricTypes, setBiometricTypes] = useState<number[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Check device biometric capabilities on mount
   */
  useEffect(() => {
    checkBiometricCapabilities();
  }, []);

  /**
   * Check if device has biometric hardware and if biometrics are enrolled
   */
  const checkBiometricCapabilities = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Check if device has biometric hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      setHasBiometrics(hasHardware);

      // Check if biometrics are enrolled (user has set up Face ID/Fingerprint)
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsEnrolled(enrolled);

      // Get available biometric types
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      setBiometricTypes(types);

      console.log('Biometric capabilities:', {
        hasHardware,
        enrolled,
        types: types.map((t) => getBiometricTypeName(t)),
      });
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      setHasBiometrics(false);
      setIsEnrolled(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get human-readable name for biometric type
   */
  const getBiometricTypeName = (type: number): string => {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'Fingerprint';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'Face ID';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Iris';
      default:
        return 'Unknown';
    }
  };

  /**
   * Get the primary biometric type available
   */
  const getPrimaryBiometricType = (): string => {
    if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (biometricTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    if (biometricTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometric';
  };

  /**
   * Prompt user for biometric authentication
   * @returns Authentication result with success status and optional error message
   */
  const authenticate = useCallback(async (): Promise<BiometricAuthResult> => {
    // Check if already authenticating
    if (isAuthenticating) {
      return { success: false, error: 'Authentication already in progress' };
    }

    // Check if biometrics are available
    if (!hasBiometrics) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    // Check if biometrics are enrolled
    if (!isEnrolled) {
      return {
        success: false,
        warning: 'Please set up Face ID or Fingerprint in your device settings to use Journal Lock.',
      };
    }

    try {
      setIsAuthenticating(true);

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Access your journal',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        return { success: true };
      }

      // Handle different error types
      if (result.error === 'user_cancel') {
        return { success: false, error: 'Authentication cancelled' };
      }

      if (result.error === 'user_fallback') {
        // User chose to use passcode - this should still work with disableDeviceFallback: false
        return { success: false, error: 'Please use your device passcode' };
      }

      // Handle lockout errors - note: some error types may vary by platform
      const errorString = String(result.error);
      if (errorString.includes('lockout')) {
        return {
          success: false,
          error: 'Too many failed attempts. Please try again later or use your device passcode.',
        };
      }

      return { success: false, error: errorString || 'Authentication failed' };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during authentication',
      };
    } finally {
      setIsAuthenticating(false);
    }
  }, [hasBiometrics, isEnrolled, isAuthenticating]);

  /**
   * Get biometric capability summary
   */
  const getCapability = useCallback((): BiometricCapability => {
    return {
      hasBiometrics,
      isEnrolled,
      biometricTypes,
    };
  }, [hasBiometrics, isEnrolled, biometricTypes]);

  return {
    // State
    hasBiometrics,
    isEnrolled,
    biometricTypes,
    isAuthenticating,
    isLoading,

    // Functions
    authenticate,
    checkBiometricCapabilities,
    getPrimaryBiometricType,
    getCapability,
  };
}

export default useBiometric;
