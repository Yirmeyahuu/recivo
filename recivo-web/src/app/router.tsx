import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '@/features/auth/Login';
import { Register } from '@/features/auth/Register';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Dashboard } from '@/pages/Dashboard'; // <-- Use your real Dashboard
import { DashboardLayout } from '@/components/layout/DashboardLayout'; // <-- import this
import { ReceiptList } from '@/features/receipts/ReceiptList';

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
        ],
      },
    ],
  },
]);