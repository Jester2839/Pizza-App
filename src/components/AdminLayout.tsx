import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { AdminLogin } from './AdminLogin';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({});
  const navRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem('admin_token') && 
    sessionStorage.getItem('admin_role') === 'admin'
  );

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsAuthenticated(false);
    navigate('/');
  };

  const onLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/admin/orders');
  };

  // Pokud uživatel není přihlášen, zobrazíme jen Login
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={onLoginSuccess} />;
  }

  // Funkce pro aktualizaci pozice slideru
  const updateSlider = () => {
    if (!navRef.current) return;

    // Najdeme aktivní odkaz podle třídy, kterou tam dává NavLink
    const activeItem = navRef.current.querySelector('.admin-page__nav-item--active') as HTMLElement;
    
    if (activeItem) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();

      // Pokud má prvek nulovou šířku (ještě není v DOMu), slider skryjeme
      if (itemRect.width === 0) return;

      setSliderStyle({
        left: itemRect.left - navRect.left + 'px',
        width: itemRect.width + 'px',
        height: itemRect.height + 'px',
        opacity: 1,
      });
    } else {
      setSliderStyle(prev => ({ ...prev, opacity: 0 }));
    }
  };

  // Sledování změn cesty a velikosti okna
  useEffect(() => {
    let animationFrameId: number;
    
    // Použijeme requestAnimationFrame, aby se slider počítal až po vykreslení DOMu
    const handleUpdate = () => {
      animationFrameId = requestAnimationFrame(updateSlider);
    };

    handleUpdate();

    let resizeObserver: ResizeObserver | null = null;
    if (navRef.current) {
      resizeObserver = new ResizeObserver(handleUpdate);
      resizeObserver.observe(navRef.current);
    }

    window.addEventListener('resize', handleUpdate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleUpdate);
    };
  }, [location.pathname, isAuthenticated]); // Spustí se i po přihlášení, aby se vykreslil slider

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <Link to="/" className="logo" onClick={() => sessionStorage.clear()}>
          <i className="ph-fill ph-pizza"></i>
          <div style={{ position: 'relative' }}>
            <span>Pizza</span><span className="logo-accent">llettante</span>
            <span className="admin-page__badge">Restaurace</span>
          </div>
        </Link>

        <button className="admin-mobile-toggle" onClick={toggleMenu} aria-label="Menu">
          <i className={isMenuOpen ? "ph ph-x" : "ph ph-list"}></i>
        </button>

        <div 
          className={`admin-page__overlay ${isMenuOpen ? 'admin-page__overlay--active' : ''}`} 
          onClick={closeMenu} 
        />

        <nav className={`admin-page__nav ${isMenuOpen ? 'admin-page__nav--open' : ''}`} ref={navRef} onClick={(e) => e.stopPropagation()}>
          <div 
            className="admin-page__nav__slider" 
            style={sliderStyle} 
          />
          <NavLink 
            to="/admin/orders"
            className={({ isActive }) => `admin-page__nav-item ${isActive ? 'admin-page__nav-item--active' : ''}`}
            onClick={closeMenu}
          >
            Objednávky
          </NavLink>
          <NavLink 
            to="/admin/pizzas"
            className={({ isActive }) => `admin-page__nav-item ${isActive ? 'admin-page__nav-item--active' : ''}`}
            onClick={closeMenu}
          >
            Pizzy
          </NavLink>
          <NavLink 
            to="/admin/ingredients"
            className={({ isActive }) => `admin-page__nav-item ${isActive ? 'admin-page__nav-item--active' : ''}`}
            onClick={closeMenu}
          >
            Ingredience
          </NavLink>
          <button 
            className="admin-page__nav-item admin-page__nav-item--logout"
            onClick={handleLogout}
          >
            <i className="ph ph-sign-out"></i> Odhlásit
          </button>
        </nav>
        
        {/* We can remove the loadOrders button from here since it's specific to orders, or keep it if we implement global refresh. But for now, we leave actions empty or handle it per page if needed. Let's remove it from layout. */}
      </header>

      <div className="admin-page__content">
        <Outlet />
      </div>
    </div>
  );
};
