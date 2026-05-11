/**
 * Authentication Type Definitions
 * Contains all TypeScript interfaces for authentication state and actions
 */

/**
 * Authentication state interface
 */
export interface AuthState {
  /** Whether the user has successfully authenticated */
  isAuthenticated: boolean;
  /** Timestamp of last user activity (for re-lock calculation) */
  lastActiveAt: number | null;
  /** Firebase anonymous user ID */
  userId: string | null;
  /** Whether authentication is currently in progress */
  isAuthenticating: boolean;
  /** Error message if authentication failed */
  error: string | null;
}

/**
 * Authentication context actions
 */
export interface AuthActions {
  /** Unlock the app after successful biometric authentication */
  unlock: () => Promise<void>;
  /** Lock the app and require re-authentication */
  lock: () => void;
  /** Update the last active timestamp */
  refreshActivity: () => void;
  /** Clear any authentication errors */
  clearError: () => void;
}

/**
 * Combined authentication context value
 */
export interface AuthContextValue extends AuthState, AuthActions {}

/**
 * Biometric authentication result
 */
export interface BiometricAuthResult {
  /** Whether authentication was successful */
  success: boolean;
  /** Error message if authentication failed */
  error?: string;
  /** Warning message (e.g., biometrics not enrolled) */
  warning?: string;
}

/**
 * Biometric capability information
 */
export interface BiometricCapability {
  /** Whether the device has biometric hardware */
  hasBiometrics: boolean;
  /** Whether biometrics are enrolled/configured */
  isEnrolled: boolean;
  /** Available biometric types (fingerprint, face, iris) */
  biometricTypes: number[];
}

/**
 * App state for background/foreground detection
 */
export type AppStateStatus = 'active' | 'background' | 'inactive' | 'unknown' | 'extension';

/**
 * Re-lock timeout configuration
 */
export interface ReLockConfig {
  /** Currently selected timeout in milliseconds */
  timeoutMs: number;
  /** Available timeout options */
  options: Array<{
    label: string;
    value: number;
  }>;
}

/**
 * Secure storage keys type
 */
export interface SecureStoreKeys {
  USER_ID: string;
  DRAFT_ENTRY: string;
  RE_LOCK_TIMEOUT: string;
  LAST_ACTIVE: string;
}
