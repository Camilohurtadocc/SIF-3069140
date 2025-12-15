import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Este hook gestiona la carga del perfil y roles del usuario autenticado
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState(undefined); // undefined = cargando
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfileAndRoles() {
      if (!user) {
        if (mounted) {
          setProfile(null);
          // No resetear roles si ya están asignados
          if (!roles || roles.length === 0) {
            setRoles([]);
          }
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        // Usar la información del usuario del contexto
        setProfile(user);

        // Extraer roles del usuario (deberían venir del JWT/backend)
        const roleNames = [];
        const rel = user?.usuario_rol;
        if (Array.isArray(rel)) {
          rel.forEach(r => {
            const n = r?.roles?.nombre_rol;
            if (n) roleNames.push(String(n).toLowerCase());
          });
        }

        // Si no hay roles en usuario_rol, usar los del JWT/user.roles si existen
        if (roleNames.length === 0 && user?.roles) {
          if (Array.isArray(user.roles)) {
            user.roles.forEach(role => {
              const roleName = typeof role === 'string' ? role : role?.nombre_rol;
              if (roleName) roleNames.push(String(roleName).toLowerCase());
            });
          }
        }

        // Si no hay roles en ningún lugar, verificar si hay nombre_rol directamente
        if (roleNames.length === 0 && user?.nombre_rol) {
          roleNames.push(String(user.nombre_rol).toLowerCase());
        }

        console.log('🔐 Roles cargados para:', user?.correo_electronico || user?.email);
        console.log('Roles encontrados:', roleNames);
        console.log('   👤 Usuario completo:', user);
        
        setRoles(roleNames);
      } catch (e) {
        console.warn('[useProfile] No se pudo cargar el perfil o roles', e);
        if (mounted && (!roles || roles.length === 0)) {
          setProfile(user);
          setRoles(['usuario']); // Rol por defecto en caso de error
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfileAndRoles();
    return () => { mounted = false; };
  }, [user]); // Solo user como dependencia para evitar loops

  const hasRole = (...names) => {
    const wanted = names.map(n => String(n).toLowerCase());
    return (roles || []).some(r => wanted.includes(r.toLowerCase()));
  };

  return { profile, roles, hasRole, loading };
}
