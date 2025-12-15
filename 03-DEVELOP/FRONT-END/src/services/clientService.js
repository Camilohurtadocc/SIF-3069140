// src/services/clientService.js
import api from './api';

const clientService = {
  // Obtener todos los clientes
  getAll: async () => {
    const response = await api.get('/client');
    return response.data.data || response.data; // Manejar paginación
  },

  // Obtener cliente por ID
  getById: async (id) => {
    const response = await api.get(`/client/${id}`);
    return response.data;
  },

  // Crear cliente
  create: async (clientData) => {
    const response = await api.post('/client', clientData);
    return response.data;
  },

  // Actualizar cliente
  update: async (id, clientData) => {
    const response = await api.put(`/client/${id}`, clientData);
    return response.data;
  },

  // Eliminar cliente
  delete: async (id) => {
    const response = await api.delete(`/client/${id}`);
    return response.data;
  },
};

export default clientService;