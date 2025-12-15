// src/services/recibosDeCajaService.js
import api from './api';

const recibosDeCajaService = {
  // Obtener todos los recibos de caja
  getAll: async () => {
    const response = await api.get('/recibo-caja');
    return response.data;
  },

  // Obtener recibo de caja por ID
  getById: async (id) => {
    const response = await api.get(`/recibo-caja/${id}`);
    return response.data;
  },

  // Crear recibo de caja
  create: async (data) => {
    const response = await api.post('/recibo-caja', data);
    return response.data;
  },

  // Actualizar recibo de caja
  update: async (id, data) => {
    const response = await api.put(`/recibo-caja/${id}`, data);
    return response.data;
  },

  // Eliminar recibo de caja
  delete: async (id) => {
    const response = await api.delete(`/recibo-caja/${id}`);
    return response.data;
  },
};

export default recibosDeCajaService;