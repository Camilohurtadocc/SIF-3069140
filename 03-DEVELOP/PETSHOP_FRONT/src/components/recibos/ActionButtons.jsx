// src/components/recibos/ActionButtons.jsx
import React from 'react'
import { format } from 'date-fns'
import api from '../../services/api'

export default function ActionButtons({ 
  loading, 
  recibo, 
  setRecibo,
  setUltimoNumeroRecibo,
  setCategoriaSeleccionada,
  setBusquedaProducto,
  setBusquedaCliente,
  handlePrintReceipt,
  calcularTotal,
  formatCurrency
}) {
  const handleLimpiar = async () => {
    try {
      const response = await api.get('/recibo-caja/last')
      const ultimoNumero = response.data.numero_recibo_caja || 0
      setUltimoNumeroRecibo(ultimoNumero)
      const nuevoNumeroRecibo = (ultimoNumero + 1).toString()

      setRecibo({
        cliente: '',
        items: [],
        metodoPago: '',
        pago: '',
        fecha: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        numero: nuevoNumeroRecibo,
        correo: '',
        direccion: '',
      });
    } catch (err) {
      console.error('Error recargando número:', err)
      setRecibo(prev => ({
        ...prev,
        cliente: '',
        items: [],
        metodoPago: '',
        pago: '',
        fecha: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        correo: '',
        direccion: '',
      }));
    }
    setCategoriaSeleccionada('');
    setBusquedaProducto('');
    setBusquedaCliente('');
  }

  return (
    <div className="action-section">
      <div className="action-buttons">
        <button
          type="button"
          className="btn btn-outline-secondary me-3"
          onClick={handleLimpiar}
        >
          <i className="bi bi-arrow-counterclockwise me-2"></i>
          Limpiar
        </button>
        <button
          className="btn btn-info btn-lg px-4 py-3 fw-bold me-3"
          type="button"
          onClick={handlePrintReceipt}
          disabled={recibo.items.length === 0}
          title="Imprimir recibo"
        >
          <i className="bi bi-printer me-2"></i>
          Imprimir Recibo
        </button>
        <button
          className="btn btn-success btn-lg px-5 py-3 fw-bold"
          type="submit"
          disabled={loading || recibo.items.length === 0}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Procesando...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle-fill me-2"></i>
              Completar Venta
              <span className="ms-2 badge bg-white text-success">
                <i className="bi bi-cash me-1"></i>{formatCurrency(calcularTotal())}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
