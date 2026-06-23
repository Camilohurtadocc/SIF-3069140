import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HistorialRecibosDeCaja from '../pages/HistorialRecibosDeCaja';

vi.mock('../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: [] }) }
}));

vi.mock('../services/clientService', () => ({
  default: { getAll: vi.fn().mockResolvedValue([]) }
}));

describe('HistorialRecibosDeCaja page', () => {
  it('renders history header', async () => {
    render(<HistorialRecibosDeCaja />);
    await waitFor(() => {
      expect(screen.getAllByText(/Historial de Recibos/i).length).toBeGreaterThan(0);
    });
  });
});
