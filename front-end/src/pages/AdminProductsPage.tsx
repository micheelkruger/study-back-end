import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductImage } from '../components/ProductImage';
import { StatePanel } from '../components/StatePanel';
import { ApiError, api } from '../services/api';
import type { Product } from '../types';
import { formatPrice } from '../utils/money';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api.listAdminProducts(controller.signal)
      .then((result) => { setProducts(result); setError(false); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  function retry() { setLoading(true); setReload((value) => value + 1); }
  async function toggle(product: Product) {
    setBusyId(product.id);
    setNotice('');
    try {
      const updated = await api.setProductActive(product.id, !product.ativo);
      setProducts((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(`${updated.nome} foi ${updated.ativo ? 'ativado' : 'desativado'} com sucesso.`);
    } catch (failure) {
      setNotice(failure instanceof ApiError ? failure.message : 'Não foi possível atualizar o produto.');
    } finally {
      setBusyId(null);
    }
  }

  return <div className="container page-section admin-page">
    <div className="admin-banner"><span className="eyebrow">ÁREA DE ESTUDO / ADMIN</span><p>Sem autenticação nesta versão. Use somente em ambiente local.</p></div>
    <div className="section-heading admin-heading"><div><p className="eyebrow">GERENCIAMENTO</p><h1>Produtos<span className="accent-dot">.</span></h1><p className="heading-description">Cadastre e mantenha o catálogo da loja.</p></div><Link className="button button-dark" to="/admin/products/new">＋ Novo produto</Link></div>
    {notice && <div className="notice" role="status">{notice}<button type="button" aria-label="Fechar aviso" onClick={() => setNotice('')}>×</button></div>}
    {loading ? <p className="loading-text" role="status">Carregando produtos...</p>
      : error ? <StatePanel eyebrow="SEM CONEXÃO" title="Não conseguimos carregar a administração" description="Verifique a API e tente novamente." action={<button className="button button-dark" onClick={retry}>Tentar novamente</button>} />
        : products.length === 0 ? <StatePanel eyebrow="SEM PRODUTOS" title="Comece com o primeiro produto" description="Cadastre um item para que ele apareça no catálogo." action={<Link className="button button-dark" to="/admin/products/new">Cadastrar produto</Link>} />
          : <div className="admin-list" aria-label="Produtos cadastrados">
            <div className="admin-list-head"><span>PRODUTO</span><span>PREÇO</span><span>STATUS</span><span>AÇÕES</span></div>
            {products.map((product) => <div className="admin-row" key={product.id}>
              <div className="admin-product"><ProductImage src={product.imagemUrl} name={product.nome} className="admin-thumb" /><div><strong>{product.nome}</strong><span>#{String(product.id).padStart(3, '0')}</span></div></div>
              <strong className="admin-price">{formatPrice(product.preco)}</strong>
              <span className={`status-pill ${product.ativo ? 'active' : 'inactive'}`}>{product.ativo ? 'Ativo' : 'Inativo'}</span>
              <div className="admin-actions"><Link to={`/admin/products/${product.id}/edit`} className="small-link">Editar</Link><button type="button" className="small-link" disabled={busyId === product.id} onClick={() => toggle(product)}>{busyId === product.id ? 'Salvando...' : product.ativo ? 'Desativar' : 'Ativar'}</button></div>
            </div>)}
          </div>}
  </div>;
}
