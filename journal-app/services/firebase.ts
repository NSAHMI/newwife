/**
 * Firebase Service Initialization
 * Initializes Firebase app with Firestore and Authentication
 * Enables offline persistence for offline-first functionality
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  CACHE_SIZE_UNLIMITED,
  getFirestore,
} from 'firebase/firestore';
import {
  initializeAuth,
  Auth,
  getAuth,
  // @ts-expect-error - getReactNativePersistence exists in react-native environment
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Firebase configuration object
 * All values are loaded from environment variables with EXPO_PUBLIC_ prefix
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

/**
 * Initialize Firebase app and services
 * This function is idempotent and will only initialize once
 */
function initializeFirebase(): void {
  // Check if Firebase is already initialized
  if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    // Validate that required config values are present
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn(
        'Firebase configuration is incomplete. Please check your environment variables.'
      );
    }

    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
  }

  // Initialize Firestore with offline persistence
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      }),
    });
    console.log('Firestore initialized with offline persistence');
  } catch (error) {
    // Firestore might already be initialized
    db = getFirestore(app);
    console.log('Firestore already initialized, using existing instance');
  }

  // Initialize Firebase Auth
  try {
    // Use React Native persistence on mobile, default on web
    if (Platform.OS !== 'web' && typeof getReactNativePersistence === 'function') {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
      console.log('Firebase Auth initialized with AsyncStorage persistence');
    } else {
      auth = getAuth(app);
      console.log('Firebase Auth initialized with default persistence');
    }
  } catch (error) {
    // Auth might already be initialized
    auth = getAuth(app);
    console.log('Firebase Auth already initialized, using existing instance');
  }
}

// Initialize Firebase immediately when this module is imported
initializeFirebase();

/**
 * Exported Firebase app instance
 */
export { app };

/**
 * Exported Firestore database instance
 * Use this for all database operations
 */
export { db };

/**
 * Exported Firebase Auth instance
 * Use this for authentication operations
 */
export { auth };

/**
 * Check if Firebase is properly configured
 * @returns boolean indicating if Firebase has valid configuration
 */
export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}

/**
 * Get the current Firebase configuration status
 * Useful for debugging and displaying setup status
 */
export function getFirebaseStatus(): {
  isConfigured: boolean;
  hasApiKey: boolean;
  hasProjectId: boolean;
  hasAuthDomain: boolean;
} {
  return {
    isConfigured: isFirebaseConfigured(),
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasAuthDomain: !!firebaseConfig.authDomain,
  };
}
