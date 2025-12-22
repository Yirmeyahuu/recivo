import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';

export const DashboardLayout = () => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show success notification on first login
    const isNewLogin = sessionStorage.getItem('justLoggedIn');
    if (isNewLogin) {
      setShowNotification(true);
      sessionStorage.removeItem('justLoggedIn');
      setTimeout(() => setShowNotification(false), 4000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-3 backdrop-blur-sm border border-emerald-400/20">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Welcome back!</p>
              <p className="text-sm text-emerald-100">You've successfully logged in</p>
            </div>
          </div>
        </div>
      )}

      {/* Navbar Component */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Bottom padding for mobile bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
};