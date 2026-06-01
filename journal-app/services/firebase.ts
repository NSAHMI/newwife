import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, Firestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });
} catch {
  db = getFirestore(app);
}

const auth = getAuth(app);

export { app, db, auth, signInAnonymously };
