import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatePanel } from '../components/StatePanel';
import { ApiError, api } from '../services/api';
import type { Product, ProductInput } from '../types';

interface FormValues { nome: string; descricao: string; preco: string; imagemUrl: string }
const emptyValues: FormValues = { nome: '', descricao: '', preco: '', imagemUrl: '' };

function validate(values: FormValues): { input: ProductInput | null; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const nome = values.nome.trim();
  const descricao = values.descricao.trim();
  const imagemUrl = values.imagemUrl.trim();
  const priceText = values.preco.trim().replace(',', '.');
  if (!nome || nome.length > 120) errors.nome = 'Informe um nome de 1 a 120 caracteres.';
  if (descricao.length > 2000) errors.descricao = 'A descrição deve ter no máximo 2000 caracteres.';
  if (!/^\d+(?:\.\d{1,2})?$/.test(priceText) || Number(priceText) <= 0 || Number(priceText) > 9_999_999.99)
    errors.preco = 'Informe um preço maior que zero, com até 2 casas decimais e no máximo R$ 9.999.999,99.';
  if (imagemUrl) {
    try {
      const parsed = new URL(imagemUrl);
      if (imagemUrl.length > 2048 || !['http:', 'https:'].includes(parsed.protocol)) throw new Error('URL inválida');
    } catch { errors.imagemUrl = 'Informe uma URL HTTP(S) absoluta de até 2048 caracteres.'; }
  }
  return { input: Object.keys(errors).length ? null : { nome, descricao: descricao || null, preco: Number(priceText), imagemUrl: imagemUrl || null }, errors };
}

export function ProductFormPage() {
  const { id } = useParams();
  const editing = id !== undefined;
  const productId = Number(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState<'missing' | 'network' | null>(null);
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!editing) return;
    if (!Number.isSafeInteger(productId) || productId <= 0) { setLoadError('missing'); setLoading(false); return; }
    const controller = new AbortController();
    api.getAdminProduct(productId, controller.signal)
      .then((product: Product) => { setValues({ nome: product.nome, descricao: product.descricao || '', preco: String(product.preco), imagemUrl: product.imagemUrl || '' }); setLoadError(null); })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(error instanceof ApiError && error.status === 404 ? 'missing' : 'network'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [editing, productId, reload]);

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');
    const result = validate(values);
    setFieldErrors(result.errors);
    if (!result.input) return;
    setSaving(true);
    try {
      if (editing) await api.updateProduct(productId, result.input);
      else await api.createProduct(result.input);
      navigate('/admin/products', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(Object.fromEntries(Object.entries(error.fieldErrors).map(([field, messages]) => [field, messages.join(' ')])));
        setSubmitError(error.status === 400 && Object.keys(error.fieldErrors).length > 0 ? 'Revise os campos destacados.' : error.message);
      } else setSubmitError('Não foi possível salvar o produto. Tente novamente.');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="container page-section"><StatePanel title="Carregando produto" description="Preparando o formulário de edição." /></div>;
  if (loadError === 'missing') return <div className="container page-section"><StatePanel eyebrow="PRODUTO NÃO ENCONTRADO" title="Não encontramos esse cadastro" description="Ele pode ter sido removido." action={<Link className="button button-dark" to="/admin/products">Voltar aos produtos</Link>} /></div>;
  if (loadError) return <div className="container page-section"><StatePanel eyebrow="SEM CONEXÃO" title="Não conseguimos abrir o produto" description="Verifique a API e tente novamente." action={<button className="button button-dark" onClick={() => { setLoading(true); setReload((current) => current + 1); }}>Tentar novamente</button>} /></div>;

  return <div className="container page-section admin-page form-page">
    <nav className="breadcrumbs" aria-label="Caminho"><Link to="/admin/products">Administrar produtos</Link><span aria-hidden="true">/</span><span>{editing ? 'Editar' : 'Novo produto'}</span></nav>
    <div className="section-heading"><div><p className="eyebrow">ADMINISTRAÇÃO</p><h1>{editing ? 'Editar produto' : 'Novo produto'}<span className="accent-dot">.</span></h1><p className="heading-description">{editing ? 'Atualize as informações do catálogo.' : 'Preencha as informações para adicionar um item ao catálogo.'}</p></div></div>
    <div className="form-layout"><form onSubmit={submit} noValidate className="product-form">
      <div className="form-section-title"><span>01</span><h2>Informações do produto</h2></div>
      {submitError && <div className="notice danger" role="alert">{submitError}</div>}
      <div className="form-field"><label htmlFor="nome">Nome do produto <span aria-hidden="true">*</span></label><input id="nome" name="nome" maxLength={120} value={values.nome} onChange={(event) => update('nome', event.target.value)} aria-invalid={!!fieldErrors.nome} aria-describedby={fieldErrors.nome ? 'nome-error' : undefined} placeholder="Ex.: Caderno de anotações" /><span className="field-help">Até 120 caracteres.</span>{fieldErrors.nome && <span className="field-error" id="nome-error">{fieldErrors.nome}</span>}</div>
      <div className="form-field"><label htmlFor="descricao">Descrição</label><textarea id="descricao" name="descricao" rows={5} maxLength={2000} value={values.descricao} onChange={(event) => update('descricao', event.target.value)} aria-invalid={!!fieldErrors.descricao} aria-describedby={fieldErrors.descricao ? 'descricao-error' : undefined} placeholder="Conte um pouco mais sobre o produto..." /><span className="field-help">Opcional, até 2.000 caracteres.</span>{fieldErrors.descricao && <span className="field-error" id="descricao-error">{fieldErrors.descricao}</span>}</div>
      <div className="form-field"><label htmlFor="preco">Preço (R$) <span aria-hidden="true">*</span></label><input id="preco" name="preco" inputMode="decimal" value={values.preco} onChange={(event) => update('preco', event.target.value)} aria-invalid={!!fieldErrors.preco} aria-describedby={fieldErrors.preco ? 'preco-error' : undefined} placeholder="Ex.: 19,90" /><span className="field-help">Use até duas casas decimais. Limite da interface: R$ 9.999.999,99.</span>{fieldErrors.preco && <span className="field-error" id="preco-error">{fieldErrors.preco}</span>}</div>
      <div className="form-field"><label htmlFor="imagemUrl">URL da imagem</label><input id="imagemUrl" name="imagemUrl" type="url" value={values.imagemUrl} onChange={(event) => update('imagemUrl', event.target.value)} aria-invalid={!!fieldErrors.imagemUrl} aria-describedby={fieldErrors.imagemUrl ? 'imagem-error' : undefined} placeholder="https://exemplo.com/imagem.jpg" /><span className="field-help">Opcional. Aceita endereços HTTP ou HTTPS.</span>{fieldErrors.imagemUrl && <span className="field-error" id="imagem-error">{fieldErrors.imagemUrl}</span>}</div>
      <div className="form-actions"><Link className="button button-outline" to="/admin/products">Cancelar</Link><button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar produto'} <span aria-hidden="true">↗</span></button></div>
    </form><aside className="form-aside"><span className="eyebrow">BOM SABER</span><h3>Um catálogo simples, do seu jeito.</h3><p>Produtos novos aparecem ativos no catálogo. Você pode desativá-los depois na lista administrativa sem perder o cadastro.</p><div className="aside-rule" /><p>Esta área não possui login. Use o projeto somente em ambiente local de estudo.</p></aside></div>
  </div>;
}
