import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.recivo.app',
  appName: 'Recivo Android',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
      // Add this for Android
      android: {
        providers: ['google.com']
      }
    }
  }
};

export default config;