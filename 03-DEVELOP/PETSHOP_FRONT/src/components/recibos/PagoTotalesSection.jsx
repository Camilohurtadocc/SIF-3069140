// src/components/recibos/PagoTotalesSection.jsx
import React from 'react'

export default function PagoTotalesSection({ 
  recibo, 
  setRecibo, 
  calcularTotal, 
  formatCurrency,
  errors 
}) {
  const total = calcularTotal()
  const montoPagado = Number(recibo.pago || 0)
  const cambio = montoPagado - total
  const pendiente = total - montoPagado

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <div className="row g-4">
          {/* Monto Recibido */}
          <div className="col-md-4">
            <label className="form-label fw-semibold text-muted mb-3">
              <i className="bi bi-cash-coin me-2"></i>
              Monto Recibido
            </label>
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-light border-0">
                <i className="bi bi-currency-dollar text-success fw-bold"></i>
              </span>
              <input
                type="number"
                className="form-control form-control-lg border-0 bg-light fw-semibold"
                placeholder="0.00"
                value={recibo.pago}
                onChange={(e) => setRecibo({ ...recibo, pago: e.target.value })}
                style={{ fontSize: '1.25rem' }}
              />
            </div>
            {errors.pago && (
              <div className="text-danger small mt-2">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.pago}
              </div>
            )}
          </div>

          {/* Subtotal */}
          <div className="col-md-4">
            <div className="total-card-modern bg-gradient-primary">
              <div className="total-card-header">
                <i className="bi bi-calculator-fill"></i>
                <span>Subtotal</span>
              </div>
              <div className="total-card-amount">
                {formatCurrency(total)}
              </div>
            </div>
          </div>

          {/* Cambio o Pendiente */}
          <div className="col-md-4">
            {montoPagado >= total ? (
              <div className="total-card-modern bg-gradient-success">
                <div className="total-card-header">
                  <i className="bi bi-cash-stack"></i>
                  <span>Cambio</span>
                </div>
                <div className="total-card-amount">
                  {formatCurrency(cambio)}
                </div>
              </div>
            ) : (
              <div className="total-card-modern bg-gradient-warning">
                <div className="total-card-header">
                  <i className="bi bi-hourglass-split"></i>
                  <span>Pendiente</span>
                </div>
                <div className="total-card-amount">
                  {formatCurrency(pendiente)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
