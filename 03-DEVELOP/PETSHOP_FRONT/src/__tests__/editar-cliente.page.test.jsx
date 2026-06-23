import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import EditarCliente from '../pages/EditarCliente';

vi.mock('../services/clientService', () => ({
  default: {
    getById: vi.fn().mockResolvedValue({
      id_cliente: 1,
      primer_nombre: 'Ana',
      primer_apellido: 'Lopez',
      numero_documento: '123',
      correo_electronico: 'ana@test.com'
    }),
    update: vi.fn()
  }
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

describe('EditarCliente page', () => {
  it('renders edit client header', async () => {
    render(<EditarCliente />);
    await waitFor(() => {
      expect(screen.getAllByText('Editar Cliente').length).toBeGreaterThan(0);
    });
  });
});
