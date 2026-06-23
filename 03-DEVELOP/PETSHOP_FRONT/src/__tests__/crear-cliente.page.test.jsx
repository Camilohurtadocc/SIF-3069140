import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import CrearCliente from '../pages/CrearCliente';

vi.mock('../services/clientService', () => ({
  default: { create: vi.fn() }
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

describe('CrearCliente page', () => {
  it('renders create client header', () => {
    render(<CrearCliente />);
    expect(screen.getAllByText('Crear Cliente').length).toBeGreaterThan(0);
  });
});
