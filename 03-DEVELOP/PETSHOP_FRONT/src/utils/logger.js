// Sistema de logging profesional para debugging y producción

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const isDevelopment = import.meta.env.MODE === 'development';

/**
 * Formatea el mensaje de log con contexto
 */
const formatLogMessage = (level, context, message, data = null) => {
  const timestamp = new Date().toISOString();
  
  return {
    timestamp,
    level,
    context,
    message,
    data
  };
};

/**
 * Logger profesional con contexto y niveles
 */
export const logger = {
  /**
   * Log de error - siempre visible
   * @param {string} context - Contexto del error
   * @param {string} message - Mensaje descriptivo
   * @param {Error|Object} error - Objeto de error o datos adicionales
   */
  error: (context, message, error = null) => {
    const log = formatLogMessage(LOG_LEVELS.ERROR, context, message, error);
    
    console.group(`[${log.timestamp}] ERROR - ${log.context}`);
    console.error(log.message);
    
    if (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
        if (isDevelopment && error.stack) {
          console.error('Stack trace:', error.stack);
        }
      }
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('HTTP status:', error.response.status);
        if (isDevelopment) {
          console.error('Response headers:', error.response.headers);
        }
      }
      
      if (error.config && isDevelopment) {
        console.error('Request config:', {
          url: error.config.url,
          method: error.config.method,
          data: error.config.data
        });
      }
      
      if (typeof error === 'object' && !(error instanceof Error)) {
        console.error('Additional data:', error);
      }
    }
    console.groupEnd();
  },

  /**
   * Log de advertencia - visible en desarrollo
   * @param {string} context - Contexto de la advertencia
   * @param {string} message - Mensaje descriptivo
   * @param {any} data - Datos adicionales opcionales
   */
  warn: (context, message, data = null) => {
    if (!isDevelopment) return;
    
    const log = formatLogMessage(LOG_LEVELS.WARN, context, message, data);
    console.warn(`[${log.timestamp}] WARN - ${log.context}: ${log.message}`);
    if (data) console.warn('Data:', data);
  },

  /**
   * Log de información - visible en desarrollo
   * @param {string} context - Contexto de la información
   * @param {string} message - Mensaje descriptivo
   * @param {any} data - Datos adicionales opcionales
   */
  info: (context, message, data = null) => {
    if (!isDevelopment) return;
    
    const log = formatLogMessage(LOG_LEVELS.INFO, context, message, data);
    console.log(`[${log.timestamp}] INFO - ${log.context}: ${log.message}`);
    if (data) console.log('Data:', data);
  },

  /**
   * Log de debug - solo en desarrollo
   * @param {string} context - Contexto del debug
   * @param {string} message - Mensaje descriptivo
   * @param {any} data - Datos adicionales opcionales
   */
  debug: (context, message, data = null) => {
    if (!isDevelopment) return;
    
    const log = formatLogMessage(LOG_LEVELS.DEBUG, context, message, data);
    console.debug(`[${log.timestamp}] DEBUG - ${log.context}: ${log.message}`);
    if (data) console.debug('Data:', data);
  },

  /**
   * Log de éxito - visible en desarrollo
   * @param {string} context - Contexto de la operación exitosa
   * @param {string} message - Mensaje descriptivo
   * @param {any} data - Datos adicionales opcionales
   */
  success: (context, message, data = null) => {
    if (!isDevelopment) return;
    
    const log = formatLogMessage('SUCCESS', context, message, data);
    console.log(`[${log.timestamp}] SUCCESS - ${log.context}: ${log.message}`);
    if (data) console.log('Data:', data);
  },

  /**
   * Agrupa logs relacionados
   * @param {string} groupName - Nombre del grupo
   * @param {Function} callback - Función que contiene los logs
   */
  group: (groupName, callback) => {
    if (!isDevelopment) {
      callback();
      return;
    }
    
    console.group(groupName);
    callback();
    console.groupEnd();
  },

  /**
   * Mide el tiempo de ejecución de una función
   * @param {string} label - Etiqueta para la medición
   * @param {Function} callback - Función a medir
   */
  time: async (label, callback) => {
    const start = performance.now();
    try {
      const result = await callback();
      const duration = (performance.now() - start).toFixed(2);
      if (isDevelopment) {
        console.log(`[TIMER] ${label}: ${duration}ms`);
      }
      return result;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      logger.error(label, `Failed after ${duration}ms`, error);
      throw error;
    }
  }
};

/**
 * Extrae mensaje de error legible del backend
 * @param {Error|Object} error - Error de axios o error genérico
 * @returns {string} Mensaje de error formateado
 */
export const getErrorMessage = (error) => {
  // Error con respuesta del servidor en formato estándar
  if (error?.response?.data?.error) {
    const { code, message, details, field } = error.response.data.error;
    
    // Priorizar mensaje del servidor con contexto
    let msg = message || 'Error desconocido';
    
    // Agregar información del campo si está disponible
    if (field) {
      const fieldNames = {
        'numero_documento': 'Número de documento',
        'numero_telefono': 'Número de teléfono',
        'correo_electronico': 'Correo electrónico',
        'codigo_sku': 'Código SKU',
        'nombre': 'Nombre',
        'primer_nombre': 'Primer nombre',
        'primer_apellido': 'Primer apellido'
      };
      const fieldLabel = fieldNames[field] || field;
      
      // Si el mensaje no incluye el campo, agregarlo
      if (!msg.includes(fieldLabel)) {
        msg = `${fieldLabel}: ${msg}`;
      }
    }
    
    // Agregar detalles adicionales si existen
    if (details && typeof details === 'string') {
      msg += ` (${details})`;
    }
    
    // Log del código para debugging
    if (code && isDevelopment) {
      console.debug(`Error code: ${code}`);
    }
    
    return msg;
  }
  
  // Error de axios sin formato estándar
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Error de validación de axios
  if (error?.response?.status === 400 && error?.response?.data) {
    return typeof error.response.data === 'string' 
      ? error.response.data 
      : 'Datos inválidos. Verifica la información e intenta nuevamente.';
  }
  
  // Error genérico de JavaScript
  if (error?.message) {
    return error.message;
  }
  
  // Fallback
  return 'Ha ocurrido un error inesperado';
};

export default logger;
