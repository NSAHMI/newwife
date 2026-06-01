import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export function useBiometric() {
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkBiometrics();
  }, []);

  async function checkBiometrics() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setHasBiometrics(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);
      }
    } catch (err) {
      console.error('Biometric check failed:', err);
      setHasBiometrics(false);
    }
  }

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (isAuthenticating) return false;

    setIsAuthenticating(true);
    setError(null);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Access your journal',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return true;
      } else {
        setError('Authentication failed. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Authentication error. Please try again.');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating]);

  return {
    hasBiometrics,
    isEnrolled,
    authenticate,
    isAuthenticating,
    error,
  };
}
