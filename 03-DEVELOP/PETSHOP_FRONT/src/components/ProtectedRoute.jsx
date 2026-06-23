import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';

export default function ProtectedRoute({ children, allowedRoles, redirectTo = '/dashboard' }) {
  const { user, initializing: authInitializing, handleRoleChangeLogout } = useAuth();
  const { roles, hasRole, loading: profileLoading } = useProfile();

  const initializing = authInitializing || profileLoading;

  // Verificar si el usuario necesita ser deslogueado por cambio de rol
  useEffect(() => {
    if (user && user.id_usuario) {
      handleRoleChangeLogout(user.id_usuario);
    }
  }, [user, handleRoleChangeLogout]);

  if (initializing) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/" replace />;

  // Si la ruta requiere roles, usamos la lógica de nuestro hook
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!hasRole(...allowedRoles)) return <Navigate to={redirectTo} replace />;
  }

  return children;
}
