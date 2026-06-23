// src/components/recibos/ProductosCard.jsx
import React from 'react'
import { Dropdown } from 'react-bootstrap'
import ProductoDisponible from './ProductoDisponible'
import ProductoSeleccionado from './ProductoSeleccionado'

export default function ProductosCard({
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  categorias,
  busquedaProducto,
  setBusquedaProducto,
  productosFiltrados,
  handleAddProducto,
  recibo,
  handleRemoveItem,
  handleItemChange,
  errors,
  formatCurrency,
  getImageUrl
}) {
  return (
    <div className="card border-0 shadow-sm mb-4" style={{ position: 'relative', zIndex: 50 }}>
      <div className="card-header bg-white py-3">
        <h5 className="mb-0 fw-semibold">
          <i className="bi bi-box-seam text-primary me-2"></i>
          Productos
        </h5>
      </div>
      <div className="card-body p-4">
        {/* Filtros de búsqueda */}
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
                    <span className="me-auto">
                      <i className="bi bi-tag me-2"></i>
                      {categoriaSeleccionada
                        ? categorias.find(c => c.id_categoria == categoriaSeleccionada)?.nombre_categoria || 'Seleccionar'
                        : 'Todas las categorías'}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100">
                    <Dropdown.Item eventKey="">
                      <i className="bi bi-grid me-2"></i>
                      Todas las categorías
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    {categorias.map(cat => (
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
                    placeholder="Nombre del producto..."
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
                <ProductoDisponible
                  key={producto.id_producto}
                  producto={producto}
                  onAdd={handleAddProducto}
                  getImageUrl={getImageUrl}
                />
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
              <i className="bi bi-cart-x empty-cart-icon"></i>
              <p className="empty-cart-text">No hay productos seleccionados</p>
            </div>
          ) : (
            <div className="selected-products-list">
              {recibo.items.map((item, idx) => (
                <ProductoSeleccionado
                  key={idx}
                  item={item}
                  idx={idx}
                  onChange={handleItemChange}
                  onRemove={handleRemoveItem}
                  errors={errors}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          )}
        </div>

        {errors.items && <div className="alert alert-danger py-2 mt-2">{errors.items}</div>}
      </div>
    </div>
  )
}
