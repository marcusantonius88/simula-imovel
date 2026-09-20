import { DEFAULT_SIMULATION_PARAMETERS } from './parameters';

describe('parâmetros internos da simulação', () => {
  it('expõe os valores de fábrica: 10% a.a., 420 meses e limite de 30%', () => {
    expect(DEFAULT_SIMULATION_PARAMETERS).toEqual({
      annualInterestRate: 10,
      termMonths: 420,
      maxIncomeCommitmentPercent: 30,
    });
  });
});
