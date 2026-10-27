import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import { ProductCard } from '../components/ProductCard';
import { StatePanel } from '../components/StatePanel';
import { api } from '../services/api';
import type { Product } from '../types';

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState('');
  const { add } = useCart();

  useEffect(() => {
    const controller = new AbortController();
    api.listProducts(controller.signal)
      .then((result) => { setProducts(result); setError(false); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  function retry() { setLoading(true); setReload((value) => value + 1); }
  function handleAdd(product: Product) {
    add(product.id);
    setNotice(`${product.nome} foi adicionado ao carrinho.`);
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <p className="eyebrow"><span className="eyebrow-line" /> UMA LOJA PARA EXPLORAR</p>
            <h1>Seu próximo<br /><em>favorito</em> está aqui.</h1>
            <p className="hero-description">Descubra produtos selecionados, encontre o que combina com você e monte seu carrinho no seu ritmo.</p>
            <a href="#produtos" className="button button-dark">Explorar produtos <span aria-hidden="true">↗</span></a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-disc hero-disc-one" /><div className="hero-disc hero-disc-two" />
            <div className="hero-art-card"><span className="hero-art-mark">E<span>×</span>L</span><span>ESCOLHAS QUE INSPIRAM</span></div>
            <span className="hero-art-caption">CURADORIA PARA O DIA A DIA / 01</span>
          </div>
        </div>
      </section>

      <section id="produtos" className="catalog-section container">
        <div className="section-heading">
          <div><p className="eyebrow">CATÁLOGO</p><h2>Encontre algo especial<span className="accent-dot">.</span></h2></div>
          {!loading && !error && <span className="result-count">{products.length} {products.length === 1 ? 'produto' : 'produtos'}</span>}
        </div>
        {notice && <div className="notice success" role="status">{notice} <Link to="/cart">Ver carrinho ↗</Link><button type="button" onClick={() => setNotice('')} aria-label="Fechar aviso">×</button></div>}
        {loading ? <div className="loading-grid" aria-label="Carregando produtos"><div /><div /><div /><div /></div>
          : error ? <StatePanel eyebrow="SEM CONEXÃO" title="Não conseguimos carregar os produtos" description="Verifique a conexão com a API e tente novamente." action={<button className="button button-dark" onClick={retry}>Tentar novamente</button>} />
          : products.length === 0 ? <StatePanel eyebrow="CATÁLOGO VAZIO" title="Ainda não há produtos por aqui" description="Quando novos produtos estiverem disponíveis, eles aparecerão nesta página." action={<Link to="/admin/products" className="button button-outline">Ir para administração</Link>} />
          : <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={handleAdd} />)}</div>}
      </section>
      <section className="info-band"><div className="container info-band-inner"><span>01 / ESCOLHA SEUS PRODUTOS</span><span>02 / MONTE SEU CARRINHO</span><span>03 / VOLTE SEMPRE QUE QUISER</span></div></section>
    </>
  );
}
