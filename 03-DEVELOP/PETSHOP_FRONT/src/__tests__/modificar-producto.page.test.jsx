import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ModificarProducto from '../pages/ModificarProducto';

vi.mock('../services/productService', () => ({
  default: {
    getById: vi.fn().mockResolvedValue({
      id_producto: 1,
      codigo_sku: 'SKU1',
      nombre_producto: 'Collar',
      stock: 1,
      precio_unitario: 100,
      id_categoria: 1
    }),
    update: vi.fn()
  }
}));

vi.mock('../services/categoryService', () => ({
  default: { getAll: vi.fn().mockResolvedValue([]) }
}));

vi.mock('../services/storageService', () => ({
  default: { uploadProductImage: vi.fn() }
}));

vi.mock('../utils/logger', () => ({
  default: { info: vi.fn(), success: vi.fn(), error: vi.fn(), warn: vi.fn() },
  getErrorMessage: () => 'error'
}));

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn(), warn: vi.fn() }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '1' })
}));

describe('ModificarProducto page', () => {
  it('renders edit product header', async () => {
    render(<ModificarProducto />);
    await waitFor(() => {
      expect(screen.getAllByText('Editar Producto').length).toBeGreaterThan(0);
    });
  });
});
