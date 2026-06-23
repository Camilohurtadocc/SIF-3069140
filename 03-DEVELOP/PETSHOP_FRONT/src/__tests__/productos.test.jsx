import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Productos from '../pages/Productos';

vi.mock('../services/dataService', () => ({
  fetchPaginatedData: vi.fn()
}));

vi.mock('../services/productService', () => ({
  default: {
    getById: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../utils/logger', () => ({
  default: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  },
  getErrorMessage: (e) => e?.message || 'error'
}));

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/productos' })
}));

const { fetchPaginatedData } = await import('../services/dataService');

const mockProductos = [
  {
    id_producto: 1,
    nombre_producto: 'Collar',
    codigo_sku: 'SKU1',
    stock: 5,
    precio_unitario: 1000,
    categoria: { nombre_categoria: 'Accesorios' }
  }
];

describe('Productos page', () => {
  beforeEach(() => {
    fetchPaginatedData.mockReset();
  });

  it('renders products from API', async () => {
    fetchPaginatedData.mockResolvedValueOnce({ data: mockProductos, count: 1 });

    render(<Productos />);

    expect(await screen.findByText('Collar')).toBeInTheDocument();
    expect(screen.getByText('Accesorios')).toBeInTheDocument();
  });

  it('shows empty state when no products', async () => {
    fetchPaginatedData.mockResolvedValueOnce({ data: [], count: 0 });

    render(<Productos />);

    expect(await screen.findByText('No hay productos')).toBeInTheDocument();
  });
});
