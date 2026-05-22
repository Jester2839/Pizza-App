import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { CartPage } from './pages/CartPage';
import { SearchProvider } from './hooks/useSearch';

export default function App() {
  return (
    <SearchProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="detail/:id" element={<DetailPage />} />
          <Route path="kosik" element={<CartPage />} />
        </Route>
      </Routes>
    </SearchProvider>
  );
}
