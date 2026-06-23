import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CierresCaja from '../pages/CierresCaja';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id_usuario: 'u1' } })
}));

vi.mock('../services/cierresCajaService', () => ({
  default: { getAll: vi.fn().mockResolvedValue([]), create: vi.fn() }
}));

vi.mock('../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}));

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn(), warn: vi.fn() }
}));

describe('CierresCaja page', () => {
  it('renders cierres header', async () => {
    render(<CierresCaja />);
    await waitFor(() => {
      expect(screen.getAllByText(/Cierres de Caja/i).length).toBeGreaterThan(0);
    });
  });
});
