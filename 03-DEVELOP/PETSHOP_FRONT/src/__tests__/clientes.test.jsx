import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Clientes from '../pages/Clientes';

vi.mock('../services/dataService', () => ({
  fetchPaginatedData: vi.fn()
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
  toast: { error: vi.fn() }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

const { fetchPaginatedData } = await import('../services/dataService');

const mockClientes = [
  {
    id_cliente: 1,
    primer_nombre: 'Ana',
    segundo_nombre: '',
    primer_apellido: 'Lopez',
    segundo_apellido: '',
    numero_documento: '123',
    correo_electronico: 'ana@test.com',
    numero_telefono: '555'
  }
];

describe('Clientes page', () => {
  beforeEach(() => {
    fetchPaginatedData.mockReset();
  });

  it('renders customers from API', async () => {
    fetchPaginatedData.mockResolvedValueOnce({ data: mockClientes, count: 1 });

    render(<Clientes />);

    expect(await screen.findByText('Ana Lopez')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
  });

  it('shows empty state when no customers', async () => {
    fetchPaginatedData.mockResolvedValueOnce({ data: [], count: 0 });

    render(<Clientes />);

    expect(await screen.findByText('No hay clientes')).toBeInTheDocument();
  });
});
