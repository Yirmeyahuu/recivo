import { 
  createUserWithEmailAndPassword as firebaseCreateUser,
  signInWithEmailAndPassword as firebaseSignIn,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth, googleProvider } from '@/lib/firebase';
import { isNativePlatform, isInAppBrowser, supportsPopups } from '@/utils/PlatformDetection';

export const authService = {
  async register(email: string, password: string, displayName: string) {
    if (isNativePlatform()) {
      // Mobile: Use Capacitor
      const result = await FirebaseAuthentication.createUserWithEmailAndPassword({
        email,
        password,
      });
      
      if (result.user) {
        await FirebaseAuthentication.updateProfile({
          displayName,
        });
      }
      
      return result.user;
    } else {
      // Web: Use Firebase Web SDK
      const userCredential = await firebaseCreateUser(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      return userCredential.user;
    }
  },

  async login(email: string, password: string) {
    if (isNativePlatform()) {
      // Mobile: Use Capacitor
      const result = await FirebaseAuthentication.signInWithEmailAndPassword({
        email,
        password,
      });
      return result.user;
    } else {
      // Web: Use Firebase Web SDK
      const userCredential = await firebaseSignIn(auth, email, password);
      return userCredential.user;
    }
  },

  async loginWithGoogle() {
    if (isNativePlatform()) {
      // Mobile: Use Capacitor
      const result = await FirebaseAuthentication.signInWithGoogle();
      return result.user;
    } else {
      // Web: Check if in in-app browser or if popups are blocked
      const inAppBrowser = isInAppBrowser();
      const hasPopupSupport = supportsPopups();
      
      if (inAppBrowser || !hasPopupSupport) {
        // Use redirect method for in-app browsers or if popups are blocked
        await signInWithRedirect(auth, googleProvider);
        // The result will be handled by handleRedirectResult
        return null;
      } else {
        // Use popup method for regular browsers
        const userCredential = await signInWithPopup(auth, googleProvider);
        return userCredential.user;
      }
    }
  },

  // Handle redirect result (call this on app initialization)
  async handleRedirectResult() {
    if (!isNativePlatform()) {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          sessionStorage.setItem('justLoggedIn', 'true');
          return result.user;
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
        throw error;
      }
    }
    return null;
  },

  async logout() {
    if (isNativePlatform()) {
      // Mobile: Use Capacitor
      await FirebaseAuthentication.signOut();
    } else {
      // Web: Use Firebase Web SDK
      await firebaseSignOut(auth);
    }
    
    // Clear session storage
    sessionStorage.removeItem('justLoggedIn');
  },

  async getCurrentUser() {
    if (isNativePlatform()) {
      const result = await FirebaseAuthentication.getCurrentUser();
      return result.user;
    } else {
      return auth.currentUser;
    }
  }
};