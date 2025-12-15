// src/components/recibos/ReciboHeader.jsx
import React from 'react'

export default function ReciboHeader({ numeroRecibo }) {
  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/dashboard" className="text-decoration-none">
              <i className="bi bi-house-door me-1"></i>
              Inicio
            </a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            <i className="bi bi-receipt-cutoff me-1"></i>
            Recibos de Caja
          </li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i className="bi bi-receipt-cutoff fs-2 text-primary"></i>
              </div>
              <div>
                <h3 className="mb-1 fw-bold">Crear Recibo de Caja</h3>
                <p className="text-muted mb-0">Registra ventas y gestiona transacciones</p>
              </div>
            </div>
            <div className="text-end">
              <div className="badge bg-primary bg-opacity-10 text-primary fs-5 px-3 py-2">
                <i className="bi bi-hash me-1"></i>
                <span className="fw-bold">{numeroRecibo}</span>
              </div>
              <div className="small text-muted mt-1">Número de Recibo</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
