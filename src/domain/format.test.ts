import { formatCurrencyBrl, formatPercentBr } from './format';

describe('formatCurrencyBrl', () => {
  it('formata com separador de milhar e duas casas decimais', () => {
    expect(formatCurrencyBrl(1234.56)).toBe('R$ 1.234,56');
    expect(formatCurrencyBrl(400_000)).toBe('R$ 400.000,00');
    expect(formatCurrencyBrl(4285.71)).toBe('R$ 4.285,71');
  });
});

describe('formatPercentBr', () => {
  it('formata percentual com vírgula decimal e duas casas', () => {
    expect(formatPercentBr(28.5714)).toBe('28,57%');
    expect(formatPercentBr(42.8571)).toBe('42,86%');
    expect(formatPercentBr(30)).toBe('30,00%');
  });
});
