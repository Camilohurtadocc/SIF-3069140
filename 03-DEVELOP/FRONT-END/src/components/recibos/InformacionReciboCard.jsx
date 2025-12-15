// src/components/recibos/InformacionReciboCard.jsx
import React from 'react'
import { Dropdown } from 'react-bootstrap'

export default function InformacionReciboCard({ recibo, setRecibo, errors }) {
  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo', icon: 'bi-cash' },
    { value: 'tarjeta_credito', label: 'Tarjeta de crédito', icon: 'bi-credit-card' },
    { value: 'tarjeta_debito', label: 'Tarjeta débito', icon: 'bi-credit-card' },
    { value: 'transferencia', label: 'Transferencia', icon: 'bi-bank' },
    { value: 'cheque', label: 'Cheque', icon: 'bi-receipt' },
    { value: 'otro', label: 'Otro', icon: 'bi-three-dots' }
  ]

  const getMetodoInfo = (value) => {
    return metodosPago.find(m => m.value === value) || { label: 'Seleccione', icon: 'bi-wallet' }
  }

  return (
    <div className="card border-0 shadow-sm mb-4" style={{ position: 'relative', zIndex: 200 }}>
      <div className="card-header bg-white py-3">
        <h5 className="mb-0 fw-semibold">
          <i className="bi bi-person-circle text-primary me-2"></i>
          Información del Recibo
        </h5>
      </div>
      <div className="card-body p-4">
        <div className="row g-4">
          {/* Fecha y Hora */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              <i className="bi bi-calendar-event me-2"></i>
              Fecha y Hora <span className="text-danger">*</span>
            </label>
            <input
              type="datetime-local"
              className="form-control form-control-lg"
              value={recibo.fecha}
              onChange={(e) => setRecibo({ ...recibo, fecha: e.target.value })}
            />
            {errors.fecha && (
              <small className="text-danger d-block mt-1">
                <i className="bi bi-exclamation-triangle me-1"></i>
                {errors.fecha}
              </small>
            )}
          </div>

          {/* Correo Electrónico */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              <i className="bi bi-envelope me-2"></i>
              Correo Electrónico
            </label>
            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="ejemplo@email.com"
              value={recibo.correo}
              onChange={(e) => setRecibo({ ...recibo, correo: e.target.value })}
            />
            {errors.correo && (
              <small className="text-danger d-block mt-1">
                <i className="bi bi-exclamation-triangle me-1"></i>
                {errors.correo}
              </small>
            )}
          </div>

          {/* Método de Pago */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              <i className="bi bi-wallet2 me-2"></i>
              Método de Pago <span className="text-danger">*</span>
            </label>
            <Dropdown onSelect={(eventKey) => setRecibo({ ...recibo, metodoPago: eventKey })}>
              <Dropdown.Toggle
                variant={recibo.metodoPago ? 'primary' : 'light'}
                className="form-control form-control-lg w-100 text-start d-flex align-items-center justify-content-between"
                id="dropdown-metodo-pago"
              >
                <span>
                  <i className={`${getMetodoInfo(recibo.metodoPago).icon} me-2`}></i>
                  {getMetodoInfo(recibo.metodoPago).label}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100" style={{ zIndex: 1050 }}>
                {metodosPago.map(metodo => (
                  <Dropdown.Item key={metodo.value} eventKey={metodo.value}>
                    <i className={`${metodo.icon} me-2`}></i>
                    {metodo.label}
                  </Dropdown.Item>
                ))}
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
  )
}
