import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Categorias from '../pages/Categorias';

vi.mock('../services/categoryService', () => ({
  default: { getAll: vi.fn().mockResolvedValue([]), create: vi.fn(), delete: vi.fn(), update: vi.fn() }
}));

vi.mock('../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: [] }) }
}));

vi.mock('../utils/logger', () => ({
  default: { info: vi.fn(), success: vi.fn(), error: vi.fn(), warn: vi.fn() },
  getErrorMessage: () => 'error'
}));

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn(), warn: vi.fn() }
}));

describe('Categorias page', () => {
  it('renders categories content', async () => {
    render(<Categorias />);
    await waitFor(() => {
      expect(screen.getByText(/Crear Categor/i)).toBeInTheDocument();
    });
  });
});
