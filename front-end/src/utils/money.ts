const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const MAX_DISPLAY_PRICE = 9_999_999.99;

export function toCents(price: number): number | null {
  if (!Number.isFinite(price) || price < 0 || price > MAX_DISPLAY_PRICE) return null;
  const raw = price * 100;
  const cents = Math.round(raw);
  return Number.isSafeInteger(cents) && Math.abs(raw - cents) < 0.000001 ? cents : null;
}

export function lineTotal(cents: number, quantity: number): number | null {
  const total = cents * quantity;
  return Number.isSafeInteger(total) ? total : null;
}

export function sumCents(values: number[]): number | null {
  let sum = 0;
  for (const value of values) {
    sum += value;
    if (!Number.isSafeInteger(sum)) return null;
  }
  return sum;
}

export function formatCents(cents: number): string {
  return formatter.format(cents / 100);
}

export function formatPrice(price: number): string {
  const cents = toCents(price);
  return cents === null ? 'Preço indisponível' : formatCents(cents);
}
