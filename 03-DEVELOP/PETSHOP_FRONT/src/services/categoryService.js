// src/services/categoryService.js
import api from './api';

const categoryService = {
  // Obtener todas las categorías
    getAll: async () => {
      const response = await api.get('/categoria');
      return response.data;
    },
  
    // Obtener categoría por ID
    getById: async (id) => {
      const response = await api.get(`/categoria/${id}`);
      return response.data;
    },
  
    // Crear categoría
    create: async (categoryData) => {
      const response = await api.post('/categoria', categoryData);
      return response.data;
    },
  
    // Actualizar categoría
    update: async (id, categoryData) => {
      const response = await api.put(`/categoria/${id}`, categoryData);
      return response.data;
    },
  
    // Eliminar categoría
    delete: async (id) => {
      const response = await api.delete(`/categoria/${id}`);
      return response.data;
    },
};

export default categoryService;