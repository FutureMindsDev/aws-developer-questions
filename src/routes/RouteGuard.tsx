import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RouteGuard() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';

  if (loading) {
    return null;
  }

  if (!user && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (user && isOnboarding) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}