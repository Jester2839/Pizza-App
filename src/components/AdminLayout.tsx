import React from 'react';
import { NavLink, Outlet, Navigate, useLocation, Link } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  // Redirect /admin to /admin/orders
  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return <Navigate to="/admin/orders" replace />;
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <Link to="/" className="logo">
          <i className="ph-fill ph-pizza"></i>
          <div style={{ position: 'relative' }}>
            <span>Pizza</span><span className="logo-accent">llettante</span>
            <span className="admin-page__badge">Restaurace</span>
          </div>
        </Link>

        <nav className="admin-page__nav">
          <NavLink 
            to="/admin/orders"
            className={({ isActive }) => `admin-page__nav-item ${isActive ? 'admin-page__nav-item--active' : ''}`}
          >
            Objednávky
          </NavLink>
          <NavLink 
            to="/admin/pizzas"
            className={({ isActive }) => `admin-page__nav-item ${isActive ? 'admin-page__nav-item--active' : ''}`}
          >
            Pizzy
          </NavLink>
          <NavLink 
            to="/admin/ingredients"
            className={({ isActive }) => `admin-page__nav-item ${isActive ? 'admin-page__nav-item--active' : ''}`}
          >
            Ingredience
          </NavLink>
        </nav>
        
        {/* We can remove the loadOrders button from here since it's specific to orders, or keep it if we implement global refresh. But for now, we leave actions empty or handle it per page if needed. Let's remove it from layout. */}
      </header>

      <div className="admin-page__content">
        <Outlet />
      </div>
    </div>
  );
};
