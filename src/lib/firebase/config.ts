import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// Check if a real, valid Firebase API key is provided
export const isFirebaseConfigured = Boolean(
  rawApiKey &&
  rawApiKey.length > 20 &&
  !rawApiKey.includes('DemoKey')
);

// Configurable via Vite Environment Variables
const firebaseConfig = {
  apiKey: rawApiKey || 'AIzaSyDemoKeyAutoHR1234567890abcdef',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'autohr-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'autohr-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'autohr-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export default app;
