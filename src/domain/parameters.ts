/**
 * ÚNICO lugar do projeto com os números do produto (taxa, prazo e limite).
 * Alterar o comportamento da simulação é editar apenas este arquivo:
 * nenhuma fórmula, assinatura ou campo de tela muda.
 */
export interface SimulationParameters {
  /** Taxa nominal anual, em % ao ano. A mensal é derivada (taxa anual / 12). */
  annualInterestRate: number;
  /** Prazo do financiamento, em meses. */
  termMonths: number;
  /** Limite de referência do comprometimento da renda, em % da renda bruta mensal. */
  maxIncomeCommitmentPercent: number;
}

export const DEFAULT_SIMULATION_PARAMETERS: SimulationParameters = {
  annualInterestRate: 10,
  termMonths: 420,
  maxIncomeCommitmentPercent: 30,
};
