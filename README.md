# SimulaImóvel

Simulador de financiamento imobiliário pelo **sistema SAC** (MVP, sem backend). O usuário informa
três dados — **valor do imóvel**, **valor da entrada** e **renda bruta mensal** — e a aplicação
apresenta, calculada no navegador:

- **valor financiado** (imóvel − entrada);
- **primeira parcela estimada**;
- **última parcela estimada**;
- **percentual de comprometimento da renda**, com indicação de dentro/acima do limite de referência.

## Premissas de cálculo

- **Taxa mensal = taxa nominal anual ÷ 12.** Esta é a convenção adotada pelo SimulaImóvel neste
  MVP (premissa do simulador, não uma afirmação sobre o que instituições financeiras praticam).
- **Parâmetros internos**: taxa nominal anual de **10% a.a.**, prazo de **420 meses** e limite de
  referência de comprometimento de **30%** da renda. Não são solicitados ao usuário.
  Para alterá-los, edite **um único arquivo**: [`src/domain/parameters.ts`](src/domain/parameters.ts)
  (constante `DEFAULT_SIMULATION_PARAMETERS`). Nenhuma fórmula, assinatura ou campo de tela muda.
- **Arredondamento em centavos**, meio para cima, aplicado a cada saída; o comprometimento é
  calculado sobre a primeira parcela **já arredondada**, para que a tela seja reproduzível na mão.
- **Valores sem adicionais**: as parcelas exibidas não incluem seguros (MIP/DFI), taxa de
  administração, tarifas, atualização monetária (TR) ou outras condições específicas da instituição
  financeira. O resultado é uma **estimativa**, não uma proposta de crédito.
- **Sem persistência**: recarregar a página volta os campos ao estado inicial; nada é enviado a
  servidores. Todo o cálculo acontece no navegador.

## Fórmulas do SAC

Com valor financiado `P`, prazo `n` (meses) e taxa mensal `i = anual/100/12`:

| Grandeza | Fórmula |
| --- | --- |
| Amortização constante | `A = P / n` |
| Primeira parcela | `P1 = P × (1/n + i)` |
| Última parcela | `Pn = (P/n) × (1 + i)` |
| Comprometimento da renda | `C = P1 ÷ renda × 100` |

Exemplo de referência (500.000 / 100.000 / 15.000, parâmetros de fábrica): financiado
`R$ 400.000,00`, primeira parcela `R$ 4.285,71`, última parcela `R$ 960,32`, comprometimento
`28,57%` (dentro do limite de 30%).

## Como rodar

```bash
npm install       # instala as dependências
npm run dev       # servidor de desenvolvimento com HMR
npm run test:run  # suíte de testes (Vitest + Testing Library)
npm run build     # build estático em dist/
npm run preview   # serve o build para conferência
npm run typecheck # checagem de tipos (tsc --noEmit)
```

## Estrutura

```
src/
  App.tsx                  # tela única: estado dos campos + cálculo derivado
  domain/
    parameters.ts          # ÚNICO lugar com taxa, prazo e limite (10% a.a. / 420 meses / 30%)
    sac.ts                 # fórmulas SAC e validação (recebe os parâmetros por argumento)
    format.ts              # formatação pt-BR (moeda e percentual)
  components/
    SimulationForm.tsx     # os três campos de entrada
    ResultPanel.tsx        # resultados, premissas, indicador de limite e aviso
```

## Fora do escopo deste MVP

- Backend, API, banco de dados, autenticação e persistência.
- Campos de taxa de juros, prazo ou limite na interface (são parâmetros internos por decisão de
  produto; expô-los é evolução futura).
- Tabela de amortização mês a mês, total de juros pagos, sistemas PRICE ou SAC com seguros.
- Comparação com regras reais de crédito bancário, CET, subsídios ou FGTS.
- Internacionalização, temas, SSR, PWA, deploy e CI.
