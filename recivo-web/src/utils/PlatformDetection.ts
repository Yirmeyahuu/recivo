// Detect if running in an in-app browser
export const isInAppBrowser = (): string | false => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Facebook
  if (userAgent.includes('FBAN') || userAgent.includes('FBAV')) {
    return 'Facebook';
  }
  
  // Instagram
  if (userAgent.includes('Instagram')) {
    return 'Instagram';
  }
  
  // Messenger
  if (userAgent.includes('Messenger')) {
    return 'Messenger';
  }
  
  // Twitter
  if (userAgent.includes('Twitter')) {
    return 'Twitter';
  }
  
  // TikTok
  if (userAgent.includes('TikTok')) {
    return 'TikTok';
  }
  
  // LinkedIn
  if (userAgent.includes('LinkedInApp')) {
    return 'LinkedIn';
  }
  
  // Line
  if (userAgent.includes('Line')) {
    return 'Line';
  }
  
  // WeChat
  if (userAgent.includes('MicroMessenger')) {
    return 'WeChat';
  }
  
  return false;
};

// Detect iOS
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

// Detect Android
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

// Get device type
export const getDeviceType = (): 'ios' | 'android' | 'desktop' => {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'desktop';
};