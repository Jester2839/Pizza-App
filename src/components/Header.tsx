import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

export function Header() {
  const { itemCount } = useCart();

  return (
    <header>
      <Link to="/" className="logo">
        <i className="ph-fill ph-pizza"></i>
        <div>
          <span>Pizza</span><span className="logo-accent">llettante</span>
        </div>
      </Link>

      <nav className="main-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Nabídka
        </NavLink>
        <a href="#" className="nav-link" onClick={() => alert('Stránka Příběh se připravuje')}>
          Příběh
        </a>
        <a href="#" className="nav-link" onClick={() => alert('Stránka Kontakt se připravuje')}>
          Kontakt
        </a>
      </nav>

      <div className="nav-actions">
        <i className="ph ph-magnifying-glass" title="Vyhledat" onClick={() => alert('Vyhledávání brzy poběží!')} />
        
        <Link to="/kosik" className="cart-wrapper">
          <i className="ph ph-shopping-cart" title="Košík"></i>
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
        
        <i className="ph ph-user" title="Přihlásit se" onClick={() => alert('Tady bude přihlášení!')} />
      </div>
    </header>
  );
}
