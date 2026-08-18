import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, memoryLocalCache } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if configured and clean memory cache
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: memoryLocalCache()
  }, databaseId);
} catch (e) {
  firestoreInstance = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export const db = firestoreInstance;

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;

