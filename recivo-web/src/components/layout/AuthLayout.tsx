import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
        <div className="flex flex-col items-center gap-4">
          {/* Spinning Loader */}
          <div className="relative w-16 h-16">
            <svg className="animate-spin w-16 h-16" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="3"
                fill="none"
                style={{ color: '#10b981' }}
              />
              <path 
                className="opacity-75" 
                fill="currentColor"
                style={{ color: '#10b981' }}
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>

          {/* Loading Text */}
          <p className="text-emerald-300 text-sm font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};