// src/pages/CierresCaja.jsx
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import cierresCajaService from '../services/cierresCajaService'
import api from '../services/api'

// Función para formatear números con separación de miles
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

export default function CierresCaja() {
  const { user } = useAuth()
  const [cierres, setCierres] = useState([])
  const [loading, setLoading] = useState(false)
  const [tipoPeriodo, setTipoPeriodo] = useState('diario')
  const [fechaReferencia, setFechaReferencia] = useState(new Date().toISOString().split('T')[0])
  const [cierreSeleccionado, setCierreSeleccionado] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  useEffect(() => {
    cargarCierres()
  }, [])

  async function cargarCierres() {
    try {
      const response = await cierresCajaService.getAll()
      let data = response
      if (!Array.isArray(data)) {
        data = data.data || []
      }
      // Ordenar por fecha_cierre descendente
      data.sort((a, b) => new Date(b.fecha_cierre) - new Date(a.fecha_cierre))
      setCierres(data)
    } catch (error) {
      console.error('Error cargando cierres:', error)
      toast.error('Error al cargar cierres')
    }
  }

  function calcularFechasPeriodo(tipo, fechaRef) {
    const fecha = new Date(fechaRef)
    let fechaInicio, fechaFin

    switch (tipo) {
      case 'diario':
        fechaInicio = new Date(fecha)
        fechaFin = new Date(fecha)
        break
      case 'semanal':
        const diaSemana = fecha.getDay()
        fechaInicio = new Date(fecha)
        fechaInicio.setDate(fecha.getDate() - diaSemana)
        fechaFin = new Date(fechaInicio)
        fechaFin.setDate(fechaInicio.getDate() + 6)
        break
      case 'quincenal':
        const diaMes = fecha.getDate()
        if (diaMes <= 15) {
          fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
          fechaFin = new Date(fecha.getFullYear(), fecha.getMonth(), 15)
        } else {
          fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), 16)
          fechaFin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)
        }
        break
      case 'mensual':
        fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
        fechaFin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)
        break
      case 'anual':
        fechaInicio = new Date(fecha.getFullYear(), 0, 1)
        fechaFin = new Date(fecha.getFullYear(), 11, 31)
        break
      default:
        return null
    }

    return {
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0]
    }
  }

  async function generarCierre() {
    if (!user) {
      toast.error('Usuario no autenticado')
      return
    }

    const userId = user.id_usuario || user.id
    if (!userId) {
      toast.error('ID de usuario no disponible')
      return
    }

    // Validar que la fecha de referencia no sea futura
    const fechaRef = new Date(fechaReferencia)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    if (fechaRef > hoy) {
      toast.error('No se pueden generar cierres para fechas futuras')
      return
    }

    setLoading(true)
    try {
      // El backend calcula fechas, verifica duplicados y calcula totales automáticamente
      const cierreData = {
        tipo_periodo: tipoPeriodo,
        fecha_referencia: fechaReferencia,
        id_usuario: userId
      }

      console.log('Enviando datos de cierre:', JSON.stringify(cierreData, null, 2))
      
      await cierresCajaService.create(cierreData)
      
      console.log('Cierre creado exitosamente')
      toast.success(`Cierre ${tipoPeriodo} generado correctamente`)
      cargarCierres()
    } catch (error) {
      console.error('Error general:', error)
      console.error('Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        statusText: error.response?.statusText
      })
      toast.error(error.response?.data?.error || error.message || 'Error inesperado al generar cierre')
    } finally {
      setLoading(false)
    }
  }

  function mostrarDetalleCierre(cierre) {
    setCierreSeleccionado(cierre)
    setMostrarModal(true)
  }

  function cerrarModal() {
    setMostrarModal(false)
    setCierreSeleccionado(null)
  }

  return (
    <div className="container-fluid px-4 py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/dashboard" className="text-decoration-none">
              <i className="bi bi-house-door me-1"></i>
              Inicio
            </a>
          </li>
          <li className="breadcrumb-item">
            <span className="text-muted">
              <i className="bi bi-cash-coin me-1"></i>
              Caja
            </span>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            <i className="bi bi-calculator me-1"></i>
            Cierres de Caja
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i className="bi bi-calculator fs-2 text-success"></i>
              </div>
              <div>
                <h3 className="mb-1 fw-bold">Cierres de Caja</h3>
                <p className="text-muted mb-0">Genera y consulta cierres por períodos</p>
              </div>
            </div>
            <div>
              <div className="fs-4 fw-bold text-success">{cierres.length}</div>
              <div className="small text-muted">Cierres Registrados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Card: Generar Nuevo Cierre */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">
            <i className="bi bi-plus-circle text-success me-2"></i>
            Generar Nuevo Cierre
          </h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={(e) => { e.preventDefault(); generarCierre(); }}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar3 me-1"></i>
                  Tipo de Período
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-clock-history"></i>
                  </span>
                  <select
                    className="form-select"
                    value={tipoPeriodo}
                    onChange={(e) => setTipoPeriodo(e.target.value)}
                  >
                    <option value="diario">Diario</option>
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar-event me-1"></i>
                  Fecha de Referencia
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-calendar3"></i>
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaReferencia}
                    onChange={(e) => setFechaReferencia(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calculator me-2"></i>
                      Generar Cierre
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Card: Lista de Cierres */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">
            <i className="bi bi-list-ul text-primary me-2"></i>
            Historial de Cierres
          </h5>
        </div>
        <div className="card-body p-0">
          {cierres.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="bi bi-calculator" style={{ fontSize: '4rem', color: '#dee2e6' }}></i>
              </div>
              <h5 className="text-muted">No hay cierres registrados</h5>
              <p className="text-muted">Genera tu primer cierre usando el formulario superior</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">
                      <i className="bi bi-tag me-1"></i>
                      Tipo
                    </th>
                    <th className="px-4 py-3">
                      <i className="bi bi-calendar-range me-1"></i>
                      Período
                    </th>
                    <th className="px-4 py-3 text-center">
                      <i className="bi bi-receipt me-1"></i>
                      Recibos
                    </th>
                    <th className="px-4 py-3 text-end">
                      <i className="bi bi-cash-stack me-1"></i>
                      Total
                    </th>
                    <th className="px-4 py-3">
                      <i className="bi bi-calendar-check me-1"></i>
                      Fecha Cierre
                    </th>
                    <th className="px-4 py-3 text-center">
                      <i className="bi bi-eye me-1"></i>
                      Ver
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cierres.map((cierre) => (
                    <tr key={cierre.id_cierre_caja}>
                      <td className="px-4 py-3">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                          {cierre.tipo_periodo.charAt(0).toUpperCase() + cierre.tipo_periodo.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="fw-semibold">
                          {new Date(cierre.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </div>
                        <small className="text-muted">
                          hasta {new Date(cierre.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </small>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="badge bg-info bg-opacity-10 text-info px-3 py-2">
                          {cierre.cantidad_recibos}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <span className="fw-bold text-success fs-6">
                          {formatCurrency(cierre.total_ventas)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="fw-semibold">
                          {new Date(cierre.fecha_cierre).toLocaleDateString('es-ES')}
                        </div>
                        <small className="text-muted">
                          {new Date(cierre.fecha_cierre).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => mostrarDetalleCierre(cierre)}
                          title="Ver detalles completos"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del cierre */}
      {mostrarModal && cierreSeleccionado && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-semibold">
                  Detalle de Cierre - {cierreSeleccionado.tipo_periodo.charAt(0).toUpperCase() + cierreSeleccionado.tipo_periodo.slice(1)}
                </h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <div className="modal-body p-4">
                {/* Encabezado de información */}
                <div className="border-bottom pb-3 mb-4">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-semibold">FECHA DE CIERRE</label>
                        <div className="h6 mb-0">{new Date(cierreSeleccionado.fecha_cierre).toLocaleDateString('es-ES')} - {new Date(cierreSeleccionado.fecha_cierre).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-semibold">USUARIO</label>
                        <div className="h6 mb-0">{cierreSeleccionado.usuario?.nombre || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-0">
                        <label className="form-label text-muted small fw-semibold">PERÍODO INICIO</label>
                        <div className="h6 mb-0">{new Date(cierreSeleccionado.fecha_inicio).toLocaleDateString('es-ES')}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-0">
                        <label className="form-label text-muted small fw-semibold">PERÍODO FIN</label>
                        <div className="h6 mb-0">{new Date(cierreSeleccionado.fecha_fin).toLocaleDateString('es-ES')}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-0">
                        <label className="form-label text-muted small fw-semibold">DURACIÓN</label>
                        <div className="h6 mb-0">
                          {cierreSeleccionado.detalle_periodo?.dias_periodo || 
                            Math.ceil((new Date(cierreSeleccionado.fecha_fin) - new Date(cierreSeleccionado.fecha_inicio)) / (1000 * 60 * 60 * 24))} días
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen de Ventas - Tabla profesional */}
                <div className="mb-4">
                  <h6 className="fw-semibold text-dark mb-3">RESUMEN DE VENTAS</h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr className="border-bottom">
                          <td className="text-muted">Total de Recibos</td>
                          <td className="text-end fw-semibold">{cierreSeleccionado.cantidad_recibos}</td>
                        </tr>
                        <tr className="border-bottom">
                          <td className="text-muted">Total Vendido</td>
                          <td className="text-end fw-semibold text-success">{formatCurrency(cierreSeleccionado.total_ventas)}</td>
                        </tr>
                        <tr className="border-bottom">
                          <td className="text-muted">Venta Promedio por Recibo</td>
                          <td className="text-end fw-semibold">
                            {cierreSeleccionado.cantidad_recibos > 0 ? 
                              formatCurrency(cierreSeleccionado.total_ventas / cierreSeleccionado.cantidad_recibos) : 
                              'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted">Venta Promedio Diaria</td>
                          <td className="text-end fw-semibold">
                            {cierreSeleccionado.cantidad_recibos > 0 && cierreSeleccionado.detalle_periodo?.dias_periodo ?
                              formatCurrency(cierreSeleccionado.total_ventas / cierreSeleccionado.detalle_periodo.dias_periodo) :
                              'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Desglose por Método de Pago */}
                {cierreSeleccionado.resumen_pagos && (
                  <div className="mb-4">
                    <h6 className="fw-semibold text-dark mb-3">DESGLOSE POR MÉTODO DE PAGO</h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-borderless">
                        <tbody>
                          {cierreSeleccionado.resumen_pagos.efectivo > 0 && (
                            <tr className="border-bottom">
                              <td className="text-muted">Efectivo</td>
                              <td className="text-end fw-semibold">{formatCurrency(cierreSeleccionado.resumen_pagos.efectivo)}</td>
                              <td className="text-end text-muted" style={{width: '80px'}}>
                                {((cierreSeleccionado.resumen_pagos.efectivo / cierreSeleccionado.total_ventas) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          )}
                          {cierreSeleccionado.resumen_pagos.tarjeta_credito > 0 && (
                            <tr className="border-bottom">
                              <td className="text-muted">Tarjeta Crédito</td>
                              <td className="text-end fw-semibold">{formatCurrency(cierreSeleccionado.resumen_pagos.tarjeta_credito)}</td>
                              <td className="text-end text-muted" style={{width: '80px'}}>
                                {((cierreSeleccionado.resumen_pagos.tarjeta_credito / cierreSeleccionado.total_ventas) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          )}
                          {cierreSeleccionado.resumen_pagos.tarjeta_debito > 0 && (
                            <tr className="border-bottom">
                              <td className="text-muted">Tarjeta Débito</td>
                              <td className="text-end fw-semibold">{formatCurrency(cierreSeleccionado.resumen_pagos.tarjeta_debito)}</td>
                              <td className="text-end text-muted" style={{width: '80px'}}>
                                {((cierreSeleccionado.resumen_pagos.tarjeta_debito / cierreSeleccionado.total_ventas) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          )}
                          {cierreSeleccionado.resumen_pagos.transferencia > 0 && (
                            <tr>
                              <td className="text-muted">Transferencia</td>
                              <td className="text-end fw-semibold">{formatCurrency(cierreSeleccionado.resumen_pagos.transferencia)}</td>
                              <td className="text-end text-muted" style={{width: '80px'}}>
                                {((cierreSeleccionado.resumen_pagos.transferencia / cierreSeleccionado.total_ventas) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Estadísticas clave */}
                <div className="bg-light p-3 rounded">
                  <h6 className="fw-semibold text-dark mb-3">ESTADÍSTICAS DEL PERÍODO</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <small className="text-muted">Recibos por día promedio</small>
                        <div className="h5 fw-semibold">
                          {cierreSeleccionado.cantidad_recibos > 0 && cierreSeleccionado.detalle_periodo?.dias_periodo ?
                            (cierreSeleccionado.cantidad_recibos / cierreSeleccionado.detalle_periodo.dias_periodo).toFixed(1) :
                            '0'}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <small className="text-muted">Estado</small>
                        <div className="h5 fw-semibold">
                          <span className="badge bg-success">Completado</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top bg-light">
                <button type="button" className="btn btn-sm btn-secondary" onClick={cerrarModal}>
                  Cerrar
                </button>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => window.print()}>
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}