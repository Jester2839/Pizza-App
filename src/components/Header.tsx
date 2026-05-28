import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { SearchBar } from './SearchBar';

export function Header() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <header className={isMenuOpen ? 'menu-open' : ''}>
      <Link to="/" className="logo">
        <i className="ph-fill ph-pizza"></i>
        <div>
          <span>Pizza</span><span className="logo-accent">llettante</span>
        </div>
      </Link>

      <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={closeMenu}
        >
          Nabídka
        </NavLink>
        <NavLink to="/pribeh" className="nav-link">Příběh</NavLink>
        <NavLink to="/kontakt" className="nav-link">Kontakt</NavLink>
      </nav>

      <div className="nav-actions">
        <SearchBar />
        
        <Link to="/kosik" className="cart-wrapper">
          <i className="ph ph-shopping-cart" title="Košík"></i>
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
        
        <i 
          className="ph ph-user" 
          title="Přihlásit se" 
          onClick={() => navigate(sessionStorage.getItem('admin_token') ? '/admin/orders' : '/login')} 
        />

        <i 
          className={`ph ${isMenuOpen ? 'ph-x' : 'ph-list'} hamburger-menu-icon`} 
          title="Menu" 
          onClick={toggleMenu} 
        />
      </div>
    </header>
  );
}
