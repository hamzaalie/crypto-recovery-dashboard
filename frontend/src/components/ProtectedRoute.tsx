import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  console.log('ProtectedRoute check:', { isAuthenticated, user, allowedRoles });

  if (!isAuthenticated || !user) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case 'admin':
          return <Navigate to="/admin" replace />;
        case 'support_agent':
          return <Navigate to="/agent" replace />;
        default:
          return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
}
