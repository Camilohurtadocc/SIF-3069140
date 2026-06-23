import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import RecibosDeCaja from '../pages/RecibosDeCaja';

vi.mock('../hooks/useRecibosDeCaja', () => ({
  useRecibosDeCaja: () => ({
    clientes: [],
    categorias: [],
    loading: false,
    setLoading: vi.fn(),
    errors: {},
    setErrors: vi.fn(),
    categoriaSeleccionada: '',
    setCategoriaSeleccionada: vi.fn(),
    productosFiltrados: [],
    busquedaProducto: '',
    setBusquedaProducto: vi.fn(),
    busquedaCliente: '',
    setBusquedaCliente: vi.fn(),
    clientesFiltrados: [],
    recibo: { numero: '1', items: [], metodoPago: '', pago: '', fecha: '', cliente: '' },
    setRecibo: vi.fn(),
    ultimoNumeroRecibo: 0,
    setUltimoNumeroRecibo: vi.fn(),
    refrescarProductos: vi.fn()
  })
}));

vi.mock('../components/recibos/ReciboHeader', () => ({
  default: () => <div>ReciboHeader</div>
}));

vi.mock('../components/recibos/InformacionReciboCard', () => ({
  default: () => <div>InfoCard</div>
}));

vi.mock('../components/recibos/ClienteCard', () => ({
  default: () => <div>ClienteCard</div>
}));

vi.mock('../components/recibos/ProductosCard', () => ({
  default: () => <div>ProductosCard</div>
}));

vi.mock('../components/recibos/PagoTotalesSection', () => ({
  default: () => <div>PagoTotales</div>
}));

vi.mock('../components/recibos/ActionButtons', () => ({
  default: () => <div>ActionButtons</div>
}));

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn(), warn: vi.fn() }
}));

describe('RecibosDeCaja page', () => {
  it('renders recibos header', () => {
    render(<RecibosDeCaja />);
    expect(screen.getByText('ReciboHeader')).toBeInTheDocument();
  });
});
