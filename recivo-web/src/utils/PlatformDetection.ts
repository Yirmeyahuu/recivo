import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const isWeb = () => {
  return !Capacitor.isNativePlatform();
};