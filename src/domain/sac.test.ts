import { DEFAULT_SIMULATION_PARAMETERS } from './parameters';
import { simulateSac, toMonthlyRate, validateSacInput } from './sac';
import type { SacInput } from './sac';

const REFERENCE_INPUT: SacInput = {
  propertyValue: 500_000,
  downPayment: 100_000,
  monthlyIncome: 15_000,
};

describe('toMonthlyRate', () => {
  it('deriva a taxa mensal da taxa nominal anual dividida por 12', () => {
    expect(toMonthlyRate(10)).toBe(10 / 100 / 12);
    expect(toMonthlyRate(12)).toBe(12 / 100 / 12);
    expect(toMonthlyRate(0)).toBe(0);
  });
});

describe('simulateSac', () => {
  it('calcula o caso de referência com os parâmetros de fábrica', () => {
    const result = simulateSac(REFERENCE_INPUT);
    expect(result.financedAmount).toBe(400_000);
    expect(result.firstInstallment).toBe(4285.71);
    expect(result.lastInstallment).toBe(960.32);
  });

  it('usa DEFAULT_SIMULATION_PARAMETERS quando não recebe parâmetros', () => {
    expect(simulateSac(REFERENCE_INPUT, DEFAULT_SIMULATION_PARAMETERS)).toEqual(
      simulateSac(REFERENCE_INPUT),
    );
  });

  it('calcula o valor financiado como imóvel menos entrada', () => {
    const result = simulateSac({ ...REFERENCE_INPUT, downPayment: 150_000 });
    expect(result.financedAmount).toBe(350_000);
  });

  it('arredonda cada saída para centavos', () => {
    const result = simulateSac({ propertyValue: 100_000, downPayment: 0, monthlyIncome: 1_000 });
    expect(result.firstInstallment).toBe(1071.43);
    expect(result.lastInstallment).toBe(240.08);
  });
});

describe('comprometimento da renda', () => {
  it('calcula o percentual sobre a primeira parcela já arredondada (28,57%)', () => {
    const result = simulateSac(REFERENCE_INPUT);
    expect(result.incomeCommitmentPercent).toBe(28.57);
    expect(result.withinReferenceLimit).toBe(true);
  });

  it('indica acima do limite quando o percentual supera 30% (42,86%)', () => {
    const result = simulateSac({ ...REFERENCE_INPUT, monthlyIncome: 10_000 });
    expect(result.incomeCommitmentPercent).toBe(42.86);
    expect(result.withinReferenceLimit).toBe(false);
  });

  it('usa o limite recebido nos parâmetros ao decidir dentro/acima', () => {
    const result = simulateSac(REFERENCE_INPUT, {
      ...DEFAULT_SIMULATION_PARAMETERS,
      maxIncomeCommitmentPercent: 20,
    });
    expect(result.incomeCommitmentPercent).toBe(28.57);
    expect(result.withinReferenceLimit).toBe(false);
  });
});

describe('validateSacInput', () => {
  it('retorna objeto sem chaves para o caso válido', () => {
    const errors = validateSacInput(REFERENCE_INPUT);
    expect(errors).toEqual({});
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it.each([0, -1, Number.NaN])(
    'exige valor do imóvel maior que zero (recebido: %p)',
    (propertyValue) => {
      const errors = validateSacInput({ ...REFERENCE_INPUT, propertyValue });
      expect(errors.propertyValue).toBe('O valor do imóvel deve ser maior que zero.');
    },
  );

  it('rejeita entrada negativa, igual ou maior que o valor do imóvel', () => {
    const mensagem = 'O valor da entrada não pode ser negativo e deve ser menor que o valor do imóvel.';
    expect(validateSacInput({ ...REFERENCE_INPUT, downPayment: -1 }).downPayment).toBe(mensagem);
    expect(validateSacInput({ ...REFERENCE_INPUT, downPayment: 500_000 }).downPayment).toBe(
      mensagem,
    );
    expect(validateSacInput({ ...REFERENCE_INPUT, downPayment: 500_001 }).downPayment).toBe(
      mensagem,
    );
  });

  it.each([0, -10, Number.NaN])(
    'exige renda bruta mensal maior que zero (recebido: %p)',
    (monthlyIncome) => {
      const errors = validateSacInput({ ...REFERENCE_INPUT, monthlyIncome });
      expect(errors.monthlyIncome).toBe('A renda bruta mensal deve ser maior que zero.');
    },
  );

  it('aceita entrada zero como caso válido (financiamento integral)', () => {
    expect(validateSacInput({ ...REFERENCE_INPUT, downPayment: 0 })).toEqual({});
  });
});

describe('bordas com parâmetros injetados', () => {
  it('com entrada zero, o valor financiado é igual ao valor do imóvel', () => {
    const result = simulateSac({ propertyValue: 300_000, downPayment: 0, monthlyIncome: 10_000 });
    expect(result.financedAmount).toBe(300_000);
  });

  it('com taxa 0%, primeira e última parcelas são o financiado dividido pelo prazo', () => {
    const result = simulateSac(REFERENCE_INPUT, {
      ...DEFAULT_SIMULATION_PARAMETERS,
      annualInterestRate: 0,
    });
    expect(result.firstInstallment).toBe(952.38);
    expect(result.lastInstallment).toBe(952.38);
  });

  it('com prazo de 1 mês, primeira e última parcelas coincidem', () => {
    const result = simulateSac(REFERENCE_INPUT, {
      ...DEFAULT_SIMULATION_PARAMETERS,
      termMonths: 1,
    });
    expect(result.firstInstallment).toBe(result.lastInstallment);
    expect(result.firstInstallment).toBe(403_333.33);
  });

  it('com taxa maior que zero e prazo maior que um mês, a última parcela é menor que a primeira', () => {
    const result = simulateSac(REFERENCE_INPUT);
    expect(result.lastInstallment).toBeLessThan(result.firstInstallment);
  });
});

describe('troca de parâmetros sem alterar a lógica do domínio', () => {
  it('reflete taxa de 12% ao ano e prazo de 240 meses', () => {
    const result = simulateSac(REFERENCE_INPUT, {
      annualInterestRate: 12,
      termMonths: 240,
      maxIncomeCommitmentPercent: 30,
    });
    expect(result.firstInstallment).toBe(5666.67);
    expect(result.lastInstallment).toBe(1683.33);
  });

  it('respeita o limite reduzido para 20% no caso de referência', () => {
    const result = simulateSac(REFERENCE_INPUT, {
      annualInterestRate: 10,
      termMonths: 420,
      maxIncomeCommitmentPercent: 20,
    });
    expect(result.incomeCommitmentPercent).toBe(28.57);
    expect(result.withinReferenceLimit).toBe(false);
  });
});
