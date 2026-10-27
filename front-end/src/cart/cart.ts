import type { CartItem } from '../types';

export const CART_STORAGE_KEY = 'estudos-ecommerce.cart.v1';
export const MAX_QUANTITY = 99;

export function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const quantities = new Map<number, number>();
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const candidate = entry as Partial<CartItem>;
    if (!Number.isSafeInteger(candidate.produtoId) || (candidate.produtoId ?? 0) <= 0 ||
        !Number.isInteger(candidate.quantidade) || (candidate.quantidade ?? 0) < 1 ||
        (candidate.quantidade ?? 0) > MAX_QUANTITY) continue;
    const id = candidate.produtoId!;
    quantities.set(id, Math.min(MAX_QUANTITY, (quantities.get(id) ?? 0) + candidate.quantidade!));
  }
  return [...quantities].map(([produtoId, quantidade]) => ({ produtoId, quantidade }));
}

export function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? normalizeCart(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // A sessão ainda funciona quando o armazenamento do navegador está indisponível.
  }
}

export function addItem(items: CartItem[], produtoId: number, quantidade: number): CartItem[] {
  if (!Number.isSafeInteger(produtoId) || produtoId <= 0 ||
      !Number.isInteger(quantidade) || quantidade < 1 || quantidade > MAX_QUANTITY) return items;
  const existing = items.find((item) => item.produtoId === produtoId);
  return existing
    ? items.map((item) => item.produtoId === produtoId
      ? { ...item, quantidade: Math.min(MAX_QUANTITY, item.quantidade + quantidade) }
      : item)
    : [...items, { produtoId, quantidade }];
}

export function changeQuantity(items: CartItem[], produtoId: number, quantidade: number): CartItem[] {
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > MAX_QUANTITY) return items;
  return items.map((item) => item.produtoId === produtoId ? { ...item, quantidade } : item);
}

export function removeItem(items: CartItem[], produtoId: number): CartItem[] {
  return items.filter((item) => item.produtoId !== produtoId);
}
