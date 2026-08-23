import { Navigate } from 'react-router-dom';

export default function PublicRoute({ children }) {
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}