import { DEFAULT_SIMULATION_PARAMETERS, type SimulationParameters } from './parameters';

/** Os três dados informados pelo usuário. Parâmetros internos NÃO fazem parte. */
export interface SacInput {
  /** Valor do imóvel, em R$. */
  propertyValue: number;
  /** Valor da entrada, em R$. */
  downPayment: number;
  /** Renda bruta mensal, em R$. */
  monthlyIncome: number;
}

export interface SacResult {
  /** Valor financiado (imóvel - entrada), em R$. */
  financedAmount: number;
  /** Primeira parcela estimada, em R$. */
  firstInstallment: number;
  /** Última parcela estimada, em R$. */
  lastInstallment: number;
  /** Comprometimento da renda, em % (0..100), calculado sobre a primeira parcela arredondada. */
  incomeCommitmentPercent: number;
  /** `true` quando o percentual está dentro do limite de referência dos parâmetros. */
  withinReferenceLimit: boolean;
}

export type SacField = keyof SacInput;

/** Mapa campo → mensagem de erro (pt-BR). Objeto sem chaves = entradas válidas. */
export type SacValidationErrors = Partial<Record<SacField, string>>;

/** Converte a taxa nominal anual (%) em taxa mensal: taxa anual / 100 / 12. */
export function toMonthlyRate(annualInterestRate: number): number {
  return annualInterestRate / 100 / 12;
}

/** Arredonda para centavos, meio para cima. */
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

const MESSAGES = {
  propertyValue: 'O valor do imóvel deve ser maior que zero.',
  downPayment: 'O valor da entrada não pode ser negativo e deve ser menor que o valor do imóvel.',
  monthlyIncome: 'A renda bruta mensal deve ser maior que zero.',
} as const;

function isAbsent(value: number): boolean {
  return !Number.isFinite(value);
}

/**
 * Valida apenas os três campos do usuário. Um único motivo por campo:
 * imóvel ≤ 0 ou ausente; entrada negativa ou ≥ imóvel; renda ≤ 0 ou ausente.
 */
export function validateSacInput(input: SacInput): SacValidationErrors {
  const errors: SacValidationErrors = {};

  if (isAbsent(input.propertyValue) || input.propertyValue <= 0) {
    errors.propertyValue = MESSAGES.propertyValue;
  }

  const propertyValue = input.propertyValue;
  const entradaInvalida =
    isAbsent(input.downPayment) ||
    input.downPayment < 0 ||
    (Number.isFinite(propertyValue) && input.downPayment >= propertyValue);
  if (entradaInvalida) {
    errors.downPayment = MESSAGES.downPayment;
  }

  if (isAbsent(input.monthlyIncome) || input.monthlyIncome <= 0) {
    errors.monthlyIncome = MESSAGES.monthlyIncome;
  }

  return errors;
}

/**
 * Simulação SAC com amortização constante:
 *   A  = P / n (amortização)
 *   P1 = P * (1/n + i)      (primeira parcela: amortização + juros sobre o saldo cheio)
 *   Pn = (P/n) * (1 + i)    (última parcela: amortização + juros sobre o saldo final A)
 *   C  = P1(arredondada) / renda * 100
 * Cada saída é arredondada para centavos ao final.
 */
export function simulateSac(
  input: SacInput,
  parameters: SimulationParameters = DEFAULT_SIMULATION_PARAMETERS,
): SacResult {
  const financedAmount = roundToCents(input.propertyValue - input.downPayment);
  const monthlyRate = toMonthlyRate(parameters.annualInterestRate);
  const amortization = financedAmount / parameters.termMonths;

  const firstInstallment = roundToCents(financedAmount * (1 / parameters.termMonths + monthlyRate));
  const lastInstallment = roundToCents(amortization * (1 + monthlyRate));
  const incomeCommitmentPercent = roundToCents((firstInstallment / input.monthlyIncome) * 100);

  return {
    financedAmount,
    firstInstallment,
    lastInstallment,
    incomeCommitmentPercent,
    withinReferenceLimit: incomeCommitmentPercent <= parameters.maxIncomeCommitmentPercent,
  };
}
