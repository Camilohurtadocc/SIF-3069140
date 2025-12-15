// src/services/cierresCajaService.js
import api from './api';

const cierresCajaService = {
  // Obtener todos los cierres de caja
  getAll: async () => {
    const response = await api.get('/cierre-caja');
    return response.data;
  },

  // Obtener cierre de caja por ID
  getById: async (id) => {
    const response = await api.get(`/cierre-caja/${id}`);
    return response.data;
  },

  // Crear cierre de caja
  create: async (data) => {
    const response = await api.post('/cierre-caja', data);
    return response.data;
  },

  // Actualizar cierre de caja
  update: async (id, data) => {
    const response = await api.put(`/cierre-caja/${id}`, data);
    return response.data;
  },

  // Eliminar cierre de caja
  delete: async (id) => {
    const response = await api.delete(`/cierre-caja/${id}`);
    return response.data;
  },
};

export default cierresCajaService;