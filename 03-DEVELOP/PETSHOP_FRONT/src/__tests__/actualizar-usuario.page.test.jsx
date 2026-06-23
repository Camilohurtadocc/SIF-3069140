import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ActualizarUsuario from '../pages/ActualizarUsuario';

vi.mock('../services/userService', () => ({
  default: {
    getById: vi.fn().mockResolvedValue({ id_usuario: 'u1', correo_electronico: 'a@b.com', idioma: 'es', activado: true, id_rol: 1 }),
    update: vi.fn(),
    updateRole: vi.fn()
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
  useParams: () => ({ id: 'u1' })
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id_usuario: 'u1' } })
}));

describe('ActualizarUsuario page', () => {
  it('renders update user header', async () => {
    render(<ActualizarUsuario />);
    await waitFor(() => {
      expect(screen.getAllByText('Editar Usuario').length).toBeGreaterThan(0);
    });
  });
});
