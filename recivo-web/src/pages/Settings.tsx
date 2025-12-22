import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  updateEmail, 
  sendEmailVerification,
  sendPasswordResetEmail,
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from 'firebase/auth';

interface SettingsData {
  // 1. Profile
  ownerName: string;
  email: string;
  phoneNumber: string;
  role: string;
  timezone: string;
  language: string;

  // 2. Business Info
  businessName: string;
  businessAddress: string;
  businessContact: string;
  businessEmail: string;

  // 3. Receipt Preferences
  currency: string;
  currencySymbolPosition: 'before' | 'after';
  taxEnabled: boolean;
  defaultTaxRate: number;
  showDiscountField: boolean;
  footerMessage: string;
}

export const Settings = () => {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'receipt' | 'security'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  //Add reset password state
  const [isResettingPassword,
    setIsResettingPassword] = useState(false);
  const [passwordResetSent,
    setPasswordResetSent] = useState(false);

  // Security Tab States
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const [settings, setSettings] = useState<SettingsData>({
    ownerName: '',
    email: user?.email || '',
    phoneNumber: '',
    role: 'Owner',
    timezone: 'Asia/Manila',
    language: 'English',
    businessName: '',
    businessAddress: '',
    businessContact: '',
    businessEmail: '',
    currency: 'PHP',
    currencySymbolPosition: 'before',
    taxEnabled: true,
    defaultTaxRate: 12,
    showDiscountField: true,
    footerMessage: 'Thank you for your purchase!',
  });

  //Handlers

  const handleResetPassword = async () => {
    if (!user?.email) {
      setNotification({ type: 'error', message: 'No email address found.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsResettingPassword(true);

    try {
      // Configure action code settings for custom redirect
      const actionCodeSettings = {
        url: `${window.location.origin}/change-password`, // Redirect after reset
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, user.email, actionCodeSettings);
      
      setPasswordResetSent(true);
      setNotification({ 
        type: 'success', 
        message: 'Password reset email sent! Check your inbox.' 
      });
      
      setTimeout(() => {
        setNotification(null);
        setPasswordResetSent(false);
      }, 5000);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      let errorMessage = 'Failed to send reset email. ';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage += 'User not found.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage += 'Too many attempts. Please try again later.';
      } else {
        errorMessage += error.message;
      }
      
      setNotification({ type: 'error', message: errorMessage });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || newEmail === user?.email) {
      setNotification({ type: 'error', message: 'Please enter a new email address.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setNotification({ type: 'error', message: 'Please enter a valid email address.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Show password prompt for reauthentication
    setShowPasswordPrompt(true);
  };

  const handleConfirmEmailChange = async () => {
    if (!currentPassword) {
      setNotification({ type: 'error', message: 'Please enter your current password.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsVerifyingEmail(true);

    try {
      // Step 1: Reauthenticate user
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('No authenticated user found');
      }

      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Step 2: Update email
      await updateEmail(currentUser, newEmail);

      // Step 3: Send verification email to new address
      await sendEmailVerification(currentUser);

      // Step 4: Update settings in Firestore
      if (user?.uid) {
        await setDoc(doc(db, 'settings', user.uid), {
          ...settings,
          email: newEmail,
        });
      }

      setEmailVerificationSent(true);
      setShowPasswordPrompt(false);
      setCurrentPassword('');
      setNotification({ 
        type: 'success', 
        message: 'Verification email sent! Please check your new email inbox.' 
      });
      setTimeout(() => {
        setNotification(null);
        setEmailVerificationSent(false);
        setNewEmail('');
      }, 5000);
    } catch (error: any) {
      console.error('Error changing email:', error);
      let errorMessage = 'Failed to change email. ';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage += 'Incorrect password.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage += 'This email is already in use.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage += 'Please log out and log in again before changing your email.';
      } else {
        errorMessage += error.message;
      }
      
      setNotification({ type: 'error', message: errorMessage });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleCancelEmailChange = () => {
    setShowPasswordPrompt(false);
    setCurrentPassword('');
    setNewEmail('');
  };

  // Track original settings to detect changes
  const [originalSettings, setOriginalSettings] = useState<SettingsData>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.uid) return;
      try {
        const docRef = doc(db, 'settings', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fetchedSettings = { ...settings, ...docSnap.data() };
          setSettings(fetchedSettings);
          setOriginalSettings(fetchedSettings);
        } else {
          // If no settings exist, use defaults with Google account name
          const defaultSettings = {
            ...settings,
            ownerName: user?.displayName || '',
            email: user?.email || '',
          };
          setSettings(defaultSettings);
          setOriginalSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user?.uid]);

  // Detect changes
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', user.uid), settings);
      setOriginalSettings(settings);
      setHasChanges(false);
      setNotification({ type: 'success', message: 'Settings saved successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save settings.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  const updateField = (field: keyof SettingsData, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <span className="text-gray-500">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-32 sm:pb-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-99 px-4 sm:px-6 py-3 rounded-xl shadow-lg flex items-center gap-3
            ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
          style={{ minWidth: 280, maxWidth: '90%' }}
        >
          {notification.type === 'success' ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="font-medium text-sm sm:text-base">{notification.message}</span>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <div className="fixed top-16 left-4 right-4 sm:top-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-40 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-lg" style={{ maxWidth: '90%', minWidth: 280 }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">You have unsaved changes</span>
            </div>
            <button
              onClick={handleDiscard}
              className="text-xs text-yellow-600 hover:text-yellow-800 font-medium underline"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your account and business preferences</p>
      </div>

      {/* Tabs - Mobile Scrollable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-shrink-0 px-4 sm:px-6 py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'profile' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`flex-shrink-0 px-4 sm:px-6 py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'business' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600'
            }`}
          >
            Business
          </button>
          <button
            onClick={() => setActiveTab('receipt')}
            className={`flex-shrink-0 px-4 sm:px-6 py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'receipt' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600'
            }`}
          >
            Receipt
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-shrink-0 px-4 sm:px-6 py-3 font-medium text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'security' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600'
            }`}
          >
            Security
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* 1️⃣ Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">General / Profile Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner / User Name</label>
                  <input
                    type="text"
                    value={settings.ownerName}
                    onChange={(e) => updateField('ownerName', e.target.value)}
                    placeholder={user?.displayName || 'Enter your name'}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This name will be displayed in the navigation bar
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    disabled
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    To change email, go to Security tab
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={settings.phoneNumber}
                    onChange={(e) => updateField('phoneNumber', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={settings.role}
                    onChange={(e) => updateField('role', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>Owner</option>
                    <option>Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateField('timezone', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>Asia/Manila</option>
                    <option>UTC</option>
                    <option>America/New_York</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateField('language', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>English</option>
                    <option>Filipino</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 2️⃣ Business Info Tab */}
          {activeTab === 'business' && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Business Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name ⭐</label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                  <input
                    type="text"
                    value={settings.businessAddress}
                    onChange={(e) => updateField('businessAddress', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={settings.businessContact}
                    onChange={(e) => updateField('businessContact', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
                  <input
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) => updateField('businessEmail', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3️⃣ Receipt Preferences Tab */}
          {activeTab === 'receipt' && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Receipt Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>PHP</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol Position</label>
                  <select
                    value={settings.currencySymbolPosition}
                    onChange={(e) => updateField('currencySymbolPosition', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="before">Before (₱100)</option>
                    <option value="after">After (100₱)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm font-medium text-gray-700">Tax Enabled</label>
                  <input
                    type="checkbox"
                    checked={settings.taxEnabled}
                    onChange={(e) => updateField('taxEnabled', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    value={settings.defaultTaxRate}
                    onChange={(e) => updateField('defaultTaxRate', Number(e.target.value))}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm font-medium text-gray-700">Show Discount Field</label>
                  <input
                    type="checkbox"
                    checked={settings.showDiscountField}
                    onChange={(e) => updateField('showDiscountField', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Footer Message</label>
                  <textarea
                    value={settings.footerMessage}
                    onChange={(e) => updateField('footerMessage', e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4️⃣ Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Account & Security</h2>
              
              {/* Change Email Section */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-semibold text-gray-900">Change Email Address</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email address"
                    disabled={emailVerificationSent}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You will receive a verification email at your new address
                  </p>
                </div>

                {/* Password Confirmation Modal */}
                {showPasswordPrompt && (
                  <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Confirm Your Password</h3>
                        <button
                          onClick={handleCancelEmailChange}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        For security purposes, please enter your current password to change your email.
                      </p>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleConfirmEmailChange()}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleCancelEmailChange}
                          disabled={isVerifyingEmail}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirmEmailChange}
                          disabled={isVerifyingEmail || !currentPassword}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isVerifyingEmail ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Verifying...
                            </span>
                          ) : (
                            'Confirm'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {emailVerificationSent && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-800">Verification email sent!</p>
                        <p className="text-xs text-green-700 mt-1">
                          Please check <strong>{newEmail}</strong> and click the verification link.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleChangeEmail}
                  disabled={!newEmail || newEmail === user?.email || emailVerificationSent}
                  className="w-full px-4 py-2.5 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change Email
                </button>
              </div>

            {/* Reset Password Section */}
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <h3 className="font-semibold text-gray-900">Reset Password</h3>
                </div>
                
                <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm text-gray-700 font-medium">How it works:</p>
                        <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
                        <li>We'll send a secure reset link to <strong>{user?.email}</strong></li>
                        <li>Click the link in your email to reset your password</li>
                        <li>Create a new strong password (minimum 8 characters)</li>
                        </ul>
                    </div>
                    </div>
                </div>

                {passwordResetSent && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                        <p className="text-sm font-medium text-green-800">Password reset email sent! 🎉</p>
                        <p className="text-xs text-green-700 mt-1">
                            Check your inbox at <strong>{user?.email}</strong> and click the reset link.
                        </p>
                        </div>
                    </div>
                    </div>
                )}

                <button
                    onClick={handleResetPassword}
                    disabled={isResettingPassword || passwordResetSent}
                    className="w-full px-4 py-2.5 text-sm sm:text-base bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 active:bg-yellow-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isResettingPassword ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                    </span>
                    ) : (
                    'Send Reset Link'
                    )}
                </button>
                </div>
            </div>

              {/* Delete Account Section */}
              <div className="border border-red-200 rounded-lg p-4 sm:p-6 bg-red-50">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="font-semibold text-red-900">Delete Account</h3>
                </div>
                <p className="text-sm text-red-800 mb-4">
                  This action is permanent and cannot be undone. All your data will be permanently deleted.
                </p>
                <button className="w-full px-4 py-2.5 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button - Fixed at bottom with proper spacing */}
      {hasChanges && (
        <div className="fixed bottom-16 left-0 right-0 sm:bottom-0 sm:relative bg-white border-t sm:border-t-0 border-gray-200 p-4 sm:p-0 shadow-lg sm:shadow-none z-30">
          <div className="flex gap-3 max-w-screen-xl mx-auto">
            <button
              onClick={handleDiscard}
              className="flex-1 sm:flex-none px-6 py-3 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition font-medium border border-gray-300"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-3 text-sm sm:text-base bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-lg"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};