import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '@/features/auth/Login';
import { Register } from '@/features/auth/Register';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Dashboard } from '@/pages/Dashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ReceiptList } from '@/features/receipts/ReceiptList';
import { Settings } from '@/pages/Settings'; 
import { ChangePassword } from '@/pages/ChangePassword';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          {
            path: '/receipts',
            element: <ReceiptList />,
          },
          {
            path: '/settings',
            element: <Settings />,
          },
          {
            path: '/change-password',
            element: <ChangePassword />,
          },
        ],
      },
    ],
  },
]);