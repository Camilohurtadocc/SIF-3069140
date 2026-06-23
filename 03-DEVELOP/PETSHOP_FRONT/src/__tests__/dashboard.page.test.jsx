import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'test@pet.com' } })
}));

vi.mock('../hooks/useProfile', () => ({
  useProfile: () => ({ profile: {}, roles: [], hasRole: () => false, loading: false })
}));

vi.mock('../components/BackendStatus', () => ({
  default: () => <div>BackendStatus</div>
}));

vi.mock('../services/clientService', () => ({
  default: { getAll: vi.fn().mockResolvedValue([]) }
}));

vi.mock('../services/productService', () => ({
  default: { getAll: vi.fn().mockResolvedValue([]) }
}));

vi.mock('../services/categoryService', () => ({
  default: { getAll: vi.fn().mockResolvedValue([]) }
}));

vi.mock('../services/systemService', () => ({
  default: { getSystemStatus: vi.fn().mockResolvedValue({ success: true, responseTime: 120 }) }
}));

vi.mock('../services/recibosDeCajaService', () => ({
  default: { getAll: vi.fn().mockResolvedValue([]) }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('Dashboard page', () => {
  it('renders dashboard content', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Accesos/i)).toBeInTheDocument();
    });
  });
});
