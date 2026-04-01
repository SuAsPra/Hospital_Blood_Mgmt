import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ allowRoles, children, redirectTo = '/login' }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to={redirectTo} replace />;
  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
