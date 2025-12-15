// src/services/historialRecibosDeCajaService.js
import api from './api';

const historialRecibosDeCajaService = {
  // Obtener todo el historial de recibos de caja
  getAll: async () => {
    const response = await api.get('/historial-recibo-caja');
    return response.data;
  },

  // Obtener historial por ID
  getById: async (id) => {
    const response = await api.get(`/historial-recibo-caja/${id}`);
    return response.data;
  },

  // Crear entrada en historial
  create: async (data) => {
    const response = await api.post('/historial-recibo-caja', data);
    return response.data;
  },

  // Actualizar entrada en historial
  update: async (id, data) => {
    const response = await api.put(`/historial-recibo-caja/${id}`, data);
    return response.data;
  },

  // Eliminar entrada en historial
  delete: async (id) => {
    const response = await api.delete(`/historial-recibo-caja/${id}`);
    return response.data;
  },
};

export default historialRecibosDeCajaService;