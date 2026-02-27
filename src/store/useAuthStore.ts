/**
 * Auth Store — tracks Google Sign-In state using Zustand
 * Listens to Firebase onAuthStateChanged and exposes the current user.
 */
import { create } from 'zustand';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';

interface AuthState {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOutUser: () => Promise<void>;
    init: () => () => void;  // returns unsubscribe
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,

    signInWithGoogle: async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (e) {
            console.error('Google sign-in error:', e);
        }
    },

    signOutUser: async () => {
        await signOut(auth);
        set({ user: null });
    },

    init: () => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            set({ user, loading: false });
        });
        return unsubscribe;
    },
}));
