import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatPrice, toCents } from '../utils/money';
import { ProductImage } from './ProductImage';

export function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const safePrice = toCents(product.preco) !== null;
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-media" aria-label={`Ver detalhes de ${product.nome}`}>
        <ProductImage src={product.imagemUrl} name={product.nome} />
      </Link>
      <div className="product-card-body">
        <p className="product-card-kicker">Produto #{String(product.id).padStart(3, '0')}</p>
        <Link to={`/products/${product.id}`} className="product-card-title">{product.nome}</Link>
        <p className="product-card-description">{product.descricao || 'Um item para tornar seus estudos ainda melhores.'}</p>
        <div className="product-card-bottom">
          <div>
            <span className="price-label">Preço</span>
            <strong className="price">{formatPrice(product.preco)}</strong>
          </div>
          <button type="button" className="icon-button" onClick={() => onAdd(product)} disabled={!safePrice}
            aria-label={`Adicionar ${product.nome} ao carrinho`} title={safePrice ? 'Adicionar ao carrinho' : 'Preço fora da faixa segura'}>
            <span aria-hidden="true">＋</span>
          </button>
        </div>
      </div>
    </article>
  );
}
