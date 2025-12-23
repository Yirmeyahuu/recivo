import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth.store';
import { isNativePlatform } from '@/utils/PlatformDetection';

export const useAuth = () => {
  const { user, loading, setUser, setLoading, setToken } = useAuthStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (isNativePlatform()) {
      // Mobile: Use Capacitor auth state listener
      const listener = FirebaseAuthentication.addListener('authStateChange', async (result) => {
        if (result.user) {
          const token = await FirebaseAuthentication.getIdToken();
          setToken(token.token);
          setUser(result.user as any);
        } else {
          setToken(null);
          setUser(null);
        }
        setLoading(false);
      });

      // Get initial user
      FirebaseAuthentication.getCurrentUser().then(async (result) => {
        if (result.user) {
          const token = await FirebaseAuthentication.getIdToken();
          setToken(token.token);
          setUser(result.user as any);
        }
        setLoading(false);
      });

      return () => {
        listener.remove();
      };
    } else {
      // Web: Use Firebase Web SDK
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await user.getIdToken();
          setToken(token);
        } else {
          setToken(null);
        }
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe?.();
    }
  }, [setUser, setLoading, setToken]);

  return { user, loading };
};