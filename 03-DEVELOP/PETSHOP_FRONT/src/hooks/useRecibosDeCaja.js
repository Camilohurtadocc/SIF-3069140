// src/hooks/useRecibosDeCaja.js
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import api from '../services/api'

export const useRecibosDeCaja = () => {
  const location = useLocation()
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
      console.log('[refrescarProductos] Llamando a /product con pageSize: 1000')
      const response = await api.get('/product', {
        params: { page: 1, pageSize: 1000 }
      })
      console.log('[refrescarProductos] Respuesta recibida:', response.data)
      let data = response.data
      if (!Array.isArray(data)) {
        data = data.data || []
      }
      console.log('[refrescarProductos] Productos extraídos:', data.length)
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
        const response = await api.get('/recibo-caja/last')
        const data = response.data
        const ultimoNumero = data.numero_recibo_caja || 0
        setUltimoNumeroRecibo(ultimoNumero)
        const siguienteNumero = (ultimoNumero + 1).toString()
        setRecibo(prev => ({ ...prev, numero: siguienteNumero }))
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

  // Recargar productos y categorías cuando se vuelve a la página de RecibosDeCaja
  useEffect(() => {
    if (location.pathname === '/recibos-caja') {
      console.log('[useRecibosDeCaja] Refresco automático al entrar a RecibosDeCaja')
      const reloadData = async () => {
        try {
          // Recargar categorías
          const categoriasResponse = await api.get('/categoria')
          const categoriasData = categoriasResponse.data
          const cats = Array.isArray(categoriasData) ? categoriasData : categoriasData.data || []
          console.log('[useRecibosDeCaja] Categorías refresco:', cats.length)
          setCategorias(cats)
        } catch (error) {
          console.error('Error recargando categorías:', error)
        }

        // Recargar productos
        console.log('[useRecibosDeCaja] Iniciando recarga de productos...')
        await refrescarProductos()
      }
      reloadData()
    }
  }, [location.pathname])

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


