import { authService } from '@/services/UnifiedAuth';

export const authApi = {
  register: async (email: string, password: string, displayName: string) => {
    const user = await authService.register(email, password, displayName);
    sessionStorage.setItem('justLoggedIn', 'true');
    return user;
  },

  login: async (email: string, password: string) => {
    const user = await authService.login(email, password);
    sessionStorage.setItem('justLoggedIn', 'true');
    return user;
  },

  loginWithGoogle: async () => {
    const user = await authService.loginWithGoogle();
    sessionStorage.setItem('justLoggedIn', 'true');
    return user;
  },

  logout: async () => {
    await authService.logout();
  },
};