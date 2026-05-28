import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { CartPage } from './pages/CartPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import AdminPizzasPage from './pages/AdminPizzasPage';
import AdminIngredientsPage from './pages/AdminIngredientsPage';
import { LoginPage } from './pages/Login';
import { AdminLayout } from './components/AdminLayout';
import { SearchProvider } from './hooks/useSearch';
import { StoryPage } from './pages/StoryPage';   // Importuj tvůj Příběh
import { ContactPage } from './pages/ContactPage'; // Importuj tvůj Kontakt


export default function App() {
  return (
    <SearchProvider>
      <ScrollToTop />
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="detail/:id" element={<DetailPage />} />
          <Route path="kosik" element={<CartPage />} />
          <Route path="/pribeh" element={<StoryPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="pizzas" element={<AdminPizzasPage />} />
          <Route path="ingredients" element={<AdminIngredientsPage />} />
        </Route>
      </Routes>
    </SearchProvider>
  );
}
