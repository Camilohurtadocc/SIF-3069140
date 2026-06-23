// src/components/recibos/ProductoSeleccionado.jsx
import React from 'react'

export default function ProductoSeleccionado({ item, idx, onChange, onRemove, errors, formatCurrency }) {
  return (
    <div className="selected-product-item-modern">
      <div className="product-info-left">
        <div className="product-index-badge">
          {idx + 1}
        </div>
        <div className="product-details-modern">
          <h6 className="product-name-modern">{item.nombre_producto}</h6>
          <div className="product-meta-modern">
            <span className="badge bg-light text-dark me-2">
              <i className="bi bi-tag me-1"></i>
              {item.categoria_nombre}
            </span>
            <span className="text-success fw-semibold">
              {formatCurrency(item.precio_unitario)} c/u
            </span>
          </div>
        </div>
      </div>

      <div className="product-controls-center">
        <div className="quantity-controls-modern">
          <button
            type="button"
            className="btn-quantity-modern btn-minus"
            onClick={() => {
              const nuevaCantidad = Math.max(1, item.cantidad - 1)
              onChange(idx, 'cantidad', nuevaCantidad)
            }}
          >
            <i className="bi bi-dash"></i>
          </button>
          <input
            type="number"
            min="1"
            className="quantity-input-modern"
            value={item.cantidad}
            onChange={(e) => onChange(idx, 'cantidad', parseInt(e.target.value) || 1)}
          />
          <button
            type="button"
            className="btn-quantity-modern btn-plus"
            onClick={() => onChange(idx, 'cantidad', item.cantidad + 1)}
          >
            <i className="bi bi-plus"></i>
          </button>
        </div>
        {(errors[`item_${idx}_cantidad`] || errors[`item_${idx}_stock`]) && (
          <div className="text-danger small mt-1">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {errors[`item_${idx}_cantidad`] || errors[`item_${idx}_stock`]}
          </div>
        )}
      </div>

      <div className="product-info-right">
        <div className="subtotal-modern">
          <div className="subtotal-label-modern">Subtotal</div>
          <div className="subtotal-amount-modern">
            {formatCurrency(item.precio_unitario * item.cantidad)}
          </div>
        </div>
        <button
          type="button"
          className="btn-remove-modern"
          onClick={() => onRemove(idx)}
          title="Remover producto"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  )
}
