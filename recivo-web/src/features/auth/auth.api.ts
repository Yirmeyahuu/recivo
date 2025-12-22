import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export const authApi = {
  register: async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    sessionStorage.setItem('justLoggedIn', 'true');
    return userCredential.user;
  },

  login: async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    sessionStorage.setItem('justLoggedIn', 'true');
    return userCredential.user;
  },

  loginWithGoogle: async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    sessionStorage.setItem('justLoggedIn', 'true');
    return userCredential.user;
  },

  logout: async () => {
    await signOut(auth);
  },
};