import { formatCurrencyBrl, formatPercentBr } from '../domain/format';
import type { SimulationParameters } from '../domain/parameters';
import type { SacResult } from '../domain/sac';

export interface ResultPanelProps {
  result: SacResult;
  parameters: SimulationParameters;
}

const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

function LimitIndicator({ result, parameters }: Omit<ResultPanelProps, never>) {
  const limite = numberFormatter.format(parameters.maxIncomeCommitmentPercent);
  return (
    <p
      className={
        result.withinReferenceLimit
          ? 'limit-indicator limit-indicator--within'
          : 'limit-indicator limit-indicator--above'
      }
    >
      {result.withinReferenceLimit
        ? `A primeira parcela está dentro do limite de referência de ${limite}% da renda.`
        : `A primeira parcela está acima do limite de referência de ${limite}% da renda.`}
    </p>
  );
}

export function ResultPanel({ result, parameters }: ResultPanelProps) {
  return (
    <section className="results" aria-label="Resultados da simulação" aria-live="polite">
      <h2>Resultados estimados</h2>
      <dl className="results__list">
        <div className="results__item">
          <dt>Valor financiado</dt>
          <dd>{formatCurrencyBrl(result.financedAmount)}</dd>
        </div>
        <div className="results__item">
          <dt>Primeira parcela estimada</dt>
          <dd>{formatCurrencyBrl(result.firstInstallment)}</dd>
        </div>
        <div className="results__item">
          <dt>Última parcela estimada</dt>
          <dd>{formatCurrencyBrl(result.lastInstallment)}</dd>
        </div>
        <div className="results__item">
          <dt>Comprometimento da renda</dt>
          <dd>{formatPercentBr(result.incomeCommitmentPercent)}</dd>
        </div>
      </dl>
      <LimitIndicator result={result} parameters={parameters} />
      <ul className="assumptions">
        <li>
          Taxa nominal anual: {numberFormatter.format(parameters.annualInterestRate)}% ao ano
        </li>
        <li>Prazo: {numberFormatter.format(parameters.termMonths)} meses</li>
        <li>
          Limite de referência de comprometimento:{' '}
          {numberFormatter.format(parameters.maxIncomeCommitmentPercent)}% da renda
        </li>
      </ul>
      <p className="disclaimer">
        Os valores apresentados são estimativas e não incluem seguros, taxas administrativas,
        atualização monetária (TR) ou outras condições específicas da instituição financeira.
      </p>
    </section>
  );
}
