import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';

export const DashboardLayout = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show success notification on first login
  useEffect(() => {
    const isNewLogin = sessionStorage.getItem('justLoggedIn');
    if (isNewLogin) {
      setShowNotification(true);
      sessionStorage.removeItem('justLoggedIn');
      setTimeout(() => setShowNotification(false), 4000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
      {/* Success Notification - Responsive positioning */}
      {showNotification && (
        <div 
          className="fixed z-50 animate-slide-down
            top-4 left-4 right-4 
            sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto
            max-w-md mx-auto sm:mx-0"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-3 backdrop-blur-sm border border-emerald-400/20">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base truncate">Welcome back!</p>
              <p className="text-xs sm:text-sm text-emerald-100 truncate">You've successfully logged in</p>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0 ml-2 p-1 hover:bg-emerald-600/50 rounded-lg transition-colors"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Navbar Component */}
      <Navbar />

      {/* Main Content - Responsive padding and constraints */}
      <main 
        className="w-full mx-auto transition-all duration-300
          px-4 sm:px-6 lg:px-8 
          py-4 sm:py-6 lg:py-8
          max-w-7xl"
      >
        {/* Page Container */}
        <div className="w-full animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Bottom Safe Area for Mobile - Accounts for bottom nav and notch */}
      {isMobile && (
        <div 
          className="h-20 flex-shrink-0 safe-bottom"
        />
      )}

      {/* Scroll to top button - Shows on scroll */}
      <ScrollToTopButton />
    </div>
  );
};

// Scroll to Top Button Component
const ScrollToTopButton = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showButton) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40
        w-12 h-12 bg-emerald-600 hover:bg-emerald-700 
        text-white rounded-full shadow-lg shadow-emerald-900/30
        flex items-center justify-center
        transition-all duration-300 hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
        animate-scale-in"
      aria-label="Scroll to top"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};