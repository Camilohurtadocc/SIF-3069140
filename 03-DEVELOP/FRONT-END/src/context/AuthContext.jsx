import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
  const initializeAuth = async () => {
    console.log('Inicializando autenticación...');      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          console.log('Token encontrado en localStorage');
          
          // Configurar header de Authorization
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Parsear usuario guardado
          const parsedUser = JSON.parse(storedUser);
          console.log('Usuario recuperado de localStorage:', parsedUser);
          
          // Intentar validar token con el backend
          try {
            const response = await api.get('/me');
            console.log('Token validado con backend:', response.data);
            
            // Actualizar con datos frescos del backend
            const userData = response.data.user || response.data;
            
            // Verificar si este usuario necesita ser deslogueado (rol modificado por admin)
            const usersToLogout = JSON.parse(localStorage.getItem('usersToLogout') || '[]');
            if (usersToLogout.includes(userData.id_usuario)) {
              console.log('Tu rol ha sido modificado por un administrador.');
              
              // Limpiar marca
              const filtered = usersToLogout.filter(uid => uid !== userData.id_usuario);
              localStorage.setItem('usersToLogout', JSON.stringify(filtered));
              
              // Desloguear
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              delete api.defaults.headers.common['Authorization'];
              setUser(null);
              setInitializing(false);
              
              alert('Tu rol ha sido modificado. Por favor, inicia sesión nuevamente.');
              window.location.href = '/';
              return;
            }
            
            setUser(userData);
            
            // Actualizar localStorage con datos frescos
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (error) {
            console.warn('No se pudo validar token con backend, usando datos guardados');
            
            // También verificar marca de logout aquí
            const usersToLogout = JSON.parse(localStorage.getItem('usersToLogout') || '[]');
            if (usersToLogout.includes(parsedUser.id_usuario)) {
              console.log('Tu rol ha sido modificado. Cerrando sesión...');
              
              const filtered = usersToLogout.filter(uid => uid !== parsedUser.id_usuario);
              localStorage.setItem('usersToLogout', JSON.stringify(filtered));
              
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              delete api.defaults.headers.common['Authorization'];
              setUser(null);
              setInitializing(false);
              
              alert('Tu rol ha sido modificado. Por favor, inicia sesión nuevamente.');
              window.location.href = '/';
              return;
            }
            
            // Si falla, usar datos guardados (token puede estar expirado pero dejar que otras peticiones lo manejen)
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Error al recuperar sesión:', error);
          // Limpiar datos corruptos
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        console.log('No hay sesión guardada');
        setUser(null);
      }
      
      setInitializing(false);
    };

    initializeAuth();
  }, []);

  const signIn = async ({ email, password }) => {
    try {
      console.log('🔐 Intentando login con:', email);
      const response = await api.post('/login', { email, password });
      console.log('Respuesta del login:', response.data);
      
      // Manejar diferentes estructuras de respuesta
      // Si viene {success: true, data: {token, user}}
      const responseData = response.data.data || response.data;
      
      const token = responseData.token || responseData.accessToken;
      const userData = responseData.user || responseData.usuario || responseData;
      const roles = responseData.roles || userData.roles || [];

      console.log('Datos extraídos del login:');
      console.log('   Token:', token ? 'Presente' : 'Ausente');
      console.log('   Usuario:', userData);
      console.log('   Roles en respuesta:', roles);
      console.log('   nombre_rol en user:', userData?.nombre_rol);

      if (!token) {
        console.error('No se recibió token en la respuesta');
        return { data: null, error: new Error('No se recibió token de autenticación') };
      }

      // Agregar roles al user object si vienen separados
      const userWithRoles = { ...userData };
      if (roles && !userWithRoles.roles) {
        userWithRoles.roles = roles;
      }

      console.log('Token guardado:', token.substring(0, 20) + '...');
      console.log('Usuario final guardado:', userWithRoles);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithRoles));
      setUser(userWithRoles);
      
      return { data: { user: userWithRoles }, error: null };
    } catch (error) {
      console.error('Error en signIn:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      console.log('Refrescando datos del usuario...');
      const response = await api.get('/me');
      console.log('Respuesta de /me:', response.data);
      
      if (response.data.success !== false) {
        const freshUser = response.data.user || response.data;
        
        // Actualizar localStorage
        localStorage.setItem('user', JSON.stringify(freshUser));
        
        // Actualizar estado
        setUser(freshUser);
        
        console.log('Usuario refrescado:', freshUser);
        return freshUser;
      }
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, initializing, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;