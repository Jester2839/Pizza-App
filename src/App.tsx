import { Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { CartPage } from './pages/CartPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { SearchProvider } from './hooks/useSearch';

export default function App() {
  return (
    <SearchProvider>
      <ScrollToTop />
      
      {/* DOČASNÝ ODKAZ DO ADMINU */}
      <Link 
        to="/admin-objednavky" 
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: '#b82132',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          zIndex: 9999,
          textDecoration: 'none',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
        }}
      >
        ⚙️ Admin
      </Link>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="detail/:id" element={<DetailPage />} />
          <Route path="kosik" element={<CartPage />} />
        </Route>
        <Route path="/admin-objednavky" element={<AdminOrdersPage />} />
      </Routes>
    </SearchProvider>
  );
}
