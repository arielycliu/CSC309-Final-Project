import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProtectedRoute.css';

const DEFAULT_MIN_ROLE = 'regular';

const ProtectedRoute = ({ minRole = DEFAULT_MIN_ROLE, children }) => {
  const location = useLocation();
  const { loading, isAuthenticated, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="route-guard-loading">
        <div className="spinner" aria-hidden />
        <span>Loading your workspace…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (minRole && !hasRole(minRole)) {
    return <Navigate to="/" replace />;
  }

  if (children) {
    return children;
  }

  return <Outlet />;
};

export default ProtectedRoute;
