import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function BackendStatus() {
  const [status, setStatus] = useState({ connected: false, message: 'Comprobando...', count: null })

  useEffect(() => {
    let mounted = true

    async function check() {
      try {
        const res = await api.get('http://localhost:3001/health')
        // Health check, no count
        const count = null
        if (mounted) setStatus({ connected: true, message: 'Conectado al Backend Node.js', count })
      } catch (err) {
        if (mounted) setStatus({ connected: false, message: 'Error en la conexión al Backend: ' + (err.message || String(err)), count: null })
      }
    }

    check()
    return () => { mounted = false }
  }, [])

  return (
    <div className="card border-0 shadow-sm mt-3">
      <div className="card-body p-3">
        <h6 className="card-title mb-2">
          <i className="bi bi-server me-2"></i>
          Estado del Backend
        </h6>
        <div className="d-flex align-items-center">
          <span className={`badge ${status.connected ? 'bg-success' : 'bg-danger'} me-2`}>
            <i className={`bi ${status.connected ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
            {status.connected ? 'Conectado' : 'Desconectado'}
          </span>
          <small className="text-muted">{status.message}</small>
        </div>
        {status.count !== null && (
          <div className="mt-2">
            <small className="text-muted">Productos registrados: <strong>{status.count}</strong></small>
          </div>
        )}
      </div>
    </div>
  )
}
