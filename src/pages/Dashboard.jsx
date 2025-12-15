// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackendStatus from '../components/BackendStatus'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import clientService from '../services/clientService'
import productService from '../services/productService'
import categoryService from '../services/categoryService'
import systemService from '../services/systemService'

export default function Dashboard() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    clientes: 0,
    productos: 0,
    categorias: 0,
    recibos: 0
  })
  const [systemStatus, setSystemStatus] = useState({
    backend: 'checking',
    database: 'checking',
    responseTime: null,
    performance: 'checking'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      try {
        // Usar los servicios existentes
        const [clientesData, productosData, categoriasData] = await Promise.all([
          clientService.getAll().catch(() => []),
          productService.getAll().catch(() => []),
          categoryService.getAll().catch(() => [])
        ])

        console.log('Clientes cargados:', clientesData)
        console.log('Productos cargados:', productosData)
        console.log('Categorías cargadas:', categoriasData)

        // Cargar estado del sistema
        const sysStatus = await systemService.getSystemStatus()
        console.log('Estado del sistema:', sysStatus)

        // Determinar rendimiento basado en tiempo de respuesta
        let performance = 'checking'
        if (sysStatus.responseTime !== null) {
          if (sysStatus.responseTime < 100) {
            performance = 'Excelente'
          } else if (sysStatus.responseTime < 300) {
            performance = 'Bueno'
          } else if (sysStatus.responseTime < 500) {
            performance = 'Moderado'
          } else {
            performance = 'Lento'
          }
        }

        setSystemStatus({
          backend: sysStatus.success ? 'online' : 'offline',
          database: sysStatus.success ? 'connected' : 'disconnected',
          responseTime: sysStatus.responseTime,
          performance: performance
        })

        // Contar recibos (si hay servicio disponible, sino usar 0)
        let recibosCount = 0
        try {
          const recibosModule = await import('../services/recibosDeCajaService')
          const recibosData = await recibosModule.default.getAll().catch(() => [])
          recibosCount = Array.isArray(recibosData) ? recibosData.length : 0
        } catch (err) {
          console.log('Servicio de recibos no disponible')
        }

        setStats({
          clientes: Array.isArray(clientesData) ? clientesData.length : 0,
          productos: Array.isArray(productosData) ? productosData.length : 0,
          categorias: Array.isArray(categoriasData) ? categoriasData.length : 0,
          recibos: recibosCount
        })

        console.log('📊 Estadísticas finales:', {
          clientes: Array.isArray(clientesData) ? clientesData.length : 0,
          productos: Array.isArray(productosData) ? productosData.length : 0,
          categorias: Array.isArray(categoriasData) ? categoriasData.length : 0,
          recibos: recibosCount
        })
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Buenos días' : currentHour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const userName = user?.email?.split('@')[0] || user?.correo_electronico?.split('@')[0] || 'Usuario'

  return (
    <div className="container-fluid py-4">
      {/* Hero Section con Gradiente */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-lg dashboard-hero-modern">
            <div className="card-body p-5">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <div className="d-flex align-items-center mb-3">
                    <div className="hero-icon-modern me-4">
                      <i className="bi bi-shop"></i>
                    </div>
                    <div>
                      <h1 className="display-4 fw-bold text-white mb-2">
                        {greeting}, {userName}
                      </h1>
                      <p className="lead text-white-50 mb-0">
                        <i className="bi bi-building me-2"></i>
                        PETSHOP - Sistema de inventario y gestión de ventas
                      </p>
                    </div>
                  </div>
                  <div className="hero-subtitle-modern">
                    <i className="bi bi-quote me-2"></i>
                    "Entre Perros y Gatos - Tu mejor aliado en gestión de inventarios"
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="text-white text-lg-end mt-4 mt-lg-0">
                    <div className="d-inline-block text-center px-4 py-3 bg-white bg-opacity-10 rounded-4 backdrop-blur">
                      <div className="fs-3 fw-bold">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div className="text-white-50">{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Principales con Gradientes */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm stat-card-modern stat-card-success h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="stat-icon-circle-modern bg-success bg-opacity-10">
                  <i className="bi bi-people-fill text-success"></i>
                </div>
                <span className="badge bg-success bg-opacity-10 text-success">
                  <i className="bi bi-arrow-up me-1"></i>+12%
                </span>
              </div>
              <h3 className="fw-bold mb-1">{loading ? '...' : stats.clientes}</h3>
              <p className="text-muted mb-0">Clientes Registrados</p>
              <div className="progress mt-3" style={{ height: '4px' }}>
                <div className="progress-bar bg-success" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm stat-card-modern stat-card-primary h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="stat-icon-circle-modern bg-primary bg-opacity-10">
                  <i className="bi bi-box-seam-fill text-primary"></i>
                </div>
                <span className="badge bg-primary bg-opacity-10 text-primary">
                  <i className="bi bi-arrow-up me-1"></i>+8%
                </span>
              </div>
              <h3 className="fw-bold mb-1">{loading ? '...' : stats.productos}</h3>
              <p className="text-muted mb-0">Productos en Stock</p>
              <div className="progress mt-3" style={{ height: '4px' }}>
                <div className="progress-bar bg-primary" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm stat-card-modern stat-card-warning h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="stat-icon-circle-modern bg-warning bg-opacity-10">
                  <i className="bi bi-tags-fill text-warning"></i>
                </div>
                <span className="badge bg-warning bg-opacity-10 text-warning">
                  <i className="bi bi-dash me-1"></i>Estable
                </span>
              </div>
              <h3 className="fw-bold mb-1">{loading ? '...' : stats.categorias}</h3>
              <p className="text-muted mb-0">Categorías Activas</p>
              <div className="progress mt-3" style={{ height: '4px' }}>
                <div className="progress-bar bg-warning" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm stat-card-modern stat-card-info h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="stat-icon-circle-modern bg-info bg-opacity-10">
                  <i className="bi bi-receipt-cutoff text-info"></i>
                </div>
                <span className="badge bg-info bg-opacity-10 text-info">
                  <i className="bi bi-arrow-up me-1"></i>+25%
                </span>
              </div>
              <h3 className="fw-bold mb-1">{loading ? '...' : stats.recibos}</h3>
              <p className="text-muted mb-0">Recibos Generados</p>
              <div className="progress mt-3" style={{ height: '4px' }}>
                <div className="progress-bar bg-info" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos con Diseño Moderno */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-grid-3x3-gap-fill text-primary me-2"></i>
                Accesos Rápidos
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-lg-3 col-md-6">
                  <div className="quick-access-card quick-access-success" onClick={() => navigate('/clientes')} style={{ cursor: 'pointer' }}>
                    <div className="quick-access-icon">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <h6 className="quick-access-title">Gestión de Clientes</h6>
                    <p className="quick-access-text">Administra tu base de clientes</p>
                    <div className="quick-access-arrow">
                      <i className="bi bi-arrow-right-circle-fill"></i>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="quick-access-card quick-access-primary" onClick={() => navigate('/productos')} style={{ cursor: 'pointer' }}>
                    <div className="quick-access-icon">
                      <i className="bi bi-box-seam-fill"></i>
                    </div>
                    <h6 className="quick-access-title">Productos</h6>
                    <p className="quick-access-text">Control de stock y productos</p>
                    <div className="quick-access-arrow">
                      <i className="bi bi-arrow-right-circle-fill"></i>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="quick-access-card quick-access-info" onClick={() => navigate('/recibos-de-caja')} style={{ cursor: 'pointer' }}>
                    <div className="quick-access-icon">
                      <i className="bi bi-receipt-cutoff"></i>
                    </div>
                    <h6 className="quick-access-title">Recibos de Caja</h6>
                    <p className="quick-access-text">Procesar ventas y pagos</p>
                    <div className="quick-access-arrow">
                      <i className="bi bi-arrow-right-circle-fill"></i>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="quick-access-card quick-access-warning" onClick={() => navigate('/categorias')} style={{ cursor: 'pointer' }}>
                    <div className="quick-access-icon">
                      <i className="bi bi-tags-fill"></i>
                    </div>
                    <h6 className="quick-access-title">Categorías</h6>
                    <p className="quick-access-text">Organiza tus productos</p>
                    <div className="quick-access-arrow">
                      <i className="bi bi-arrow-right-circle-fill"></i>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="quick-access-card quick-access-purple" onClick={() => navigate('/recibos-de-caja/historial')} style={{ cursor: 'pointer' }}>
                    <div className="quick-access-icon">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <h6 className="quick-access-title">Historial</h6>
                    <p className="quick-access-text">Historial de recibos</p>
                    <div className="quick-access-arrow">
                      <i className="bi bi-arrow-right-circle-fill"></i>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="quick-access-card quick-access-danger" onClick={() => navigate('/cierres-caja')} style={{ cursor: 'pointer' }}>
                    <div className="quick-access-icon">
                      <i className="bi bi-calculator"></i>
                    </div>
                    <h6 className="quick-access-title">Cierres de Caja</h6>
                    <p className="quick-access-text">Cierres y reportes</p>
                    <div className="quick-access-arrow">
                      <i className="bi bi-arrow-right-circle-fill"></i>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="quick-access-card quick-access-secondary" onClick={() => navigate('/usuarios')} style={{ cursor: 'pointer' }}>
                    <div className="quick-access-icon">
                      <i className="bi bi-person-gear"></i>
                    </div>
                    <h6 className="quick-access-title">Usuarios</h6>
                    <p className="quick-access-text">Gestión de usuarios</p>
                    <div className="quick-access-arrow">
                      <i className="bi bi-arrow-right-circle-fill"></i>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  <div className="quick-access-card quick-access-teal" onClick={() => navigate('/productos/crear')} style={{ cursor: 'pointer' }}>
                    <div className="quick-access-icon">
                      <i className="bi bi-plus-circle-fill"></i>
                    </div>
                    <h6 className="quick-access-title">Crear Producto</h6>
                    <p className="quick-access-text">Añadir nuevo producto</p>
                    <div className="quick-access-arrow">
                      <i className="bi bi-arrow-right-circle-fill"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del Sistema y Backend */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-info-circle-fill text-primary me-2"></i>
                Estado del Sistema
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="system-status-item">
                    <div className={`system-status-icon bg-${systemStatus.backend === 'online' ? 'success' : 'danger'} bg-opacity-10`}>
                      <i className={`bi bi-${systemStatus.backend === 'online' ? 'check-circle-fill' : 'x-circle-fill'} text-${systemStatus.backend === 'online' ? 'success' : 'danger'}`}></i>
                    </div>
                    <h6 className="mt-3 mb-1">Servidor Activo</h6>
                    <p className="text-muted small mb-0">
                      {systemStatus.backend === 'checking' ? 'Verificando...' : systemStatus.backend === 'online' ? 'Sistema operativo' : 'Sistema offline'}
                    </p>
                    <span className={`badge bg-${systemStatus.backend === 'online' ? 'success' : 'danger'} mt-2`}>
                      {systemStatus.backend === 'checking' ? 'Verificando' : systemStatus.backend === 'online' ? '100% Operativo' : 'No disponible'}
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="system-status-item">
                    <div className={`system-status-icon bg-${systemStatus.database === 'connected' ? 'primary' : 'danger'} bg-opacity-10`}>
                      <i className={`bi bi-database-fill-${systemStatus.database === 'connected' ? 'check' : 'x'} text-${systemStatus.database === 'connected' ? 'primary' : 'danger'}`}></i>
                    </div>
                    <h6 className="mt-3 mb-1">Base de Datos</h6>
                    <p className="text-muted small mb-0">
                      {systemStatus.database === 'checking' ? 'Verificando...' : systemStatus.database === 'connected' ? 'Conexión estable' : 'Error de conexión'}
                    </p>
                    <span className={`badge bg-${systemStatus.database === 'connected' ? 'primary' : 'danger'} mt-2`}>
                      {systemStatus.database === 'checking' ? 'Verificando' : systemStatus.database === 'connected' ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="system-status-item">
                    <div className={`system-status-icon bg-${systemStatus.performance === 'Excelente' ? 'success' : systemStatus.performance === 'Bueno' ? 'info' : systemStatus.performance === 'Moderado' ? 'warning' : 'danger'} bg-opacity-10`}>
                      <i className={`bi bi-speedometer2 text-${systemStatus.performance === 'Excelente' ? 'success' : systemStatus.performance === 'Bueno' ? 'info' : systemStatus.performance === 'Moderado' ? 'warning' : 'danger'}`}></i>
                    </div>
                    <h6 className="mt-3 mb-1">Rendimiento</h6>
                    <p className="text-muted small mb-0">
                      {systemStatus.responseTime !== null ? `${systemStatus.responseTime}ms` : 'Midiendo...'}
                    </p>
                    <span className={`badge bg-${systemStatus.performance === 'Excelente' ? 'success' : systemStatus.performance === 'Bueno' ? 'info' : systemStatus.performance === 'Moderado' ? 'warning' : 'danger'} mt-2`}>
                      {systemStatus.performance}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <i className={`bi bi-shield-${systemStatus.backend === 'online' ? 'check' : 'x'} text-${systemStatus.backend === 'online' ? 'success' : 'danger'} fs-3 me-3`}></i>
                    <div>
                      <h6 className="mb-0">Seguridad</h6>
                      <small className="text-muted">{systemStatus.backend === 'online' ? 'Sistema protegido con JWT' : 'Verificación pendiente'}</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-clock-history text-primary fs-3 me-3"></i>
                    <div>
                      <h6 className="mb-0">Última actualización</h6>
                      <small className="text-muted">{new Date().toLocaleString('es-ES')}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-hdd-network-fill text-success me-2"></i>
                Estado del Backend
              </h5>
            </div>
            <div className="card-body p-4">
              <BackendStatus />
              
              <hr className="my-4" />
              
              <div className="backend-info">
                <div className="d-flex align-items-center mb-3">
                  <div className={`status-dot bg-${systemStatus.backend === 'online' ? 'success' : 'danger'} me-2`}></div>
                  <small className="text-muted">{systemStatus.backend === 'online' ? 'API REST Activa' : 'API REST Inactiva'}</small>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className={`status-dot bg-${systemStatus.database === 'connected' ? 'success' : 'danger'} me-2`}></div>
                  <small className="text-muted">{systemStatus.database === 'connected' ? 'Base de Datos Conectada' : 'Base de Datos Desconectada'}</small>
                </div>
                <div className="d-flex align-items-center">
                  <div className={`status-dot bg-${systemStatus.backend === 'online' ? 'success' : 'danger'} me-2`}></div>
                  <small className="text-muted">{systemStatus.backend === 'online' ? 'Autenticación JWT Activa' : 'Autenticación No Disponible'}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
