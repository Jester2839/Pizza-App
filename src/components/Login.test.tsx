import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../pages/Login';
import { login } from '../services/api';
import { BrowserRouter } from 'react-router-dom';
// import React from 'react';

// Mockování API a navigace
vi.mock('../services/api', () => ({
  login: vi.fn(),
}));

// Použití vi.hoisted zajistí, že proměnná bude dostupná i uvnitř hoisted vi.mock bloku
const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { 
    ...actual, 
    useNavigate: () => mockNavigate 
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('should handle successful admin login', async () => {
    (login as any).mockResolvedValue({
      token: 'fake-token',
      role: 'admin'
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Uživatelské jméno/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Heslo/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Přihlásit se/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('admin', 'password123');
      expect(sessionStorage.getItem('admin_token')).toBe('fake-token');
      expect(sessionStorage.getItem('admin_role')).toBe('admin');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/orders');
    });
  });

  it('should show error message for non-admin user', async () => {
    (login as any).mockResolvedValue({
      token: 'fake-token',
      role: 'user'
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Uživatelské jméno/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Heslo/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Přihlásit se/i }));

    await waitFor(() => {
      expect(screen.getByText(/Nemáte oprávnění pro přístup do administrace/i)).toBeDefined();
    });
  });
});