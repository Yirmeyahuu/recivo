import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const isWeb = () => {
  return !Capacitor.isNativePlatform();
};

// Detect if running in an in-app browser
export const isInAppBrowser = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Facebook
  if (userAgent.includes('FBAN') || userAgent.includes('FBAV')) {
    return 'facebook';
  }
  
  // Instagram
  if (userAgent.includes('Instagram')) {
    return 'instagram';
  }
  
  // Messenger
  if (userAgent.includes('Messenger')) {
    return 'messenger';
  }
  
  // Twitter
  if (userAgent.includes('Twitter')) {
    return 'twitter';
  }
  
  // TikTok
  if (userAgent.includes('TikTok')) {
    return 'tiktok';
  }
  
  // LinkedIn
  if (userAgent.includes('LinkedInApp')) {
    return 'linkedin';
  }
  
  // Line
  if (userAgent.includes('Line')) {
    return 'line';
  }
  
  // WeChat
  if (userAgent.includes('MicroMessenger')) {
    return 'wechat';
  }
  
  return false;
};

// Detect iOS
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

// Detect Android
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

// Get device type
export const getDeviceType = () => {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'desktop';
};

// Check if browser supports popups (needed for Google Auth)
export const supportsPopups = () => {
  try {
    const test = window.open('', '_blank');
    if (test) {
      test.close();
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};