import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SimulationForm } from './SimulationForm';

const EMPTY_VALUES = { propertyValue: '', downPayment: '', monthlyIncome: '' };

describe('SimulationForm', () => {
  it('renderiza exatamente os três campos, vazios', () => {
    render(<SimulationForm values={EMPTY_VALUES} onChange={() => {}} errors={{}} />);

    expect(screen.getByLabelText('Valor do imóvel (R$)')).toHaveValue(null);
    expect(screen.getByLabelText('Valor da entrada (R$)')).toHaveValue(null);
    expect(screen.getByLabelText('Renda bruta mensal (R$)')).toHaveValue(null);
    expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
    expect(screen.queryByLabelText(/juros|prazo|limite/i)).not.toBeInTheDocument();
  });

  it('delega a digitação ao onChange com o campo e o valor acumulado', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <SimulationForm
        values={{ ...EMPTY_VALUES, propertyValue: '50' }}
        onChange={handleChange}
        errors={{}}
      />,
    );

    await user.type(screen.getByLabelText('Valor do imóvel (R$)'), '0');

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('propertyValue', '500');
  });

  it('exibe a mensagem recebida por props, vinculada ao campo por aria-describedby', () => {
    render(
      <SimulationForm
        values={EMPTY_VALUES}
        onChange={() => {}}
        errors={{ propertyValue: 'O valor do imóvel deve ser maior que zero.' }}
      />,
    );

    const campo = screen.getByLabelText('Valor do imóvel (R$)');
    const alertas = screen.getAllByRole('alert');

    expect(alertas).toHaveLength(1);
    expect(alertas[0]).toHaveTextContent('O valor do imóvel deve ser maior que zero.');
    expect(campo).toHaveAttribute('aria-describedby', 'property-value-error');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
  });
});
