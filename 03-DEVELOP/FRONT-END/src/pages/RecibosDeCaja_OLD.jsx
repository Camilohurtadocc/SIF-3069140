// src/pages/RecibosDeCaja.jsx
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { Dropdown } from 'react-bootstrap'
import api from '../services/api'
import clientService from '../services/clientService'
import productService from '../services/productService'
import categoryService from '../services/categoryService'
import recibosDeCajaService from '../services/recibosDeCajaService'

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

export default function RecibosDeCaja() {
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [clientesFiltrados, setClientesFiltrados] = useState([])
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false)

  const [recibo, setRecibo] = useState({
    cliente: '',
    items: [],
    metodoPago: '',
    pago: '',
    fecha: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    numero: '',
    correo: '',
    direccion: '',
  })
  const [ultimoNumeroRecibo, setUltimoNumeroRecibo] = useState(0)

  // Función para obtener URL completa de imagen
  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  }

  // --- ¡NUEVA FUNCIÓN! ---
  // Función para cargar o recargar los productos desde la base de datos
  async function refrescarProductos() {
    console.log('Refrescando lista de productos...')
    try {
      // Cargar todos los productos CON imágenes
      const response = await api.get('/product', {
        params: {
          page: 1,
          limit: 1000 // Cargar muchos productos
        }
      })
      let data = response.data
      if (!Array.isArray(data)) {
        data = data.data || []
      }
      // Mostrar todos los productos por ahora
      setProductos(data)
      console.log('Lista de productos actualizada:', data.length, 'productos')
      console.log('Ejemplo de producto con imagen:', data[0]) // Debug
    } catch (error) {
      console.error('Error recargando productos:', error)
      toast.error('No se pudo actualizar la lista de productos.')
    }
  }

  useEffect(() => {
    async function loadInitialData() {
      try {
        // Obtener el último número de recibo del backend usando fetch para evitar interceptor
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3001/api/v1/recibo-caja/last', {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        })
        if (response.ok) {
          const data = await response.json()
          const ultimoNumero = data.numero_recibo_caja || 0
          setUltimoNumeroRecibo(ultimoNumero)
          const siguienteNumero = (ultimoNumero + 1).toString()
          setRecibo(prev => ({ ...prev, numero: siguienteNumero }))
        } else {
          throw new Error('Endpoint not found')
        }
      } catch (err) {
        console.error('Error cargando último recibo:', err)
        // Si falla, empezar desde 1
        setUltimoNumeroRecibo(0)
        setRecibo(prev => ({ ...prev, numero: '1' }))
      }

      try {
        const response = await api.get('/client/simple')
        let clientesData = response.data
        if (!Array.isArray(clientesData)) {
          clientesData = clientesData.data || []
        }
        const clientesArray = clientesData.map(cliente => ({
          ...cliente,
          nombre_completo: `${cliente.primer_nombre} ${cliente.segundo_nombre || ''} ${cliente.primer_apellido} ${cliente.segundo_apellido || ''}`.trim()
        }))
        setClientes(clientesArray)
        setClientesFiltrados(clientesArray)
      } catch (error) {
        console.error('Error cargando clientes:', error)
        setClientes([])
        setClientesFiltrados([])
      }

      try {
        const categoriasData = await categoryService.getAll()
        setCategorias(Array.isArray(categoriasData) ? categoriasData : [])
      } catch (error) {
        console.error('Error cargando categorías:', error)
        setCategorias([])
      }

      // Cargar productos
      await refrescarProductos()
    }
    loadInitialData()
  }, [])

  // Filtrar productos por categoría y búsqueda
  useEffect(() => {
    let filtrados = productos

    if (categoriaSeleccionada) {
      const categoriaId = Number(categoriaSeleccionada)
      filtrados = filtrados.filter(p => Number(p.id_categoria) === categoriaId)
    }

    if (busquedaProducto.trim()) {
      const termino = busquedaProducto.toLowerCase()
      filtrados = filtrados.filter(p =>
        p.nombre_producto.toLowerCase().includes(termino)
      )
    }

    setProductosFiltrados(filtrados)
  }, [categoriaSeleccionada, productos, busquedaProducto])

  // Filtrar clientes por búsqueda
  useEffect(() => {
    if (busquedaCliente.trim()) {
      const termino = busquedaCliente.toLowerCase()
      const filtrados = clientes.filter(cliente =>
        cliente.nombre_completo?.toLowerCase().includes(termino) ||
        cliente.primer_nombre?.toLowerCase().includes(termino) ||
        cliente.segundo_nombre?.toLowerCase().includes(termino) ||
        cliente.primer_apellido?.toLowerCase().includes(termino) ||
        cliente.segundo_apellido?.toLowerCase().includes(termino) ||
        cliente.correo_electronico?.toLowerCase().includes(termino) ||
        cliente.numero_documento?.toLowerCase().includes(termino)
      )
      setClientesFiltrados(filtrados)
    } else {
      setClientesFiltrados(clientes)
    }
  }, [clientes, busquedaCliente])

  function handleAddProducto(producto) {
    const existe = recibo.items.find(item => item.id_producto === producto.id_producto)
    if (existe) {
      toast.warning(`El producto "${producto.nombre_producto}" ya está en la lista`)
      return
    }

    if (producto.stock <= 0) {
      toast.error(`No hay stock disponible para "${producto.nombre_producto}"`)
      return
    }

    const categoriaNombre = categorias.find(c => c.id_categoria == producto.id_categoria)?.nombre_categoria || 'Sin categoría'
    setRecibo((r) => ({
      ...r,
      items: [...r.items, {
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio_unitario: producto.precio_unitario,
        cantidad: 1,
        stock_disponible: producto.stock,
        categoria: categoriaNombre
      }]
    }))
  }

  function handleItemChange(idx, field, value) {
    setRecibo((r) => {
      const items = [...r.items]
      items[idx][field] = value

      if (field === 'cantidad') {
        const cantidad = Math.max(1, Math.min(Number(value) || 1, items[idx].stock_disponible))
        items[idx].cantidad = cantidad
      }

      return { ...r, items }
    })
  }

  function handleRemoveItem(idx) {
    setRecibo((r) => ({ ...r, items: r.items.filter((_, i) => i !== idx) }))
  }

  function handleClienteChange(e) {
    const clienteId = e.target.value;

    // Si no se selecciona ningún cliente, limpiar los campos.
    if (!clienteId) {
      setRecibo((r) => ({ ...r, cliente: '', correo: '' }));
      return;
    }

    // --- ¡AQUÍ ESTÁ LA LÓGICA CORREGIDA! ---
    // Buscar al cliente seleccionado en la lista completa de clientes que ya tenemos en el estado.
    // Usamos '==' para comparar el string del 'value' con el número del 'id_cliente' sin problemas.
    const clienteSeleccionado = clientes.find(c => c.id_cliente == clienteId);

    // Si encontramos al cliente, actualizamos el estado del recibo con su ID y su correo.
    if (clienteSeleccionado) {
      setRecibo((r) => ({
        ...r,
        cliente: clienteId, // Guardamos el ID como string para que el select funcione.
        correo: clienteSeleccionado.correo_electronico || '', // Autocompletamos el correo.
      }));
    }
  }

  function calcularTotal() {
    return recibo.items.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!recibo.cliente || !recibo.metodoPago || recibo.items.length === 0) {
      toast.error('Faltan datos: selecciona un cliente válido, método de pago y productos')
      return
    }

    // Validar que no se venda más de lo disponible en stock
    const stockInsuficiente = recibo.items.some(item => item.cantidad > item.stock_disponible)
    if (stockInsuficiente) {
      toast.error('Uno o más productos tienen cantidad insuficiente en stock. Actualiza las cantidades.')
      return
    }

    setLoading(true)
    try {
      const total = calcularTotal()
      const numeroFactura = recibo.numero

      // 1. Insertar recibo (el backend asigna numero_recibo_caja automáticamente)
      const reciboPayload = {
        id_cliente: recibo.cliente,
        fecha_recibo_caja: new Date().toISOString(),
        total: total,
        tipo_pago: recibo.metodoPago,
        productos: recibo.items.map(item => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_venta: item.precio_unitario
        }))
      }
      const reciboResponse = await api.post('/recibo-caja', reciboPayload)
      const reciboInsertado = reciboResponse.data
      const currentNumero = reciboInsertado.numero_recibo_caja || numeroFactura

      // El backend maneja la actualización de stock automáticamente

      toast.success(`Venta completada. Recibo: ${currentNumero}`)

      // --- ¡CAMBIO IMPORTANTE! ---
      // 4. Recargar la lista de productos para reflejar el nuevo stock
      await refrescarProductos()

      // 5. Resetear el formulario
      const siguienteNumero = (parseInt(currentNumero) + 1).toString()
      setRecibo({
        cliente: '', items: [], metodoPago: '', pago: '',
        fecha: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        numero: siguienteNumero, correo: '', direccion: '',
      })
      setUltimoNumeroRecibo(parseInt(currentNumero))

    } catch (err) {
      console.error('ERROR EN EL PROCESO DE VENTA:', err)
      console.error('Detalles del error:', err.message, err.code, err.details)
      let errorMessage = 'Error al procesar la venta'
      if (err.code === '23505') {
        errorMessage = 'Número de recibo duplicado. Intenta nuevamente.'
      } else if (err.code === '23503') {
        errorMessage = 'Cliente no encontrado.'
      } else if (err.message) {
        errorMessage = err.message
      }
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Función para imprimir recibo
  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank')
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Caja - ${recibo.numero}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .receipt-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .receipt-title { font-size: 24px; font-weight: bold; }
          .receipt-info { margin: 10px 0; }
          .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .products-table th, .products-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .products-table th { background-color: #f2f2f2; }
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
          <strong>Número de Recibo:</strong> ${recibo.numero}<br>
          <strong>Fecha:</strong> ${new Date(recibo.fecha).toLocaleString('es-ES')}<br>
          <strong>Cliente:</strong> ${recibo.cliente ? clientes.find(c => c.id_cliente == recibo.cliente)?.nombre_completo || 'Cliente no encontrado' : 'Sin cliente'}<br>
          <strong>Método de Pago:</strong> ${recibo.metodoPago || 'No especificado'}
        </div>

        <table class="products-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${recibo.items.map(item => `
              <tr>
                <td>${item.nombre_producto}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precio_unitario.toFixed(2)}</td>
                <td>$${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          Total: $${calcularTotal().toFixed(2)}
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
          <li className="breadcrumb-item active" aria-current="page">
            <i className="bi bi-receipt-cutoff me-1"></i>
            Recibos de Caja
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i className="bi bi-receipt-cutoff fs-2 text-primary"></i>
              </div>
              <div>
                <h3 className="mb-1 fw-bold">Crear Recibo de Caja</h3>
                <p className="text-muted mb-0">Registra ventas y gestiona transacciones</p>
              </div>
            </div>
            <div className="text-end">
              <div className="badge bg-primary bg-opacity-10 text-primary fs-5 px-3 py-2">
                <i className="bi bi-hash me-1"></i>
                <span className="fw-bold">{recibo.numero}</span>
              </div>
              <div className="small text-muted mt-1">Número de Recibo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        {/* Card: Información del Recibo */}
        <div className="card border-0 shadow-sm mb-4" style={{ position: 'relative', zIndex: 200 }}>
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-semibold">
              <i className="bi bi-person-circle text-primary me-2"></i>
              Información del Recibo
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Fecha y Hora <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-calendar-event"></i>
                  </span>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={recibo.fecha}
                    onChange={(e) => setRecibo((r) => ({ ...r, fecha: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Correo Electrónico <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    value={recibo.correo}
                    onChange={(e) => setRecibo((r) => ({ ...r, correo: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Método de Pago <span className="text-danger">*</span>
                </label>
                <Dropdown onSelect={(eventKey) => setRecibo((r) => ({ ...r, metodoPago: eventKey }))}>
                  <Dropdown.Toggle
                    variant={recibo.metodoPago ? "primary" : "light"}
                    className="form-control w-100 text-start d-flex align-items-center"
                  >
                    {recibo.metodoPago ? (
                      <>
                        {recibo.metodoPago === 'efectivo' && <i className="bi bi-cash me-2"></i>}
                        {recibo.metodoPago === 'tarjeta_credito' && <i className="bi bi-credit-card me-2"></i>}
                        {recibo.metodoPago === 'tarjeta_debito' && <i className="bi bi-credit-card me-2"></i>}
                        {recibo.metodoPago === 'transferencia' && <i className="bi bi-bank me-2"></i>}
                        {recibo.metodoPago === 'cheque' && <i className="bi bi-receipt me-2"></i>}
                        {recibo.metodoPago === 'otro' && <i className="bi bi-three-dots me-2"></i>}
                        {recibo.metodoPago === 'efectivo' ? 'Efectivo' :
                         recibo.metodoPago === 'tarjeta_credito' ? 'Tarjeta de Crédito' :
                         recibo.metodoPago === 'tarjeta_debito' ? 'Tarjeta Débito' :
                         recibo.metodoPago === 'transferencia' ? 'Transferencia' :
                         recibo.metodoPago === 'cheque' ? 'Cheque' : 'Otro'}
                      </>
                    ) : (
                      'Seleccione método de pago'
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100" style={{ zIndex: 1050 }}>
                    <Dropdown.Item eventKey="efectivo">
                      <i className="bi bi-cash me-2"></i>Efectivo
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="tarjeta_credito">
                      <i className="bi bi-credit-card me-2"></i>Tarjeta de Crédito
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="tarjeta_debito">
                      <i className="bi bi-credit-card me-2"></i>Tarjeta Débito
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="transferencia">
                      <i className="bi bi-bank me-2"></i>Transferencia
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="cheque">
                      <i className="bi bi-receipt me-2"></i>Cheque
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="otro">
                      <i className="bi bi-three-dots me-2"></i>Otro
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                {errors.metodoPago && (
                  <small className="text-danger d-block mt-1">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    {errors.metodoPago}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card: Selección de Cliente */}
        <div className="card border-0 shadow-sm mb-4" style={{ position: 'relative', zIndex: 100 }}>
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-semibold">
              <i className="bi bi-person text-primary me-2"></i>
              Cliente
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">
                  Buscar Cliente <span className="text-danger">*</span>
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Buscar por nombre, email o documento..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                  />
                  {busquedaCliente && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setBusquedaCliente('')}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? 's' : ''} encontrado{clientesFiltrados.length !== 1 ? 's' : ''}
                </small>
              </div>

              <div className="col-12">
                  {clientes.length === 0 ? (
                    <div className="no-clients-message">
                      <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <strong>No hay clientes registrados</strong>
                        <br />
                        <small>Para crear una venta, primero debe registrar clientes en el sistema.</small>
                        <br />
                        <a href="/clientes/crear" className="btn btn-sm btn-primary mt-2">
                          <i className="bi bi-person-plus me-1"></i>
                          Crear Primer Cliente
                        </a>
                      </div>
                    </div>
                  ) : (
                    <select
                      className="form-select form-select-lg"
                      required
                      value={recibo.cliente}
                      onChange={handleClienteChange}
                      size={busquedaCliente.trim() ? Math.min(clientesFiltrados.length + 1, 10) : 1} // Mostrar lista cuando hay búsqueda
                      style={{padding: '0.5rem'}}
                    >
                      <option value="">
                        {busquedaCliente.trim() ? 'Resultados de búsqueda:' : `Seleccionar cliente (${clientesFiltrados.length} disponible${clientesFiltrados.length !== 1 ? 's' : ''})`}
                      </option>
                      {clientesFiltrados.map((c) => (
                        <option key={c.id_cliente} value={c.id_cliente} style={{padding: '0.25rem 0.5rem'}}>
                          👤 {c.nombre_completo} | {c.correo_electronico} | {c.numero_documento}
                        </option>
                      ))}
                    </select>
                  )}

                  {recibo.cliente && (
                    <div className="selected-client-info mt-2">
                      <div className="client-info-card">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        <span className="fw-semibold">
                          {clientes.find(c => c.id_cliente == recibo.cliente)?.nombre_completo}
                        </span>
                        <small className="text-muted ms-2">
                          <i className="bi bi-hash me-1"></i>({clientes.find(c => c.id_cliente == recibo.cliente)?.numero_documento})
                        </small>
                      </div>
                    </div>
                  )}

                  {errors.cliente && (
                    <div className="error-message">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      {errors.cliente}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Card: Productos */}
        <div className="card border-0 shadow-sm mb-4" style={{ position: 'relative', zIndex: 50 }}>
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-semibold">
              <i className="bi bi-box-seam text-primary me-2"></i>
              Productos
            </h5>
          </div>
          <div className="card-body p-4">
            {/* Filtros de búsqueda mejorados */}
            <div className="filters-section mb-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="filter-card">
                        <label className="filter-label">
                          <i className="bi bi-funnel me-2"></i>
                          Filtrar por Categoría
                        </label>
                        <Dropdown onSelect={(eventKey) => setCategoriaSeleccionada(eventKey)}>
                          <Dropdown.Toggle
                            variant="light"
                            className="form-control form-control-lg w-100 text-start d-flex align-items-center"
                            id="dropdown-categoria"
                          >
                            {categoriaSeleccionada ? (
                              <>
                                <i className="bi bi-tag me-2"></i>
                                {categorias.find(c => c.id_categoria == categoriaSeleccionada)?.nombre_categoria}
                              </>
                            ) : (
                              <>
                                <i className="bi bi-grid me-2"></i>
                                Todas las categorías
                              </>
                            )}
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="w-100">
                            <Dropdown.Item eventKey="">
                              <i className="bi bi-grid me-2"></i>
                              Todas las categorías
                            </Dropdown.Item>
                            {categorias.map((cat) => (
                              <Dropdown.Item key={cat.id_categoria} eventKey={cat.id_categoria}>
                                <i className="bi bi-tag me-2"></i>
                                {cat.nombre_categoria}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="filter-card">
                        <label className="filter-label">
                          <i className="bi bi-search me-2"></i>
                          Buscar Producto
                        </label>
                        <div className="search-input-wrapper">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Escribe el nombre del producto..."
                            value={busquedaProducto}
                            onChange={(e) => setBusquedaProducto(e.target.value)}
                          />
                          {busquedaProducto && (
                            <button
                              type="button"
                              className="btn-clear"
                              onClick={() => setBusquedaProducto('')}
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de productos disponibles */}
                <div className="productos-disponibles mb-4">
                  <div className="productos-grid">
                    {productosFiltrados.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <i className="bi bi-search"></i>
                        </div>
                        <h6 className="empty-title">
                          <i className="bi bi-search me-2"></i>No se encontraron productos
                        </h6>
                        <p className="empty-text">Intenta cambiar los filtros de búsqueda</p>
                      </div>
                    ) : (
                      productosFiltrados.map((producto) => (
                        <div
                          key={producto.id_producto}
                          className="producto-card-interactive"
                          onClick={() => handleAddProducto(producto)}
                        >
                          <div className="producto-image">
                            {producto.url_imagen ? (
                              <img 
                                src={getImageUrl(producto.url_imagen)} 
                                alt={producto.nombre_producto}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = document.createElement('div');
                                  fallback.className = 'producto-image-fallback';
                                  fallback.innerHTML = '<i class="bi bi-box-seam" style="font-size: 3rem; color: #6c757d;"></i>';
                                  e.target.parentElement.appendChild(fallback);
                                }}
                              />
                            ) : (
                              <div className="producto-image-fallback">
                                <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                              </div>
                            )}
                          </div>
                          <div className="producto-header">
                            <h6 className="producto-nombre">{producto.nombre_producto}</h6>
                            <div className="producto-categoria">
                              <i className="bi bi-tag me-1"></i>
                              {producto.categorias?.nombre_categoria}
                            </div>
                          </div>
                          <div className="producto-body">
                            <div className="producto-precio">
                              <span className="precio-valor">${producto.precio_unitario}</span>
                              <span className="precio-label">Precio</span>
                            </div>
                            <div className="producto-stock">
                              <span className={`stock-badge ${producto.stock < 10 ? 'stock-low' : 'stock-good'}`}>
                                <i className="bi bi-box-seam me-1"></i>
                                {producto.stock}
                              </span>
                              <span className="stock-label">Disponible</span>
                            </div>
                          </div>
                          <div className="producto-action">
                            <div className="add-button">
                              <i className="bi bi-plus-circle-fill me-1"></i>
                              <span>Agregar</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Productos seleccionados */}
                <div className="productos-seleccionados">
                  <div className="selected-header">
                    <h6 className="selected-title">
                      <i className="bi bi-cart-check me-2"></i>
                      Productos Seleccionados
                      <span className="badge bg-primary ms-2">{recibo.items.length}</span>
                    </h6>
                  </div>

                  {recibo.items.length === 0 ? (
                    <div className="empty-cart">
                      <div className="empty-cart-icon">
                        <i className="bi bi-cart-x"></i>
                      </div>
                      <h6 className="empty-cart-title">
                        <i className="bi bi-cart-x me-2"></i>Carrito vacío
                      </h6>
                      <p className="empty-cart-text">Selecciona productos de la lista superior</p>
                    </div>
                  ) : (
                    <div className="selected-products-list">
                      {recibo.items.map((item, idx) => {
                        const imageUrl = getImageUrl(item.url_imagen)
                        return (
                          <div key={idx} className="selected-product-item">
                            <div className="product-info">
                              {/* Thumbnail de imagen */}
                              <div style={{ marginRight: '12px', flexShrink: 0 }}>
                                <div 
                                  style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    overflow: 'hidden', 
                                    borderRadius: '6px',
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
                                      alt={item.nombre_producto}
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

                              <div className="product-name-section">
                                <h6 className="product-name">{item.nombre_producto}</h6>
                                <span className="product-category">
                                  <i className="bi bi-tag me-1"></i>
                                  {item.categoria}
                                </span>
                                {errors[`item_${idx}`] && (
                                  <div className="error-message">
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    {errors[`item_${idx}`]}
                                  </div>
                                )}
                              </div>
                              <div className="product-details">
                              <div className="price-info">
                                <span className="unit-price">{formatCurrency(item.precio_unitario)}</span>
                                <span className="price-label">c/u</span>
                              </div>
                              <div className="quantity-controls">
                                <label className="quantity-label">Cantidad:</label>
                                <div className="quantity-input-group">
                                  <button
                                    type="button"
                                    className="quantity-btn"
                                    onClick={() => handleItemChange(idx, 'cantidad', Math.max(1, item.cantidad - 1))}
                                  >
                                    <i className="bi bi-dash"></i>
                                  </button>
                                  <input
                                    type="number"
                                    min={1}
                                    max={item.stock_disponible}
                                    className="quantity-input"
                                    value={item.cantidad}
                                    onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)}
                                  />
                                  <button
                                    type="button"
                                    className="quantity-btn"
                                    onClick={() => handleItemChange(idx, 'cantidad', Math.min(item.stock_disponible, item.cantidad + 1))}
                                  >
                                    <i className="bi bi-plus"></i>
                                  </button>
                                </div>
                                {errors[`item_${idx}_cantidad`] && (
                                  <div className="error-message small">{errors[`item_${idx}_cantidad`]}</div>
                                )}
                                {errors[`item_${idx}_stock`] && (
                                  <div className="error-message small">{errors[`item_${idx}_stock`]}</div>
                                )}
                              </div>
                              <div className="subtotal-info">
                                  <span className="subtotal-amount">{formatCurrency(item.precio_unitario * item.cantidad)}</span>
                                  <span className="subtotal-label">Subtotal</span>
                              </div>
                            </div>
                          </div>
                          <div className="product-actions">
                            <button
                              type="button"
                              className="btn-remove"
                              onClick={() => handleRemoveItem(idx)}
                              title="Remover producto"
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        </div>
                      )})}
                    </div>
                  )}
                </div>

                {errors.items && <div className="alert alert-danger py-2 mt-2">{errors.items}</div>}

              {/* Sección de pago y totales */}
              <div className="payment-section">
                <div className="payment-grid">
                  <div className="payment-input-card">
                    <label className="payment-label">
                      <i className="bi bi-cash me-2"></i>
                      Monto Recibido
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0.00"
                        min={calcularTotal()}
                        step="0.01"
                        required
                        value={recibo.pago}
                        onChange={(e) => setRecibo((r) => ({ ...r, pago: e.target.value }))}
                      />
                    </div>
                    {errors.pago && (
                      <div className="error-message">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        {errors.pago}
                      </div>
                    )}
                  </div>

                  <div className="totals-display">
                    <div className="total-card total-main">
                      <div className="total-icon">
                        <i className="bi bi-receipt-cutoff"></i>
                      </div>
                      <div className="total-info">
                        <div className="total-label">Total a Pagar</div>
                        <div className="total-amount">{formatCurrency(calcularTotal())}</div>
                      </div>
                    </div>

                    <div className={`total-card ${Number(recibo.pago || 0) >= calcularTotal() ? 'total-change' : 'total-pending'}`}>
                      <div className="total-icon">
                        <i className={`bi ${Number(recibo.pago || 0) >= calcularTotal() ? 'bi-cash-coin' : 'bi-clock'}`}></i>
                      </div>
                      <div className="total-info">
                        <div className="total-label">
                          {Number(recibo.pago || 0) >= calcularTotal() ? 'Cambio' : 'Pendiente'}
                        </div>
                        <div className="total-amount">
                          {formatCurrency(Math.abs(Number(recibo.pago || 0) - calcularTotal()))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="action-section">
                <div className="action-buttons">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-3"
                    onClick={async () => {
                      // Recargar último número de recibo
                      try {
                        const response = await api.get('/recibo-caja/last')
                        const ultimoNumero = response.data.numero_recibo_caja || 0
                        setUltimoNumeroRecibo(ultimoNumero)
                        const nuevoNumeroRecibo = (ultimoNumero + 1).toString()

                        setRecibo({
                          cliente: '',
                          items: [],
                          metodoPago: '',
                          pago: '',
                          fecha: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                          numero: nuevoNumeroRecibo,
                          correo: '',
                          direccion: '',
                        });
                      } catch (err) {
                        console.error('Error recargando número:', err)
                        setRecibo(prev => ({
                          ...prev,
                          cliente: '',
                          items: [],
                          metodoPago: '',
                          pago: '',
                          fecha: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                          correo: '',
                          direccion: '',
                        }));
                      }
                      setCategoriaSeleccionada('');
                      setBusquedaProducto('');
                      setBusquedaCliente('');
                    }}
                  >
                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                    Limpiar
                  </button>
                  <button
                    className="btn btn-info btn-lg px-4 py-3 fw-bold me-3"
                    type="button"
                    onClick={handlePrintReceipt}
                    disabled={recibo.items.length === 0}
                    title="Imprimir recibo"
                  >
                    <i className="bi bi-printer me-2"></i>
                    Imprimir Recibo
                  </button>
                  <button
                    className="btn btn-success btn-lg px-5 py-3 fw-bold"
                    type="submit"
                    disabled={loading || recibo.items.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Completar Venta
                        <span className="ms-2 badge bg-white text-success">
                          <i className="bi bi-cash me-1"></i>{formatCurrency(calcularTotal())}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
      </form>
    </div>
  )
}