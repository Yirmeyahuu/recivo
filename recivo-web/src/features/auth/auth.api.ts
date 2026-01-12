import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export const authApi = {
  async register(email: string, password: string, displayName: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  },

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async loginWithGoogle() {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      return userCredential.user;
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site and try again.');
      }
      throw error;
    }
  },

  async logout() {
    await signOut(auth);
  },

  getCurrentUser() {
    return auth.currentUser;
  }
};