import { Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { CartPage } from './pages/CartPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import AdminPizzasPage from './pages/AdminPizzasPage';
import { SearchProvider } from './hooks/useSearch';

export default function App() {
  return (
    <SearchProvider>
      <ScrollToTop />
      
      {/* DOČASNÝ ODKAZ DO ADMINU */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <Link 
          to="/admin-objednavky" 
          style={{
            backgroundColor: '#b82132',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}
        >
          ⚙️ Objednávky
        </Link>
        <Link 
          to="/admin-pizzas" 
          style={{
            backgroundColor: '#b82132',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}
        >
          🍕 Pizzy
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="detail/:id" element={<DetailPage />} />
          <Route path="kosik" element={<CartPage />} />
        </Route>
        <Route path="/admin-objednavky" element={<AdminOrdersPage />} />
        <Route path="/admin-pizzas" element={<AdminPizzasPage />} />
      </Routes>
    </SearchProvider>
  );
}
