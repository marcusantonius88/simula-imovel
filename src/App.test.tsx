import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

const CAMPOS = {
  imovel: 'Valor do imóvel (R$)',
  entrada: 'Valor da entrada (R$)',
  renda: 'Renda bruta mensal (R$)',
} as const;

async function preencher(imovel: string, entrada: string, renda: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(CAMPOS.imovel), imovel);
  await user.type(screen.getByLabelText(CAMPOS.entrada), entrada);
  await user.type(screen.getByLabelText(CAMPOS.renda), renda);
  return user;
}

describe('App — cálculo automático (caso de referência)', () => {
  it('exibe os quatro resultados ao digitar 500000 / 100000 / 15000', async () => {
    render(<App />);
    await preencher('500000', '100000', '15000');

    expect(screen.getByText('R$ 400.000,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 4.285,71')).toBeInTheDocument();
    expect(screen.getByText('R$ 960,32')).toBeInTheDocument();
    expect(screen.getByText('28,57%')).toBeInTheDocument();
  });

  it('exibe as premissas internas usadas na simulação', async () => {
    render(<App />);
    await preencher('500000', '100000', '15000');

    expect(screen.getByText(/Taxa nominal anual:/)).toHaveTextContent('10% ao ano');
    expect(screen.getByText(/Prazo:/)).toHaveTextContent('420 meses');
    expect(screen.getByText(/Limite de referência de comprometimento:/)).toHaveTextContent(
      '30% da renda',
    );
  });

  it('recalcula sem botão ao alterar a renda e indica acima do limite', async () => {
    render(<App />);
    const user = await preencher('500000', '100000', '15000');

    await user.clear(screen.getByLabelText(CAMPOS.renda));
    await user.type(screen.getByLabelText(CAMPOS.renda), '10000');

    expect(screen.getByText('42,86%')).toBeInTheDocument();
    expect(screen.getByText(/acima do limite de referência/)).toBeInTheDocument();
  });
});

describe('App — validação', () => {
  it('não exibe resultados antes de as entradas ficarem válidas', () => {
    render(<App />);

    expect(screen.queryByText(/primeira parcela/i)).not.toBeInTheDocument();
  });

  it('mostra as mensagens dos campos inválidos com nenhum resultado; corrigir traz os resultados', async () => {
    render(<App />);
    const user = userEvent.setup();
    const imovel = screen.getByLabelText(CAMPOS.imovel);

    await user.type(imovel, '0');
    const alertas = screen.getAllByRole('alert');
    expect(alertas.map((alerta) => alerta.textContent)).toEqual([
      'O valor do imóvel deve ser maior que zero.',
      'O valor da entrada não pode ser negativo e deve ser menor que o valor do imóvel.',
      'A renda bruta mensal deve ser maior que zero.',
    ]);
    expect(screen.queryByText(/primeira parcela/i)).not.toBeInTheDocument();

    await user.clear(imovel);
    await user.type(imovel, '500000');
    await user.type(screen.getByLabelText(CAMPOS.renda), '15000');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('R$ 500.000,00')).toBeInTheDocument();

    await user.type(screen.getByLabelText(CAMPOS.entrada), '100000');
    expect(screen.getByText('R$ 400.000,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 4.285,71')).toBeInTheDocument();
  });
});
