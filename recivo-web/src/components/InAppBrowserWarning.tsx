import { useState, useEffect } from 'react';
import { isInAppBrowser, getDeviceType } from '@/utils/PlatformDetection';

export const InAppBrowserWarning = () => {
  const [inAppBrowser, setInAppBrowser] = useState<string | false>(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const browser = isInAppBrowser();
    if (browser) {
      setInAppBrowser(browser);
      setShowWarning(true);
    }
  }, []);

  if (!showWarning || !inAppBrowser) return null;

  const browserNames: { [key: string]: string } = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    messenger: 'Messenger',
    twitter: 'Twitter',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    line: 'Line',
    wechat: 'WeChat'
  };

  const currentUrl = window.location.href;
  const deviceType = getDeviceType();

  // Generate deep link or instructions based on device
  const getOpenInBrowserInstructions = () => {
    if (deviceType === 'ios') {
      return (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900">To open in Safari:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Tap the three dots (⋯) at the bottom right</li>
            <li>Select "Open in Safari"</li>
          </ol>
        </div>
      );
    } else if (deviceType === 'android') {
      return (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900">To open in Chrome:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Tap the three dots (⋮) at the top right</li>
            <li>Select "Open in Chrome" or "Open in browser"</li>
          </ol>
        </div>
      );
    }
    return null;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    alert('Link copied! Paste it in your browser.');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Open in Your Browser
          </h2>
          <p className="text-sm text-gray-600">
            You're viewing this page in {browserNames[inAppBrowser as string]}'s in-app browser. 
            For full functionality (including Google Sign-in), please open this link in your default browser.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4">
          {getOpenInBrowserInstructions()}
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Link
        </button>

        {/* Dismiss Button */}
        <button
          onClick={() => setShowWarning(false)}
          className="w-full px-4 py-3 text-gray-600 border rounded-lg border-gray-400 shadow-xl hover:text-gray-900 transition-colors font-medium"
        >
          Continue Anyway (Limited Features)
        </button>

        {/* Additional Note */}
        <p className="text-xs text-gray-500 text-center">
          Email/Password login will still work in this browser
        </p>
      </div>
    </div>
  );
};