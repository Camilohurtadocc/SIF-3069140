// src/components/recibos/ProductoDisponible.jsx
import React from 'react'

export default function ProductoDisponible({ producto, onAdd, getImageUrl }) {
  return (
    <div
      className="producto-card-interactive"
      onClick={() => onAdd(producto)}
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
  )
}
