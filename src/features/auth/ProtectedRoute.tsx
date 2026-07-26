import { Navigate, Outlet } from 'react-router';
import type { UserRole } from '../../domain/models';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="route-loader">Carregando sua área...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/aluno/inicio'} replace />;
  }

  return <Outlet />;
}
