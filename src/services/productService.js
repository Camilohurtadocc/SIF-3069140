// src/services/productService.js
import api from './api';

const productService = {
  // Obtener todos los productos
  getAll: async () => {
    const response = await api.get('/product');
    return response.data.data || response.data; // Manejar paginación
  },

  // Obtener producto por ID
  getById: async (id) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },

  // Crear producto
  create: async (productData) => {
    const response = await api.post('/product', productData);
    return response.data;
  },

  // Actualizar producto
  update: async (id, productData) => {
    const response = await api.put(`/product/${id}`, productData);
    return response.data;
  },

  // Eliminar producto
  delete: async (id) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },
};

export default productService;