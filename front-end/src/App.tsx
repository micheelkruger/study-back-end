import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CartProvider } from './cart/CartContext';
import { Layout } from './components/Layout';
import { StatePanel } from './components/StatePanel';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { ProductPage } from './pages/ProductPage';

function KeyedProductPage() {
  const location = useLocation();
  return <ProductPage key={location.pathname} />;
}

function KeyedProductFormPage() {
  const location = useLocation();
  return <ProductFormPage key={location.pathname} />;
}

export function App() {
  return <BrowserRouter><CartProvider><Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/products/:id" element={<KeyedProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/admin" element={<Navigate to="/admin/products" replace />} />
      <Route path="/admin/products" element={<AdminProductsPage />} />
      <Route path="/admin/products/new" element={<KeyedProductFormPage />} />
      <Route path="/admin/products/:id/edit" element={<KeyedProductFormPage />} />
      <Route path="*" element={<div className="container page-section"><StatePanel eyebrow="PÁGINA NÃO ENCONTRADA" title="Não encontramos este caminho" description="Volte ao catálogo para continuar explorando." action={<Link to="/" className="button button-dark">Ver produtos</Link>} /></div>} />
    </Route>
  </Routes></CartProvider></BrowserRouter>;
}
