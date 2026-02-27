// ─────────────────────────────────────────────────────────────────────────────
// PASTE YOUR FIREBASE CONFIG HERE
// Get it from: Firebase Console → Project Settings → Your Apps → Web app → Config
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY",
    authDomain: "PASTE_YOUR_AUTH_DOMAIN",
    projectId: "PASTE_YOUR_PROJECT_ID",
    storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
    messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
    appId: "PASTE_YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
