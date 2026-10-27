import { NavLink, Outlet } from 'react-router-dom';
import { useCart } from '../cart/CartContext';

export function Layout() {
  const { count } = useCart();
  return (
    <div className="site-shell">
      <div className="top-strip"><span>ESTUDO & LOJA</span><span>UM PROJETO PARA APRENDER, UM ITEM DE CADA VEZ</span></div>
      <header className="site-header">
        <div className="header-inner">
          <NavLink to="/" className="brand" aria-label="Estudo e Loja, voltar ao catálogo">
            <span className="brand-symbol" aria-hidden="true">E<span>×</span>L</span>
            <span className="brand-name">estudo<span>&</span>loja</span>
          </NavLink>
          <nav className="main-nav" aria-label="Navegação principal">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Produtos</NavLink>
            <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Administrar</NavLink>
          </nav>
          <NavLink to="/cart" className={({ isActive }) => isActive ? 'cart-link active' : 'cart-link'} aria-label={`Carrinho com ${count} ${count === 1 ? 'item' : 'itens'}`}>
            <span className="cart-glyph" aria-hidden="true">◫</span><span>Carrinho</span><span className="cart-count">{count}</span>
          </NavLink>
        </div>
      </header>
      <main id="conteudo"><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-inner"><span className="footer-brand">estudo<span>&</span>loja</span><span>Um e-commerce de estudo. Pedidos e pagamentos ainda não estão disponíveis.</span></div>
      </footer>
    </div>
  );
}
