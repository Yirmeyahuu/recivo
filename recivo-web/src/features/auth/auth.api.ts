import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,  // Change this
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
    // Use redirect instead of popup
    sessionStorage.setItem('googleAuthInProgress', 'true');
    await signInWithRedirect(auth, googleProvider);
    // Note: This will redirect the page, so code after this won't execute
  },

  logout: async () => {
    await signOut(auth);
  },
};