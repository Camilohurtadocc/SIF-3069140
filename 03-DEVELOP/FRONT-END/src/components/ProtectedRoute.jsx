import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';

export default function ProtectedRoute({ children, allowedRoles, redirectTo = '/dashboard' }) {
  const { user, initializing: authInitializing, signOut } = useAuth();
  const { roles, hasRole, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  const initializing = authInitializing || profileLoading;

  // Verificar si el usuario necesita ser deslogueado por cambio de rol
  useEffect(() => {
    if (user && user.id_usuario) {
      const usersToLogout = JSON.parse(localStorage.getItem('usersToLogout') || '[]');
      
      if (usersToLogout.includes(user.id_usuario)) {
        console.log('Rol modificado detectado en navegación');
        
        // Limpiar marca
        const filtered = usersToLogout.filter(uid => uid !== user.id_usuario);
        localStorage.setItem('usersToLogout', JSON.stringify(filtered));
        
        // Desloguear
        alert('Tu rol ha sido modificado por un administrador. Por favor, inicia sesión nuevamente.');
        signOut();
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate, signOut]);

  if (initializing) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/" replace />;

  // Si la ruta requiere roles, usamos la lógica de nuestro hook
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!hasRole(...allowedRoles)) return <Navigate to={redirectTo} replace />;
  }

  return children;
}