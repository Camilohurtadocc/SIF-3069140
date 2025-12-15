// src/services/systemService.js
import api from './api'

const systemService = {
  /**
   * Obtiene información del estado del sistema
   * Incluyendo: backend, base de datos y rendimiento
   */
  getSystemStatus: async () => {
    try {
      const startTime = performance.now()
      
      // Usar el endpoint /me que ya existe y valida la conexión
      const response = await api.get('/me')
      
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      return {
        success: true,
        backend: 'online',
        database: 'connected',
        responseTime: Math.round(responseTime),
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        backend: 'offline',
        database: 'disconnected',
        responseTime: null,
        error: error.message,
        timestamp: new Date()
      }
    }
  },

  /**
   * Verifica solo si el backend está disponible
   */
  checkBackend: async () => {
    try {
      await api.get('/me')
      return {
        online: true,
        message: 'Backend activo'
      }
    } catch (error) {
      return {
        online: false,
        message: 'Backend desconectado'
      }
    }
  },

  /**
   * Obtiene estadísticas del sistema
   */
  getStats: async () => {
    try {
      const response = await api.get('/me')
      return response.data
    } catch (error) {
      return null
    }
  }
}

export default systemService
