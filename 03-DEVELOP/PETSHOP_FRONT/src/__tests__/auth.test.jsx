import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

vi.mock('../services/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      defaults: { headers: { common: {} } }
    }
  };
});

const api = (await import('../services/api')).default;

function AuthConsumer() {
  const { user, initializing } = useAuth();
  return (
    <div>
      <div data-testid="initializing">{String(initializing)}</div>
      <div data-testid="user">{user ? user.id_usuario : 'none'}</div>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    api.get.mockReset();
    api.post.mockReset();
  });

  it('clears session when token is expired', async () => {
    const expiredPayload = {
      exp: Math.floor(Date.now() / 1000) - 10
    };
    const base64 = btoa(JSON.stringify(expiredPayload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    const token = `a.${base64}.c`;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id_usuario: 'u1' }));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('initializing').textContent).toBe('false');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('loads user from /me when token is valid', async () => {
    const validPayload = {
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    const base64 = btoa(JSON.stringify(validPayload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    const token = `a.${base64}.c`;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id_usuario: 'u1' }));

    api.get.mockResolvedValueOnce({ data: { user: { id_usuario: 'u2' } } });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('u2');
    });
  });

  it('uses stored user when /me fails', async () => {
    const validPayload = {
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    const base64 = btoa(JSON.stringify(validPayload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    const token = `a.${base64}.c`;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id_usuario: 'u1' }));

    api.get.mockRejectedValueOnce(new Error('fail'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('u1');
    });
  });
});
