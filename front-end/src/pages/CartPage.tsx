import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import { MAX_QUANTITY } from '../cart/cart';
import { ProductImage } from '../components/ProductImage';
import { StatePanel } from '../components/StatePanel';
import { ApiError, api } from '../services/api';
import type { Product } from '../types';
import { formatCents, lineTotal, sumCents, toCents } from '../utils/money';

type ResolvedItem = { state: 'available'; product: Product } | { state: 'unavailable' } | { state: 'unknown' };

export function CartPage() {
  const { items, setQuantity, remove } = useCart();
  const [resolved, setResolved] = useState<Record<number, ResolvedItem>>({});
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const ids = items.map((item) => item.produtoId).join(',');

  useEffect(() => {
    if (!ids) { setResolved({}); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    const productIds = ids.split(',').map(Number);
    Promise.all(productIds.map(async (id): Promise<[number, ResolvedItem]> => {
      try {
        return [id, { state: 'available', product: await api.getProduct(id, controller.signal) }];
      } catch (error) {
        return [id, error instanceof ApiError && error.status === 404
          ? { state: 'unavailable' } : { state: 'unknown' }];
      }
    })).then((results) => { if (!controller.signal.aborted) setResolved(Object.fromEntries(results)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [ids, reload]);

  const summary = useMemo(() => {
    const subtotals: number[] = [];
    let hasUnknown = loading;
    let hasUnavailable = false;
    let unsafePrice = false;
    for (const item of items) {
      const result = resolved[item.produtoId];
      if (!result || result.state === 'unknown') { hasUnknown = true; continue; }
      if (result.state === 'unavailable') { hasUnavailable = true; continue; }
      const cents = toCents(result.product.preco);
      const subtotal = cents === null ? null : lineTotal(cents, item.quantidade);
      if (subtotal === null) { unsafePrice = true; continue; }
      subtotals.push(subtotal);
    }
    const total = sumCents(subtotals);
    if (total === null) unsafePrice = true;
    return { total: hasUnknown || unsafePrice ? null : total, hasUnknown, hasUnavailable, unsafePrice };
  }, [items, resolved, loading]);

  return (
    <div className="container page-section cart-page">
      <nav className="breadcrumbs" aria-label="Caminho"><Link to="/">Produtos</Link><span aria-hidden="true">/</span><span>Carrinho</span></nav>
      <div className="section-heading"><div><p className="eyebrow">SUAS ESCOLHAS</p><h1>Meu carrinho<span className="accent-dot">.</span></h1></div><span className="result-count">{items.length} {items.length === 1 ? 'produto' : 'produtos'}</span></div>
      {items.length === 0 ? <StatePanel eyebrow="CARRINHO VAZIO" title="Que tal começar a explorar?" description="Seus produtos favoritos podem ficar guardados aqui enquanto você navega." action={<Link className="button button-dark" to="/">Ver produtos</Link>} /> : (
        <div className="cart-layout">
          <div className="cart-items" aria-live="polite">
            {items.map((item) => {
              const result = resolved[item.produtoId];
              const product = result?.state === 'available' ? result.product : null;
              const cents = product ? toCents(product.preco) : null;
              const subtotal = cents === null ? null : lineTotal(cents, item.quantidade);
              return <article className="cart-item" key={item.produtoId}>
                <ProductImage src={product?.imagemUrl ?? null} name={product?.nome ?? 'Produto indisponível'} className="cart-item-image" />
                <div className="cart-item-main">
                  <div className="cart-item-top"><div><span className="item-id">PRODUTO #{String(item.produtoId).padStart(3, '0')}</span>
                    {product ? <Link to={`/products/${product.id}`} className="cart-item-name">{product.nome}</Link> : <h2 className="cart-item-name">Produto #{item.produtoId}</h2>}</div>
                    <button type="button" className="text-button" onClick={() => remove(item.produtoId)} aria-label={`Remover produto ${item.produtoId} do carrinho`}>Remover ×</button></div>
                  {result?.state === 'unavailable' ? <p className="status-note danger">Este produto não está mais disponível e não entra no total.</p>
                    : result?.state === 'unknown' ? <p className="status-note warning">Não foi possível confirmar este produto agora.</p>
                      : !result || loading ? <p className="status-note">Atualizando produto e preço...</p>
                        : cents === null ? <p className="status-note warning">Preço fora da faixa segura para cálculo.</p>
                          : <p className="cart-unit-price">{formatCents(cents)} por unidade</p>}
                  <div className="cart-item-bottom"><div className="quantity-control small">
                    <button type="button" onClick={() => setQuantity(item.produtoId, Math.max(1, item.quantidade - 1))} disabled={item.quantidade <= 1} aria-label={`Diminuir quantidade do produto ${item.produtoId}`}>−</button>
                    <span aria-label={`${item.quantidade} unidades`}>{item.quantidade}</span>
                    <button type="button" onClick={() => setQuantity(item.produtoId, Math.min(MAX_QUANTITY, item.quantidade + 1))} disabled={item.quantidade >= MAX_QUANTITY} aria-label={`Aumentar quantidade do produto ${item.produtoId}`}>＋</button>
                  </div><strong className="cart-subtotal">{subtotal === null ? '—' : formatCents(subtotal)}</strong></div>
                </div>
              </article>;
            })}
            <Link className="continue-link" to="/">← Continuar escolhendo</Link>
          </div>
          <aside className="summary-card" aria-label="Resumo do carrinho">
            <p className="eyebrow">RESUMO</p><h2>Suas escolhas</h2>
            <div className="summary-row"><span>Produtos no carrinho</span><strong>{items.length}</strong></div>
            {summary.hasUnavailable && <p className="summary-message danger">Itens indisponíveis foram excluídos do total.</p>}
            {summary.hasUnknown && <p className="summary-message warning">Não foi possível confirmar todos os preços. Tente novamente.</p>}
            {summary.unsafePrice && <p className="summary-message warning">Há preço fora da faixa segura. O total não pode ser calculado.</p>}
            {(summary.hasUnknown || summary.unsafePrice) && <button type="button" className="button button-outline button-wide" onClick={() => setReload((value) => value + 1)}>Atualizar produtos</button>}
            <div className="summary-total"><span>Total estimado</span><strong>{summary.total === null ? 'Indisponível' : formatCents(summary.total)}</strong></div>
            <p className="summary-footnote">Este projeto de estudo ainda não finaliza pedidos nem processa pagamentos.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
