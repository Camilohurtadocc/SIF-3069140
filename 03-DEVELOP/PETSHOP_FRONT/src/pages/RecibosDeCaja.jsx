// src/pages/RecibosDeCaja.jsx - VERSIÓN REFACTORIZADA
import React from 'react'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import api from '../services/api'
import { useRecibosDeCaja } from '../hooks/useRecibosDeCaja'
import ReciboHeader from '../components/recibos/ReciboHeader'
import InformacionReciboCard from '../components/recibos/InformacionReciboCard'
import ClienteCard from '../components/recibos/ClienteCard'
import ProductosCard from '../components/recibos/ProductosCard'
import PagoTotalesSection from '../components/recibos/PagoTotalesSection'
import ActionButtons from '../components/recibos/ActionButtons'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Función para formatear números con separación de miles
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

export default function RecibosDeCaja() {
  const {
    clientes,
    categorias,
    loading,
    setLoading,
    errors,
    setErrors,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    productosFiltrados,
    busquedaProducto,
    setBusquedaProducto,
    busquedaCliente,
    setBusquedaCliente,
    clientesFiltrados,
    recibo,
    setRecibo,
    ultimoNumeroRecibo,
    setUltimoNumeroRecibo,
    refrescarProductos
  } = useRecibosDeCaja()

  // Función para obtener URL completa de imagen
  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  }

  // Agregar producto al recibo
  const handleAddProducto = (producto) => {
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
        categoria_nombre: categoriaNombre
      }]
    }))
    toast.success(`${producto.nombre_producto} agregado al recibo`)
  }

  // Remover producto del recibo
  const handleRemoveItem = (index) => {
    setRecibo((r) => ({
      ...r,
      items: r.items.filter((_, i) => i !== index)
    }))
  }

  // Cambiar cantidad de producto
  const handleItemChange = (index, field, value) => {
    setRecibo((r) => {
      const newItems = [...r.items]
      newItems[index] = { ...newItems[index], [field]: value }
      return { ...r, items: newItems }
    })
  }

  // Manejar selección de cliente y llenar correo
  const handleClienteSelect = (cliente) => {
    if (cliente.correo_electronico) {
      setRecibo(prev => ({ ...prev, correo: cliente.correo_electronico }))
    }
  }

  // Calcular total
  const calcularTotal = () => {
    return recibo.items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0)
  }

  // Validar formulario
  const validarFormulario = () => {
    const newErrors = {}

    if (!recibo.cliente) newErrors.cliente = 'Debe seleccionar un cliente'
    if (!recibo.metodoPago) newErrors.metodoPago = 'Debe seleccionar un método de pago'
    if (!recibo.fecha) newErrors.fecha = 'La fecha es obligatoria'
    if (recibo.items.length === 0) newErrors.items = 'Debe agregar al menos un producto'

    recibo.items.forEach((item, idx) => {
      if (item.cantidad <= 0) {
        newErrors[`item_${idx}_cantidad`] = 'La cantidad debe ser mayor a 0'
      }
      if (item.cantidad > item.stock_disponible) {
        newErrors[`item_${idx}_stock`] = `Stock insuficiente (disponible: ${item.stock_disponible})`
      }
    })

    if (recibo.pago && Number(recibo.pago) < calcularTotal()) {
      newErrors.pago = 'El monto recibido es insuficiente'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      toast.error('Por favor corrija los errores en el formulario')
      return
    }

    setLoading(true)
    try {
      // Mapear valores de metodo_pago al formato esperado por el backend
      const metodoPagoMap = {
        'efectivo': 'Efectivo',
        'tarjeta': 'Tarjeta',
        'tarjeta_debito': 'Tarjeta',
        'tarjeta_credito': 'Tarjeta',
        'transferencia': 'Transferencia',
        'cheque': 'Transferencia',  // Usar Transferencia como fallback para cheque
        'otro': 'Efectivo'  // Usar Efectivo como fallback para otro
      }

      const metodoPagoFormato = metodoPagoMap[recibo.metodoPago.toLowerCase()] || recibo.metodoPago

      const payload = {
        id_cliente: parseInt(recibo.cliente) || 0,
        // Enviar ambas claves para compatibilidad con backend
        metodo_pago: metodoPagoFormato,
        tipo_pago: metodoPagoFormato,
        productos: recibo.items.map(item => ({
          id_producto: parseInt(item.id_producto) || 0,
          cantidad: parseInt(item.cantidad) || 1,
          precio_venta: parseFloat(item.precio_unitario) || 0
        }))
      }

      console.log('Enviando payload al servidor:', JSON.stringify(payload, null, 2))

      const response = await api.post('/recibo-caja', payload)
      const data = response.data
      console.log('Recibo creado exitosamente:', data)
      toast.success('¡Recibo creado exitosamente!')

      // Recargar productos para actualizar stock
      await refrescarProductos()

      // Limpiar formulario
      const siguienteNumero = (parseInt(recibo.numero) + 1).toString()
      setRecibo({
        cliente: '',
        items: [],
        metodoPago: '',
        pago: '',
        fecha: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        numero: siguienteNumero,
        correo: '',
        direccion: ''
      })
      setErrors({})
      setBusquedaCliente('')
      setBusquedaProducto('')
      setCategoriaSeleccionada('')

    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error.message

      console.error('Error creando recibo:', errorMessage)
      console.error('Detalles completos:', {
        message: errorMessage,
        status: error?.response?.status,
        data: error?.response?.data,
        stack: error?.stack,
        payload: recibo
      })
      toast.error(errorMessage || 'Error al crear el recibo')
    } finally {
      setLoading(false)
    }
  }

  // Imprimir recibo
  const handlePrintReceipt = () => {
    const clienteSeleccionado = clientes.find(c => c.id_cliente == recibo.cliente)
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Caja #${recibo.numero}</title>
        <style>
          body { font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PETSHOP</h2>
          <p>Recibo #${recibo.numero}</p>
          <p>${new Date(recibo.fecha).toLocaleString('es-CO')}</p>
        </div>
        <p><strong>Cliente:</strong> ${clienteSeleccionado?.nombre_completo || 'N/A'}</p>
        <p><strong>Método de Pago:</strong> ${recibo.metodoPago}</p>
        <hr>
        ${recibo.items.map(item => `
          <div class="item">
            <span>${item.nombre_producto} x${item.cantidad}</span>
            <span>${formatCurrency(item.precio_unitario * item.cantidad)}</span>
          </div>
        `).join('')}
        <div class="total">
          <div class="item">
            <span>TOTAL:</span>
            <span>${formatCurrency(calcularTotal())}</span>
          </div>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.write(receiptHTML)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="container-fluid px-4 py-4">
      <ReciboHeader numeroRecibo={recibo.numero} />

      <form onSubmit={handleSubmit}>
        <InformacionReciboCard 
          recibo={recibo}
          setRecibo={setRecibo}
          errors={errors}
        />

        <ClienteCard
          busquedaCliente={busquedaCliente}
          setBusquedaCliente={setBusquedaCliente}
          clientesFiltrados={clientesFiltrados}
          recibo={recibo}
          setRecibo={setRecibo}
          clientes={clientes}
          errors={errors}
          onClienteSelect={handleClienteSelect}
        />

        <ProductosCard
          categoriaSeleccionada={categoriaSeleccionada}
          setCategoriaSeleccionada={setCategoriaSeleccionada}
          categorias={categorias}
          busquedaProducto={busquedaProducto}
          setBusquedaProducto={setBusquedaProducto}
          productosFiltrados={productosFiltrados}
          handleAddProducto={handleAddProducto}
          recibo={recibo}
          handleRemoveItem={handleRemoveItem}
          handleItemChange={handleItemChange}
          errors={errors}
          formatCurrency={formatCurrency}
          getImageUrl={getImageUrl}
        />

        <PagoTotalesSection
          recibo={recibo}
          setRecibo={setRecibo}
          calcularTotal={calcularTotal}
          formatCurrency={formatCurrency}
          errors={errors}
        />

        <ActionButtons
          loading={loading}
          recibo={recibo}
          setRecibo={setRecibo}
          setUltimoNumeroRecibo={setUltimoNumeroRecibo}
          setCategoriaSeleccionada={setCategoriaSeleccionada}
          setBusquedaProducto={setBusquedaProducto}
          setBusquedaCliente={setBusquedaCliente}
          handlePrintReceipt={handlePrintReceipt}
          calcularTotal={calcularTotal}
          formatCurrency={formatCurrency}
        />
      </form>
    </div>
  )
}
