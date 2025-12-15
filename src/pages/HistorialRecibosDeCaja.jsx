// src/pages/HistorialRecibosDeCaja.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import clientService from '../services/clientService'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Función para formatear números con separación de miles
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

export default function HistorialRecibosDeCaja() {
  const [recibos, setRecibos] = useState([])
  const [clientes, setClientes] = useState([])
  const [fechaIni, setFechaIni] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [selectedRecibo, setSelectedRecibo] = useState(null)

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  }

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [rRes, cRes] = await Promise.all([
          api.get('/recibo-caja'),
          clientService.getAll()
        ])
        let recibosData = rRes.data
        if (!Array.isArray(recibosData)) {
          recibosData = recibosData.data || []
        }
        // Ordenar por fecha descendente
        recibosData.sort((a, b) => new Date(b.fecha_recibo_caja) - new Date(a.fecha_recibo_caja))
        setRecibos(recibosData)

        let clientesData = cRes
        if (!Array.isArray(clientesData)) {
          clientesData = clientesData.data || []
        }
        const clientesMapped = clientesData.map(cliente => ({
          ...cliente,
          nombre_completo: `${cliente.primer_nombre} ${cliente.segundo_nombre || ''} ${cliente.primer_apellido} ${cliente.segundo_apellido || ''}`.trim()
        }))
        setClientes(clientesMapped)
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }
    cargarDatos()
  }, [])

  function nombreCliente(id) {
    const c = clientes.find(x => x.id_cliente === id)
    if (!c) return id
    return c.nombre_completo || ''
  }

  async function handleFiltrar(e) {
    e.preventDefault()
    try {
      let url = '/recibo-caja'
      if (fechaIni && fechaFin) {
        // Asumir que el backend soporta query params para fechas
        url += `?fecha_desde=${fechaIni}&fecha_hasta=${fechaFin}`
      }
      const response = await api.get(url)
      let data = response.data
      if (!Array.isArray(data)) {
        data = data.data || []
      }
      // Ordenar por fecha descendente
      data.sort((a, b) => new Date(b.fecha_recibo_caja) - new Date(a.fecha_recibo_caja))
      setRecibos(data)
    } catch (error) {
      console.error('Error filtrando:', error)
    }
  }

  async function handleVerDetalles(recibo) {
    try {
      // Cargar detalles completos del recibo desde el backend
      const response = await api.get(`/recibo-caja/${recibo.id_recibo_caja}`)
      console.log('Recibo completo cargado:', response.data)
      setSelectedRecibo(response.data)
    } catch (error) {
      console.error('Error cargando detalles del recibo:', error)
      // Si falla, usar el recibo básico que tenemos
      setSelectedRecibo(recibo)
    }
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
            <i className="bi bi-clock-history me-1"></i>
            Historial de Recibos
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <i className="bi bi-clock-history fs-2 text-info"></i>
              </div>
              <div>
                <h3 className="mb-1 fw-bold">Historial de Recibos</h3>
                <p className="text-muted mb-0">Consulta y gestiona todas las transacciones</p>
              </div>
            </div>
            <div className="d-flex gap-4 text-end">
              <div>
                <div className="fs-4 fw-bold text-primary">{recibos.length}</div>
                <div className="small text-muted">Transacciones</div>
              </div>
              <div className="border-start ps-4">
                <div className="fs-4 fw-bold text-success">
                  {formatCurrency(recibos.reduce((sum, r) => sum + Number(r.total || 0), 0))}
                </div>
                <div className="small text-muted">Total Acumulado</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Filtros */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">
            <i className="bi bi-funnel text-primary me-2"></i>
            Filtrar por Fecha
          </h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleFiltrar}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar-event me-1"></i>
                  Fecha Desde
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-calendar3"></i>
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaIni}
                    onChange={(e) => setFechaIni(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar-check me-1"></i>
                  Fecha Hasta
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-calendar3"></i>
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-grow-1">
                    <i className="bi bi-search me-2"></i>
                    Buscar
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setFechaIni('');
                      setFechaFin('');
                      handleFiltrar({ preventDefault: () => {} });
                    }}
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Card de Tabla */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">
            <i className="bi bi-table text-primary me-2"></i>
            Lista de Recibos
          </h5>
        </div>
        <div className="card-body p-0">
          {recibos.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="bi bi-receipt-cutoff" style={{ fontSize: '4rem', color: '#dee2e6' }}></i>
              </div>
              <h5 className="text-muted">No hay recibos registrados</h5>
              <p className="text-muted">Los recibos de caja aparecerán aquí</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">
                      <i className="bi bi-hash me-1"></i>
                      Recibo
                    </th>
                    <th className="px-4 py-3">
                      <i className="bi bi-calendar me-1"></i>
                      Fecha
                    </th>
                    <th className="px-4 py-3">
                      <i className="bi bi-person me-1"></i>
                      Cliente
                    </th>
                    <th className="px-4 py-3">
                      <i className="bi bi-credit-card me-1"></i>
                      Método
                    </th>
                    <th className="px-4 py-3 text-end">
                      <i className="bi bi-cash-coin me-1"></i>
                      Total
                    </th>
                    <th className="px-4 py-3 text-center">
                      <i className="bi bi-gear me-1"></i>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recibos.map((recibo) => (
                    <tr key={recibo.id_recibo_caja}>
                      <td className="px-4 py-3">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                          #{recibo.numero_recibo_caja}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="fw-semibold">
                            {new Date(recibo.fecha_recibo_caja).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <small className="text-muted">
                            {new Date(recibo.fecha_recibo_caja).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="fw-semibold">
                            {nombreCliente(recibo.id_cliente) || 'Cliente no registrado'}
                          </div>
                          <small className="text-muted">ID: {recibo.id_cliente}</small>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-light text-dark">
                          <i className={`bi ${getPaymentIcon(recibo.tipo_pago)} me-1`}></i>
                          {recibo.tipo_pago}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <span className="fw-bold text-success fs-6">
                          {formatCurrency(recibo.total)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Ver detalles"
                            onClick={() => handleVerDetalles(recibo)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            title="Imprimir recibo"
                            onClick={() => handlePrintReceipt(recibo)}
                          >
                            <i className="bi bi-printer"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedRecibo && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedRecibo(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-receipt me-2"></i>
                  Detalles del Recibo #{selectedRecibo.numero_recibo_caja}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setSelectedRecibo(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p><strong>Fecha:</strong> {new Date(selectedRecibo.fecha_recibo_caja).toLocaleString('es-ES')}</p>
                    <p><strong>Cliente:</strong> {nombreCliente(selectedRecibo.id_cliente) || 'Cliente no registrado'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Método de Pago:</strong> {selectedRecibo.tipo_pago || 'No especificado'}</p>
                    <p><strong>Total:</strong> <span className="text-success fw-bold fs-5">{formatCurrency(selectedRecibo.total)}</span></p>
                  </div>
                </div>

                {/* Lista de productos */}
                {(selectedRecibo.productosRecibo || selectedRecibo.detalles) && (selectedRecibo.productosRecibo || selectedRecibo.detalles).length > 0 ? (
                  <div>
                    <h6 className="mb-3">Productos:</h6>
                    <div className="list-group">
                      {(selectedRecibo.productosRecibo || selectedRecibo.detalles).map((detalle, idx) => {
                        const imageUrl = getImageUrl(detalle.producto?.url_imagen)
                        return (
                          <div key={idx} className="list-group-item">
                            <div className="d-flex align-items-center">
                              {/* Thumbnail */}
                              <div style={{ marginRight: '15px', flexShrink: 0 }}>
                                <div 
                                  style={{ 
                                    width: '70px', 
                                    height: '70px', 
                                    overflow: 'hidden', 
                                    borderRadius: '8px',
                                    border: '2px solid #dee2e6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f8f9fa'
                                  }}
                                >
                                  {imageUrl ? (
                                    <img 
                                      src={imageUrl} 
                                      alt={detalle.producto?.nombre_producto || 'Producto'}
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover' 
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = 'none'
                                        e.target.parentElement.innerHTML = '<i class="bi bi-image text-muted"></i>'
                                      }}
                                    />
                                  ) : (
                                    <i className="bi bi-image text-muted"></i>
                                  )}
                                </div>
                              </div>

                              {/* Info del producto */}
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{detalle.producto?.nombre_producto || 'Producto no encontrado'}</h6>
                                <small className="text-muted">
                                  Cantidad: {detalle.cantidad} × {formatCurrency(detalle.precio_venta || 0)}
                                </small>
                              </div>

                              {/* Subtotal */}
                              <div className="text-end">
                                <strong>{formatCurrency((detalle.cantidad || 0) * (detalle.precio_venta || 0))}</strong>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No hay detalles de productos disponibles para este recibo.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedRecibo(null)}
                >
                  Cerrar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => handlePrintReceipt(selectedRecibo)}
                >
                  <i className="bi bi-printer me-2"></i>
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  async function handlePrintReceipt(recibo) {
    try {
      // Cargar detalles completos del recibo si no los tiene
      let reciboCompleto = recibo
      if ((!recibo.detalles || recibo.detalles.length === 0) && (!recibo.productosRecibo || recibo.productosRecibo.length === 0)) {
        try {
          const response = await api.get(`/recibo-caja/${recibo.id_recibo_caja}`)
          reciboCompleto = response.data
          console.log('Recibo con detalles cargado para imprimir:', reciboCompleto)
        } catch (error) {
          console.warn('No se pudieron cargar los detalles completos, usando datos básicos')
        }
      }

      const productos = reciboCompleto.productosRecibo || reciboCompleto.detalles || []

      const printWindow = window.open('', '_blank')
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Recibo de Caja - ${reciboCompleto.numero_recibo_caja}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .receipt-title { font-size: 24px; font-weight: bold; }
            .receipt-info { margin: 10px 0; }
            .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .products-table th, .products-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .products-table th { background-color: #f2f2f2; }
            .products-table td.number { text-align: right; }
            .total-section { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <div class="receipt-title">PETSHOP</div>
            <div>Sistema de Gestión Empresarial</div>
          </div>

          <div class="receipt-info">
            <strong>Número de Recibo:</strong> ${reciboCompleto.numero_recibo_caja}<br>
            <strong>Fecha:</strong> ${new Date(reciboCompleto.fecha_recibo_caja).toLocaleString('es-ES')}<br>
            <strong>Cliente:</strong> ${nombreCliente(reciboCompleto.id_cliente) || 'Cliente no registrado'}<br>
            <strong>Método de Pago:</strong> ${reciboCompleto.tipo_pago || 'No especificado'}
          </div>

          <table class="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="number">Cantidad</th>
                <th class="number">Precio Unit.</th>
                <th class="number">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productos.map(item => {
                const cantidad = item.cantidad || 0
                const precio = parseFloat(item.precio_venta || 0)
                const subtotal = cantidad * precio
                return `
                  <tr>
                    <td>${item.producto?.nombre_producto || item.nombre_producto || 'Producto no encontrado'}</td>
                    <td class="number">${cantidad}</td>
                    <td class="number">${formatCurrency(precio)}</td>
                    <td class="number">${formatCurrency(subtotal)}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>

          <div class="total-section">
            Total: ${formatCurrency(reciboCompleto.total)}
          </div>

          <div class="footer">
            ¡Gracias por su compra!<br>
            Recibo generado el ${new Date().toLocaleString('es-ES')}
          </div>
        </body>
        </html>
      `

      printWindow.document.write(receiptHTML)
      printWindow.document.close()
      printWindow.print()
    } catch (error) {
      console.error('Error al imprimir recibo:', error)
      alert('Error al generar el recibo para impresión')
    }
  }

  function getPaymentIcon(method) {
    const icons = {
      'efectivo': 'bi-cash',
      'tarjeta_credito': 'bi-credit-card',
      'tarjeta_debito': 'bi-credit-card-2-front',
      'transferencia': 'bi-bank',
      'cheque': 'bi-receipt',
      'otro': 'bi-wallet'
    };
    return icons[method?.toLowerCase()] || 'bi-wallet';
  }
}
