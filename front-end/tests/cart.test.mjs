import test from 'node:test';
import assert from 'node:assert/strict';
import { addItem, changeQuantity, normalizeCart, readCart, removeItem, writeCart, CART_STORAGE_KEY } from '../src/cart/cart.ts';
import { formatCents, lineTotal, sumCents, toCents } from '../src/utils/money.ts';

test('carrinho valida dados recuperados, une duplicatas e limita quantidades', () => {
  assert.deepEqual(normalizeCart([
    { produtoId: 1, quantidade: 60 },
    { produtoId: 1, quantidade: 60 },
    { produtoId: -2, quantidade: 1 },
    { produtoId: 2, quantidade: 0 },
    { produtoId: 3, quantidade: 4.5 },
    null,
  ]), [{ produtoId: 1, quantidade: 99 }]);
});

test('adição, alteração e remoção seguem limite de 1 a 99', () => {
  const added = addItem([], 7, 2);
  assert.deepEqual(addItem(added, 7, 98), [{ produtoId: 7, quantidade: 99 }]);
  assert.deepEqual(changeQuantity(added, 7, 0), added);
  assert.deepEqual(changeQuantity(added, 7, 3), [{ produtoId: 7, quantidade: 3 }]);
  assert.deepEqual(removeItem(added, 7), []);
});

test('armazenamento corrompido não quebra o carrinho', () => {
  const values = new Map([[CART_STORAGE_KEY, '{invalid']]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.deepEqual(readCart(), []);
  writeCart([{ produtoId: 4, quantidade: 2 }]);
  assert.deepEqual(readCart(), [{ produtoId: 4, quantidade: 2 }]);
  delete globalThis.localStorage;
});

test('centavos somam corretamente e valores fora da faixa segura não produzem total', () => {
  assert.equal(toCents(19.90), 1990);
  assert.equal(lineTotal(1990, 3), 5970);
  assert.equal(sumCents([5970, 30]), 6000);
  assert.equal(formatCents(6000), 'R$ 60,00');
  assert.equal(toCents(10_000_000), null);
  assert.equal(toCents(0.001), null);
  assert.equal(sumCents([Number.MAX_SAFE_INTEGER, 1]), null);
});
