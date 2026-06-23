// src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { ERROR_CODES } from './errorCodes';
import logger from '../utils/logger';

const isDevelopment = import.meta.env.MODE === 'development';

// Configuración base de axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',  // URL del backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT de auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.debug('API', `Request: ${config.method.toUpperCase()} ${config.url}`, {
        hasToken: true,
        tokenPreview: token.substring(0, 20) + '...',
        data: config.data
      });
    } else {
      logger.warn('API', `Request without token: ${config.method.toUpperCase()} ${config.url}`);
      console.warn('No hay token en localStorage para la petición:', config.url);
    }
    
    return config;
  },
  (error) => {
    logger.error('API', 'Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente con códigos específicos
api.interceptors.response.use(
  (response) => {
    logger.debug('API', `Response from ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    const { response, config } = error;
    const noDataMessage =
      response?.data?.error?.message ||
      response?.data?.message ||
      '';
    const isNoDataResponse =
      response?.data?.error?.code === 'ERR_608' ||
      /no hay recibos|sin datos/i.test(noDataMessage);

    // Log detallado del error
    if (!isNoDataResponse) {
      logger.error('API', `Request failed: ${config?.method?.toUpperCase()} ${config?.url}`, {
        status: response?.status,
        statusText: response?.statusText,
        errorData: response?.data,
        requestData: config?.data,
        requestMethod: config?.method
      });
    } else {
      logger.info('API', noDataMessage || 'Respuesta sin datos', {
        status: response?.status,
        url: config?.url
      });
    }

    // Manejo específico por tipo de error del backend
    if (response?.data?.error) {
      const { code, message, details, field } = response.data.error;
      
      // Log detallado del error del backend
      if (isDevelopment) {
        logger.group('Backend Error Details', () => {
          console.table({
            'Code': code || 'N/A',
            'Message': message || 'N/A',
            'Field': field || 'N/A',
            'HTTP Status': response.status
          });
          if (details) {
            logger.info('API', 'Additional details', details);
          }
        });
      }
      
      // NO mostrar toast aquí - dejar que el componente maneje el mensaje
      // El componente usará getErrorMessage() para obtener el mensaje específico
      // y mostrará el toast con el contexto apropiado
    } 
    // Error HTTP 5xx - Error del servidor
    else if (response?.status >= 500) {
      const errorMsg = 'Error interno del servidor. El servicio puede estar temporalmente indisponible.';
      toast.error(errorMsg);
      logger.error('API', errorMsg, {
        status: response.status,
        url: config?.url
      });
    } 
    // Error HTTP 4xx - Error del cliente
    else if (response?.status >= 400) {
      const errorMsg = response?.data?.message || 'Error en la solicitud. Verifica los datos e intenta nuevamente.';
      if (isNoDataResponse) {
        logger.info('API', errorMsg, {
          status: response.status,
          data: response.data
        });
      } else {
        toast.error(errorMsg);
        logger.warn('API', errorMsg, {
          status: response.status,
          data: response.data,
          sentData: config?.data
        });
      }
    } 
    // Error de red o conexión
    else if (!response) {
      const errorMsg = 'Error de conexión. Verifica tu conexión a internet.';
      toast.error(errorMsg);
      logger.error('API', errorMsg, {
        message: error.message,
        code: error.code
      });
    }

    return Promise.reject(error);
  }
);

export default api;
