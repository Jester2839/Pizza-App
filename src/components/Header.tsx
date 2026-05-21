import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAlert } from '../hooks/useAlert';

export function Header() {
  const { itemCount } = useCart();
  const { showAlert } = useAlert();

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
        <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); showAlert('Stránka Příběh se připravuje', 'Příběh'); }}>
          Příběh
        </a>
        <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); showAlert('Stránka Kontakt se připravuje', 'Kontakt'); }}>
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
      </div>
    </header>
  );
}
