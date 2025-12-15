import api from './api';

/**
 * Sube un archivo al servidor para imágenes de productos.
 *
 * @param {File} file - El archivo de imagen a subir.
 * @returns {Promise<string>} - La URL de la imagen subida.
 */
async function uploadProductImage(file) {
  if (!file) {
    throw new Error('No se proporcionó ningún archivo para subir.');
  }

  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('El archivo es muy grande. Máximo: 5MB.');
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Formato de imagen no válido. Solo se permiten JPG, PNG, GIF, WEBP.');
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await api.post('/upload/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Upload response:', response.data);

    // El backend devuelve: { success: true, url: "...", filename: "...", size: ..., mimetype: "..." }
    // Axios wrappea esto en response.data
    if (response.data && response.data.url) {
      return response.data.url;
    } else {
      console.error('Formato de respuesta inesperado:', response.data);
      throw new Error('Respuesta del servidor no contiene URL de imagen.');
    }
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    console.error('Response data:', error.response?.data);
    
    // Si el backend devolvió un error estructurado
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    
    // Error genérico
    throw new Error('No se pudo subir la imagen del producto.');
  }
}

// Export default
export default {
  uploadProductImage
};
