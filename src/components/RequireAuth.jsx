import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  if (!isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}