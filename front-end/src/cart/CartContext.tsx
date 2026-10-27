import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartItem } from '../types';
import { addItem, changeQuantity, readCart, removeItem, writeCart } from './cart';

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (productId: number, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart);
  useEffect(() => writeCart(items), [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantidade, 0),
    add: (productId, quantity = 1) => setItems((current) => addItem(current, productId, quantity)),
    setQuantity: (productId, quantity) => setItems((current) => changeQuantity(current, productId, quantity)),
    remove: (productId) => setItems((current) => removeItem(current, productId)),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart precisa estar dentro de CartProvider.');
  return context;
}
