import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import CrearUsuario from '../pages/CrearUsuario';

vi.mock('../services/userService', () => ({
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

describe('CrearUsuario page', () => {
  it('renders create user header', () => {
    render(<CrearUsuario />);
    expect(screen.getAllByText('Crear Usuario').length).toBeGreaterThan(0);
  });
});
