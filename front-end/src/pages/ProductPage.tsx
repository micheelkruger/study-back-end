import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import { MAX_QUANTITY } from '../cart/cart';
import { ProductImage } from '../components/ProductImage';
import { StatePanel } from '../components/StatePanel';
import { ApiError, api } from '../services/api';
import type { Product } from '../types';
import { formatPrice, toCents } from '../utils/money';

export function ProductPage() {
  const { id } = useParams();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'missing' | 'network' | null>(null);
  const [reload, setReload] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState('');
  const { add } = useCart();

  useEffect(() => {
    if (!Number.isSafeInteger(productId) || productId <= 0) { setError('missing'); setLoading(false); return; }
    const controller = new AbortController();
    api.getProduct(productId, controller.signal)
      .then((result) => { setProduct(result); setError(null); })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure instanceof ApiError && failure.status === 404 ? 'missing' : 'network'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [productId, reload]);

  function retry() { setLoading(true); setReload((value) => value + 1); }

  if (loading) return <div className="container page-section"><StatePanel title="Carregando produto" description="Estamos buscando os detalhes para você." /></div>;
  if (error === 'missing') return <div className="container page-section"><StatePanel eyebrow="PRODUTO INDISPONÍVEL" title="Esse produto não está no catálogo" description="Ele pode ter sido desativado ou não existir mais." action={<Link className="button button-dark" to="/">Voltar ao catálogo</Link>} /></div>;
  if (error || !product) return <div className="container page-section"><StatePanel eyebrow="SEM CONEXÃO" title="Não conseguimos carregar o produto" description="Verifique a conexão com a API e tente novamente." action={<button className="button button-dark" onClick={retry}>Tentar novamente</button>} /></div>;

  const safePrice = toCents(product.preco) !== null;
  return (
    <div className="container page-section">
      <nav className="breadcrumbs" aria-label="Caminho"><Link to="/">Produtos</Link><span aria-hidden="true">/</span><span>{product.nome}</span></nav>
      <div className="detail-grid">
        <ProductImage src={product.imagemUrl} name={product.nome} className="detail-image" />
        <div className="detail-info">
          <p className="eyebrow">PRODUTO #{String(product.id).padStart(3, '0')}</p>
          <h1>{product.nome}</h1>
          <div className="detail-rule" />
          <p className="detail-description">{product.descricao || 'Um produto para acompanhar seus melhores momentos.'}</p>
          <div className="detail-price-block"><span>Preço unitário</span><strong>{formatPrice(product.preco)}</strong></div>
          {!safePrice && <p className="field-help warning">Este preço está fora da faixa segura para cálculo no navegador.</p>}
          <div className="detail-actions">
            <label htmlFor="quantity">Quantidade</label>
            <div className="quantity-control">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="Diminuir quantidade">−</button>
              <input id="quantity" type="number" min="1" max={MAX_QUANTITY} value={quantity}
                onChange={(event) => { const value = Number(event.target.value); if (Number.isInteger(value) && value >= 1 && value <= MAX_QUANTITY) setQuantity(value); }} />
              <button type="button" onClick={() => setQuantity(Math.min(MAX_QUANTITY, quantity + 1))} disabled={quantity >= MAX_QUANTITY} aria-label="Aumentar quantidade">＋</button>
            </div>
            <button type="button" className="button button-dark button-wide" disabled={!safePrice} onClick={() => { add(product.id, quantity); setNotice(`${quantity} ${quantity === 1 ? 'item adicionado' : 'itens adicionados'} ao carrinho.`); }}>Adicionar ao carrinho <span aria-hidden="true">↗</span></button>
          </div>
          {notice && <div className="notice success" role="status">{notice} <Link to="/cart">Ver carrinho ↗</Link></div>}
          <p className="detail-footnote">Seu carrinho fica salvo neste navegador. Não há finalização de compra nesta versão.</p>
        </div>
      </div>
    </div>
  );
}
