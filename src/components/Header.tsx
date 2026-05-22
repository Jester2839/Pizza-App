import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAlert } from '../hooks/useAlert';

export function Header() {
  const { itemCount } = useCart();
  const { showAlert } = useAlert();
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
        <a 
          href="#" 
          className="nav-link" 
          onClick={(e) => { 
            e.preventDefault(); 
            showAlert('Stránka Příběh se připravuje', 'Příběh');
            closeMenu();
          }}
        >
          Příběh
        </a>
        <a 
          href="#" 
          className="nav-link" 
          onClick={(e) => { 
            e.preventDefault(); 
            showAlert('Stránka Kontakt se připravuje', 'Kontakt');
            closeMenu();
          }}
        >
          Kontakt
        </a>
      </nav>

      <div className="nav-actions">
        <i className="ph ph-magnifying-glass" title="Vyhledat" onClick={() => showAlert('Vyhledávání brzy poběží!', 'Vyhledávání')} />
        
        <Link to="/kosik" className="cart-wrapper">
          <i className="ph ph-shopping-cart" title="Košík"></i>
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
        
        <i className="ph ph-user" title="Přihlásit se" onClick={() => showAlert('Tady bude přihlášení!', 'Přihlášení')} />

        <i 
          className={`ph ${isMenuOpen ? 'ph-x' : 'ph-list'} hamburger-menu-icon`} 
          title="Menu" 
          onClick={toggleMenu} 
        />
      </div>
    </header>
  );
}
