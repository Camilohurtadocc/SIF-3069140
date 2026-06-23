// src/pages/Productos.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import Pagination from '../components/Pagination'
import ProductDetailModal from '../components/ProductDetailModal'
import { fetchPaginatedData } from '../services/dataService'
import productService from '../services/productService'
import logger, { getErrorMessage } from '../utils/logger'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const openProductDetail = async (prod) => {
    setLoadingDetail(true)
    try {
      // Cargar detalles completos del producto
      const fullProduct = await productService.getById(prod.id_producto)
      console.log('Producto completo cargado:', fullProduct)
      console.log('Estructura de categoría:', {
        categorias: fullProduct.categorias,
        categoria: fullProduct.categoria,
        allKeys: Object.keys(fullProduct)
      })
      setSelectedProduct(fullProduct)
    } catch (error) {
      console.error('Error cargando detalles del producto:', error)
      // Si falla, usar el producto básico que ya tenemos
      setSelectedProduct(prod)
    } finally {
      setLoadingDetail(false)
    }
  }

  const loadProductos = useCallback(async () => {
    setLoading(true)
    try {
      logger.info('Productos', 'Cargando productos', { page, pageSize, search })
      const { data, count } = await fetchPaginatedData({
        endpoint: 'product',
        page,
        pageSize,
        searchQuery: search,
        searchFields: ['nombre_producto', 'codigo_sku'],
      })
      
      // Log temporal para ver estructura de datos
      if (data.length > 0) {
        console.log('Estructura de producto:', data[0])
        console.log('Categoría del primer producto:', data[0].categoria)
        console.log('Todas las propiedades del primer producto:', Object.keys(data[0]))
      }
      
      setProductos(data)
      setTotal(count)
      logger.success('Productos', `${count} productos cargados (mostrando ${data.length})`)
    } catch (error) {
      logger.error('Productos', 'Error al cargar productos', error)
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    loadProductos()
  }, [loadProductos])

  // Recargar productos cuando se retorna a la página desde crear/editar
  useEffect(() => {
    loadProductos()
  }, [location.pathname])

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      logger.info('Productos', `Eliminando producto ID: ${id}`)
      await productService.delete(id)
      logger.success('Productos', 'Producto eliminado exitosamente')
      toast.success('Producto eliminado exitosamente')
      loadProductos()
    } catch (error) {
      logger.error('Productos', 'Error al eliminar producto', error)
      toast.error(getErrorMessage(error))
    }
  }

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  }

  const handleImageClick = (imageUrl) => {
    if (imageUrl) {
      setSelectedImage(imageUrl)
    }
  }

  return (
    <div className="productos-box">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 fw-bold">
          <i className="bi bi-box-seam text-primary me-2"></i>
          Productos
        </h1>
        <div className="badge bg-success" style={{ fontSize: '1.1rem', padding: '0.7rem 1.5rem' }}>
          <i className="bi bi-check-circle me-2"></i>
          {total} Productos
        </div>
      </div>
      <div className="d-flex gap-2 align-items-center mb-3">
        <input className="form-control" style={{ maxWidth: 220 }} type="text" placeholder="Buscar producto..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <label className="form-label mb-0">Mostrar:</label>
        <select className="form-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ width: 80 }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
        <div className="ms-auto">
          <button className="btn btn-success" onClick={() => navigate('/productos/crear')}>
            <i className="bi bi-plus-circle me-1" /> Crear producto
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <>
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th style={{ width: '70px' }}>Imagen</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Existencias</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted">No hay productos</td></tr>
              ) : (
                productos.map((prod) => {
                  const imageUrl = getImageUrl(prod.url_imagen)
                  // Intentar obtener el nombre de categoría de diferentes formas
                  const categoriaNombre = 
                    prod.categoria?.nombre || 
                    prod.categoria?.nombre_categoria || 
                    prod.categorias?.nombre || 
                    prod.categorias?.nombre_categoria ||
                    prod.nombre_categoria ||
                    '-'
                  
                  return (
                    <tr key={prod.id_producto}>
                      <td>
                        <div 
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            overflow: 'hidden', 
                            borderRadius: '4px',
                            border: '1px solid #dee2e6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f8f9fa',
                            cursor: imageUrl ? 'pointer' : 'default'
                          }}
                          onClick={() => handleImageClick(imageUrl)}
                          title={imageUrl ? 'Clic para ampliar' : 'Sin imagen'}
                        >
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={prod.nombre_producto}
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
                      </td>
                      <td>
                        <span 
                          style={{ cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }}
                          onClick={() => openProductDetail(prod)}
                          title="Ver detalles"
                        >
                          {prod.nombre_producto}
                        </span>
                      </td>
                      <td>{Number(prod.precio_unitario || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                      <td>{prod.stock}</td>
                      <td>{categoriaNombre}</td>
                      <td>
                        <button className="btn btn-sm btn-primary me-2" onClick={() => navigate(`/productos/editar/${prod.id_producto}`)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(prod.id_producto)}>
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setPage}
            itemName="productos"
          />
        </>
      )}

      {/* Modal para ampliar imagen */}
      {selectedImage && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5 className="modal-title">Imagen del Producto</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedImage(null)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img 
                  src={selectedImage} 
                  alt="Producto" 
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles del producto */}
      {selectedProduct && (
        <ProductDetailModal 
          producto={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  )
}