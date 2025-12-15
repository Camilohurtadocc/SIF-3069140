// src/components/recibos/ClienteCard.jsx
import React, { useState } from 'react'
import { Dropdown } from 'react-bootstrap'

export default function ClienteCard({ 
  busquedaCliente, 
  setBusquedaCliente,
  clientesFiltrados,
  recibo,
  setRecibo,
  clientes,
  errors,
  onClienteSelect
}) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleClienteChange = (clienteId) => {
    const clienteSeleccionado = clientes.find(c => c.id_cliente == clienteId)
    setRecibo({ ...recibo, cliente: clienteId })
    setShowDropdown(false)
    if (onClienteSelect && clienteSeleccionado) {
      onClienteSelect(clienteSeleccionado)
    }
  }

  const clienteSeleccionado = recibo.cliente ? clientes.find(c => c.id_cliente == recibo.cliente) : null

  return (
    <div className="card border-0 shadow-sm mb-4" style={{ position: 'relative', zIndex: 100 }}>
      <div className="card-header bg-white py-3">
        <h5 className="mb-0 fw-semibold">
          <i className="bi bi-person text-primary me-2"></i>
          Cliente
        </h5>
      </div>
      <div className="card-body p-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">
              Buscar Cliente <span className="text-danger">*</span>
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-primary"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Buscar por nombre, correo o documento..."
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
              />
            </div>

            {busquedaCliente.trim() && clientesFiltrados.length === 0 && (
              <div className="alert alert-info py-2">
                <i className="bi bi-info-circle me-2"></i>
                No se encontraron clientes
              </div>
            )}

            {busquedaCliente.trim() && clientesFiltrados.length > 0 && (
              <div 
                className="list-group" 
                style={{ 
                  maxHeight: '250px', 
                  overflowY: 'auto',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderRadius: '8px'
                }}
              >
                {clientesFiltrados.map((c) => (
                  <button
                    key={c.id_cliente}
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={() => handleClienteChange(c.id_cliente)}
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-circle text-primary me-2 fs-5"></i>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{c.nombre_completo}</div>
                        <small className="text-muted">
                          <i className="bi bi-envelope me-1"></i>{c.correo_electronico} | 
                          <i className="bi bi-hash ms-2 me-1"></i>{c.numero_documento}
                        </small>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">
              Lista de Clientes <span className="text-danger">*</span>
            </label>
            <Dropdown show={showDropdown} onToggle={setShowDropdown}>
              <Dropdown.Toggle
                variant={clienteSeleccionado ? 'primary' : 'light'}
                className="form-control form-control-lg w-100 text-start d-flex align-items-center justify-content-between"
                style={{ height: '48px' }}
              >
                <span>
                  {clienteSeleccionado ? (
                    <>
                      <i className="bi bi-person-check-fill me-2"></i>
                      {clienteSeleccionado.nombre_completo}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person me-2"></i>
                      Seleccionar cliente
                    </>
                  )}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu 
                className="w-100" 
                style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  zIndex: 1050
                }}
              >
                <Dropdown.Header>
                  <i className="bi bi-people me-2"></i>
                  {clientes.length} clientes disponibles
                </Dropdown.Header>
                <Dropdown.Divider />
                {clientes.map((c) => (
                  <Dropdown.Item 
                    key={c.id_cliente} 
                    onClick={() => handleClienteChange(c.id_cliente)}
                    active={recibo.cliente == c.id_cliente}
                  >
                    <div>
                      <div className="fw-semibold">
                        <i className="bi bi-person-circle me-2"></i>
                        {c.nombre_completo}
                      </div>
                      <small className="text-muted d-block mt-1">
                        <i className="bi bi-envelope me-1"></i>{c.correo_electronico}
                      </small>
                    </div>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {clienteSeleccionado && (
          <div className="selected-client-info mt-3">
            <div className="client-info-card">
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              <span className="fw-semibold">
                {clienteSeleccionado.nombre_completo}
              </span>
              <small className="text-muted ms-2">
                <i className="bi bi-hash me-1"></i>{clienteSeleccionado.numero_documento}
              </small>
            </div>
          </div>
        )}

        {errors.cliente && (
          <div className="error-message mt-2">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {errors.cliente}
          </div>
        )}
      </div>
    </div>
  )
}
