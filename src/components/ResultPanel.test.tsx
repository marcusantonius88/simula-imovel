import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SIMULATION_PARAMETERS } from '../domain/parameters';
import { simulateSac } from '../domain/sac';
import { ResultPanel } from './ResultPanel';

const result = simulateSac({
  propertyValue: 500_000,
  downPayment: 100_000,
  monthlyIncome: 15_000,
});

describe('ResultPanel', () => {
  it('exibe os quatro valores formatados, as premissas e o indicador de limite', () => {
    render(<ResultPanel result={result} parameters={DEFAULT_SIMULATION_PARAMETERS} />);

    expect(screen.getByText('R$ 400.000,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 4.285,71')).toBeInTheDocument();
    expect(screen.getByText('R$ 960,32')).toBeInTheDocument();
    expect(screen.getByText('28,57%')).toBeInTheDocument();

    expect(screen.getByText(/Taxa nominal anual:/)).toHaveTextContent('10% ao ano');
    expect(screen.getByText(/Prazo:/)).toHaveTextContent('420 meses');
    expect(screen.getByText(/Limite de referência de comprometimento:/)).toHaveTextContent(
      '30% da renda',
    );

    expect(
      screen.getByText(/dentro do limite de referência de 30% da renda/),
    ).toBeInTheDocument();
  });

  it('indica acima do limite quando o comprometimento supera o parâmetro', () => {
    const acima = simulateSac({
      propertyValue: 500_000,
      downPayment: 100_000,
      monthlyIncome: 10_000,
    });
    render(<ResultPanel result={acima} parameters={DEFAULT_SIMULATION_PARAMETERS} />);

    expect(screen.getByText('42,86%')).toBeInTheDocument();
    expect(screen.getByText(/acima do limite de referência de 30% da renda/)).toBeInTheDocument();
  });

  it('anuncia os resultados em região viva, sem mover o foco', () => {
    render(<ResultPanel result={result} parameters={DEFAULT_SIMULATION_PARAMETERS} />);

    expect(screen.getByRole('region', { name: 'Resultados da simulação' })).toHaveAttribute(
      'aria-live',
      'polite',
    );
  });

  it('mostra o aviso permanente de estimativa', () => {
    render(<ResultPanel result={result} parameters={DEFAULT_SIMULATION_PARAMETERS} />);

    expect(
      screen.getByText(
        /não incluem seguros, taxas administrativas, atualização monetária \(TR\) ou outras condições específicas da instituição financeira/,
      ),
    ).toBeInTheDocument();
  });
});
