import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CrearProducto from '../pages/CrearProducto';

vi.mock('../services/categoryService', () => ({
  default: { getAll: vi.fn().mockResolvedValue([]) }
}));

vi.mock('../services/productService', () => ({
  default: { create: vi.fn() }
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
  useNavigate: () => vi.fn()
}));

describe('CrearProducto page', () => {
  it('renders create product header', async () => {
    render(<CrearProducto />);
    await waitFor(() => {
      expect(screen.getAllByText('Crear Producto').length).toBeGreaterThan(0);
    });
  });
});
