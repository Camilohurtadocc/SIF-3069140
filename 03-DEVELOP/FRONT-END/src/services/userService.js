// src/services/userService.js
import api from './api';

const userService = {
  // Obtener todos los usuarios (sin caché)
  getAll: async () => {
    const response = await api.get('/user', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      params: {
        _t: Date.now() // Timestamp para forzar recarga
      }
    });
    return response.data.data || response.data; // Manejar paginación
  },

  // Obtener usuario por ID (sin caché)
  getById: async (id) => {
    const response = await api.get(`/user/${id}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    return response.data;
  },

  // Crear usuario
  create: async (userData) => {
    const response = await api.post('/user', userData);
    return response.data;
  },

  // Actualizar usuario
  update: async (id, userData) => {
    const response = await api.put(`/user/${id}`, userData);
    return response.data;
  },

  // Actualizar rol de usuario (endpoint específico)
  updateRole: async (id, userData) => {
    const response = await api.put(`/user/${id}/role`, userData);
    return response.data;
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  },
};

export default userService;