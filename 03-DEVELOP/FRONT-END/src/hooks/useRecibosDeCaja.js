// src/hooks/useRecibosDeCaja.js
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import api from '../services/api'

export const useRecibosDeCaja = () => {
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
  const [ultimoNumeroRecibo, setUltimoNumeroRecibo] = useState(0)

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

  // Cargar productos desde el API
  const refrescarProductos = async () => {
    try {
      const response = await api.get('/product', {
        params: { page: 1, limit: 1000 }
      })
      let data = response.data
      if (!Array.isArray(data)) {
        data = data.data || []
      }
      setProductos(data)
    } catch (error) {
      console.error('Error recargando productos:', error)
      toast.error('No se pudo actualizar la lista de productos.')
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar último número de recibo
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
          setUltimoNumeroRecibo(0)
          setRecibo(prev => ({ ...prev, numero: '1' }))
        }
      } catch (err) {
        console.error('Error cargando último recibo:', err)
        setUltimoNumeroRecibo(0)
        setRecibo(prev => ({ ...prev, numero: '1' }))
      }

      try {
        // Cargar clientes
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
        // Cargar categorías
        const categoriasResponse = await api.get('/categoria')
        const categoriasData = categoriasResponse.data
        setCategorias(Array.isArray(categoriasData) ? categoriasData : categoriasData.data || [])
      } catch (error) {
        console.error('Error cargando categorías:', error)
        setCategorias([])
      }

      // Cargar productos
      await refrescarProductos()
    }

    loadInitialData()
  }, [])

  // Filtrar clientes por búsqueda
  useEffect(() => {
    if (busquedaCliente.trim() === '') {
      setClientesFiltrados(clientes)
    } else {
      const filtrados = clientes.filter(cliente =>
        cliente.nombre_completo.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.correo_electronico?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.numero_documento?.includes(busquedaCliente)
      )
      setClientesFiltrados(filtrados)
    }
  }, [busquedaCliente, clientes])

  // Filtrar productos por categoría y búsqueda
  useEffect(() => {
    let filtrados = productos

    if (categoriaSeleccionada) {
      filtrados = filtrados.filter(p => p.id_categoria == categoriaSeleccionada)
    }

    if (busquedaProducto.trim()) {
      filtrados = filtrados.filter(p =>
        p.nombre_producto.toLowerCase().includes(busquedaProducto.toLowerCase())
      )
    }

    setProductosFiltrados(filtrados)
  }, [categoriaSeleccionada, busquedaProducto, productos])

  return {
    // Estados
    clientes,
    productos,
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
    // Funciones
    refrescarProductos
  }
}
