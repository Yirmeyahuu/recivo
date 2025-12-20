import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/features/auth/auth.api';
import { useAuthStore } from '@/store/auth.store';

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link to="/dashboard" className="flex items-center">
                Dashboard
              </Link>
              <Link to="/receipts" className="flex items-center">
                Receipts
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span>{user?.displayName || user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};