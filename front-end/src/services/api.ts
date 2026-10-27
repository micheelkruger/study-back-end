import type { Product, ProductInput } from '../types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
    });
  } catch {
    throw new ApiError('Não foi possível conectar à API. Verifique se ela está em execução.', 0);
  }

  if (!response.ok) {
    let details: { title?: string; errors?: Record<string, string[]> } = {};
    try {
      details = await response.json();
    } catch {
      // A resposta pode não conter JSON.
    }
    const message = response.status === 404
      ? 'Produto não encontrado.'
      : response.status >= 500
        ? 'A API apresentou uma falha. Tente novamente.'
        : details.title || `A solicitação falhou (${response.status}).`;
    throw new ApiError(message, response.status, details.errors || {});
  }

  return response.json() as Promise<T>;
}

export const api = {
  listProducts: (signal?: AbortSignal) => request<Product[]>('/api/products', { signal }),
  getProduct: (id: number, signal?: AbortSignal) => request<Product>(`/api/products/${id}`, { signal }),
  listAdminProducts: (signal?: AbortSignal) => request<Product[]>('/api/admin/products', { signal }),
  getAdminProduct: (id: number, signal?: AbortSignal) => request<Product>(`/api/admin/products/${id}`, { signal }),
  createProduct: (input: ProductInput) => request<Product>('/api/admin/products', {
    method: 'POST', body: JSON.stringify(input),
  }),
  updateProduct: (id: number, input: ProductInput) => request<Product>(`/api/admin/products/${id}`, {
    method: 'PUT', body: JSON.stringify(input),
  }),
  setProductActive: (id: number, ativo: boolean) => request<Product>(`/api/admin/products/${id}/status`, {
    method: 'PATCH', body: JSON.stringify({ ativo }),
  }),
};
