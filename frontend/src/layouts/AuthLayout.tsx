import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import logo from '@/assets/images/logo.png';

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore();

  // Redirect authenticated users to their dashboard
  if (isAuthenticated && user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'support_agent':
        return <Navigate to="/agent" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="mx-auto h-20 w-auto" />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
