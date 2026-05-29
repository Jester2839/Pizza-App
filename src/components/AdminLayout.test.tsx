import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminLayout } from './AdminLayout';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
// import React from 'react';

// Mockování ResizeObserveru pro slider v navigaci
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
);

describe('AdminLayout Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('should redirect to /login if user is not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="orders" element={<div>Admin Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page Content</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Ověříme, že vidíme login stránku místo admin obsahu
    expect(screen.getByText('Login Page Content')).toBeDefined();
    expect(screen.queryByText('Admin Content')).toBeNull();
  });

  it('should render admin content if authenticated', () => {
    sessionStorage.setItem('admin_token', 'valid-token');
    sessionStorage.setItem('admin_role', 'admin');

    render(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="orders" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeDefined();
    expect(screen.getByText('Objednávky')).toBeDefined();
  });

  it('should clear storage and redirect to home on logout', () => {
    sessionStorage.setItem('admin_token', 'valid-token');
    sessionStorage.setItem('admin_role', 'admin');

    render(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="orders" element={<div>Admin Content</div>} />
          </Route>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/login" element={<div>Login Page Content</div>} />
        </Routes>
      </MemoryRouter>
    );

    const logoutBtn = screen.getByText(/Odhlásit/i);
    fireEvent.click(logoutBtn);

    // Ověříme vyčištění storage
    expect(sessionStorage.getItem('admin_token')).toBeNull();
    expect(sessionStorage.getItem('admin_role')).toBeNull();

    // Ověříme přesměrování (v Layoutu je volání navigate('/'))
    expect(screen.getByText('Home Page')).toBeDefined();
  });
});