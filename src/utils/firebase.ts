// ─────────────────────────────────────────────────────────────────────────────
// PASTE YOUR FIREBASE CONFIG HERE
// Get it from: Firebase Console → Project Settings → Your Apps → Web app → Config
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyD8_IYXdcWPof7GZqqXcNkWfFwUEBqQZqI",
    authDomain: "aether-nexus-31ccd.firebaseapp.com",
    projectId: "aether-nexus-31ccd",
    storageBucket: "aether-nexus-31ccd.firebasestorage.app",
    messagingSenderId: "215201876670",
    appId: "1:215201876670:web:2ae46d8da6dc7f48c66cef",
    measurementId: "G-ZH993W6D3P"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
