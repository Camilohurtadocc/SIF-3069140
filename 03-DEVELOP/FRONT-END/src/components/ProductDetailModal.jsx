// src/components/ProductDetailModal.jsx
import React from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export default function ProductDetailModal({ producto, onClose }) {
  if (!producto) return null

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  }

  const imageUrl = getImageUrl(producto.url_imagen)

  return (
    <div 
      className="modal show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-box-seam me-2"></i>
              Detalles del Producto
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              {/* Imagen del producto */}
              <div className="col-md-5">
                <div 
                  style={{ 
                    width: '100%', 
                    height: '300px', 
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
                      alt={producto.nombre_producto || producto.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = '<div class="text-center"><i class="bi bi-image text-muted" style="font-size: 5rem;"></i><p class="text-muted mt-2">Sin imagen</p></div>'
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <i className="bi bi-image text-muted" style={{ fontSize: '5rem' }}></i>
                      <p className="text-muted mt-2">Sin imagen</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del producto */}
              <div className="col-md-7">
                <h4 className="mb-3">{producto.nombre_producto || producto.nombre}</h4>
                
                <div className="mb-3">
                  <label className="text-muted small">Código SKU:</label>
                  <p className="mb-0 fw-bold">{producto.codigo_sku || producto.sku || '-'}</p>
                </div>

                <div className="row mb-3">
                  <div className="col-6">
                    <label className="text-muted small">Precio Unitario:</label>
                    <p className="mb-0 text-success fw-bold fs-5">
                      ${Number(producto.precio_unitario || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="col-6">
                    <label className="text-muted small">Stock Disponible:</label>
                    <p className="mb-0">
                      <span className={`badge ${producto.stock > 10 ? 'bg-success' : producto.stock > 0 ? 'bg-warning' : 'bg-danger'} fs-6`}>
                        {producto.stock || 0} unidades
                      </span>
                    </p>
                  </div>
                </div>

                {producto.presentacion_producto && (
                  <div className="mb-3">
                    <label className="text-muted small">Presentación:</label>
                    <p className="mb-0">{producto.presentacion_producto}</p>
                  </div>
                )}

                <div className="mb-3">
                  <label className="text-muted small">Categoría:</label>
                  <p className="mb-0">
                    <span className="badge bg-secondary">
                      {producto.categoria?.nombre_categoria || 'Sin categoría'}
                    </span>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="text-muted small">Estado:</label>
                  <p className="mb-0">
                    <span className={`badge ${producto.estado === 'activo' ? 'bg-success' : 'bg-secondary'}`}>
                      {producto.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>

                {producto.descripcion && (
                  <div className="mb-3">
                    <label className="text-muted small">Descripción:</label>
                    <p className="mb-0">{producto.descripcion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
