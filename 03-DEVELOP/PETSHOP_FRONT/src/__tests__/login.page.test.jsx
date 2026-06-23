import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '../pages/Login';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    initializing: false,
    signIn: vi.fn().mockResolvedValue({ data: { user: {} }, error: null })
  })
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('Login page', () => {
  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByText('INICIAR')).toBeInTheDocument();
  });
});
