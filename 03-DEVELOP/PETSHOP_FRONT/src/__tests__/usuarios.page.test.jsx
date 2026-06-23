import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Usuarios from '../pages/Usuarios';

vi.mock('../services/dataService', () => ({
  fetchPaginatedData: vi.fn()
}));

vi.mock('../services/userService', () => ({
  default: { delete: vi.fn() }
}));

vi.mock('../utils/logger', () => ({
  default: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
  getErrorMessage: () => 'error'
}));

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

const { fetchPaginatedData } = await import('../services/dataService');

describe('Usuarios page', () => {
  beforeEach(() => {
    fetchPaginatedData.mockReset();
  });

  it('renders users header', async () => {
    fetchPaginatedData.mockResolvedValueOnce({ data: [], count: 0 });
    render(<Usuarios />);
    expect(await screen.findByText('Usuarios')).toBeInTheDocument();
  });
});
