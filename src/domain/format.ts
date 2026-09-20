const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata um valor em reais: `R$ 1.234,56`. */
export function formatCurrencyBrl(value: number): string {
  // Intl usa espaço não separável (U+00A0) após "R$"; normalizamos para espaço comum.
  return currencyFormatter.format(value).replace(/\u00A0/g, ' ');
}

/** Formata um percentual com duas casas: `28,57%`. */
export function formatPercentBr(value: number): string {
  return `${percentFormatter.format(value)}%`;
}
