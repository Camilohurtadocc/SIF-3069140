// src/services/inventarioService.js
import api from './api';

const inventarioService = {
  // Obtener todo el inventario
  getAll: async () => {
    const response = await api.get('/inventario');
    return response.data;
  },

  // Obtener inventario por ID
  getById: async (id) => {
    const response = await api.get(`/inventario/${id}`);
    return response.data;
  },

  // Crear entrada en inventario
  create: async (data) => {
    const response = await api.post('/inventario', data);
    return response.data;
  },

  // Actualizar entrada en inventario
  update: async (id, data) => {
    const response = await api.put(`/inventario/${id}`, data);
    return response.data;
  },

  // Eliminar entrada en inventario
  delete: async (id) => {
    const response = await api.delete(`/inventario/${id}`);
    return response.data;
  },
};

export default inventarioService;