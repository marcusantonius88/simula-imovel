# Design

## Context

Ver `proposal.md` - Why para a motivação. O que condiciona o desenho:

- Repositório novo: só existem `openspec/`, `.clinerules/` e `.cline/`; não há `package.json`, build, lint, testes nem convenções de código a seguir.
- Não há backend nem banco: todo o cálculo roda no navegador, então o domínio precisa ser código puro, sem dependência de framework e testável fora do DOM.
- A fórmula SAC exige taxa de juros mensal e prazo, além do valor financiado. No MVP esses valores não são solicitados ao usuário: vivem em parâmetros internos, e a taxa mensal é derivada da taxa nominal anual configurada.
- Os números exibidos precisam ser reproduzíveis: quem conferir na mão deve chegar ao mesmo resultado mostrado na tela.

## Goals / Non-Goals

**Goals:**

- Concentrar as fórmulas e as regras de validação em um módulo de domínio puro, sem React, coberto por testes unitários.
- Reunir taxa de juros, prazo e limite de comprometimento em um único módulo de parâmetros, injetado nas funções de domínio, para que trocar o produto (taxa, prazo, limite) não exija mexer na lógica de cálculo nem na interface.
- Uma única tela, sem rotas, sem estado global, sem dependência de rede.
- Números formatados em pt-BR e derivados de valores já arredondados, para que a tela seja internamente consistente.
- Ferramental mínimo: Vite + React + TypeScript + Vitest, sem biblioteca de UI, de formulários, de estado ou de CSS.

**Non-Goals:**

- Backend, API, banco de dados, autenticação, persistência (localStorage) ou analytics.
- Campos, seletores ou preferências na interface para taxa de juros, prazo ou limite de comprometimento: no MVP são parâmetros internos.
- Tabela de amortização mês a mês, total de juros pagos ou outros sistemas de amortização (PRICE, SAC com seguros).
- Comparação com regras reais de crédito bancário, CET, subsídios, FGTS ou financiamento em consórcio.
- Internacionalização, temas, SSR, PWA, deploy ou pipeline de CI.

## Decisions

### 1. Vite + React + TypeScript, com Vitest

Escolhido pelo solicitante. Alternativas consideradas: HTML/CSS/JS estáticos sem build (menos ferramental, mas sem tipos nem testes automatizados) e Next.js (traz SSR/roteamento que o MVP não usa). Vite dá dev server com HMR, build estático e Vitest no mesmo arquivo de configuração.

### 2. Domínio puro separado da UI

`src/domain/sac.ts` expõe funções puras e não importa React; os componentes apenas consomem essas funções. Assim a fórmula é testada sem jsdom, e a UI pode mudar sem tocar na regra de negócio. Alternativa: calcular dentro do componente — menos arquivos, mas testes de matemática financeira presos ao render.

Os parâmetros financeiros entram por argumento, com default vindo do módulo de parâmetros (decisão 3): `simulateSac` depende de `SacInput` — apenas o que o usuário informa — mais um `SimulationParameters`. Isso mantém a função pura e determinística e é o que torna a troca de taxa, prazo ou limite um teste de uma linha.

API pública do domínio:

```ts
// src/domain/sac.ts
export interface SacInput {
  propertyValue: number; // R$
  downPayment: number; // R$
  monthlyIncome: number; // R$
}

export interface SacResult {
  financedAmount: number; // R$
  firstInstallment: number; // R$
  lastInstallment: number; // R$
  incomeCommitmentPercent: number; // 0..100
  withinReferenceLimit: boolean; // percentual <= parameters.maxIncomeCommitmentPercent
}

export type SacField = keyof SacInput;
export type SacValidationErrors = Partial<Record<SacField, string>>;

export function validateSacInput(input: SacInput): SacValidationErrors;
export function simulateSac(
  input: SacInput,
  parameters?: SimulationParameters, // default: DEFAULT_SIMULATION_PARAMETERS
): SacResult;
```

`validateSacInput` cobre apenas os três campos do usuário: os parâmetros internos não são entrada de tela.

### 3. Taxa, prazo e limite em um único módulo de parâmetros

`src/domain/parameters.ts` é o único lugar do projeto que contém os números do produto:

```ts
// src/domain/parameters.ts
export interface SimulationParameters {
  annualInterestRate: number; // % ao ano (nominal)
  termMonths: number; // meses
  maxIncomeCommitmentPercent: number; // limite de referência do comprometimento
}

export const DEFAULT_SIMULATION_PARAMETERS: SimulationParameters = {
  annualInterestRate: 10,
  termMonths: 420,
  maxIncomeCommitmentPercent: 30,
};
```

`simulateSac` recebe os parâmetros por argumento, com `DEFAULT_SIMULATION_PARAMETERS` como default, e a tela os exibe como premissas dos resultados (ver specs). Trocar taxa, prazo ou limite é editar este arquivo: nenhuma fórmula, nenhuma assinatura e nenhum campo de tela mudam. A garantia é coberta por um teste que passa um objeto de parâmetros diferente e confere que o resultado muda sem qualquer alteração no código do domínio.

Alternativas consideradas: constantes dentro de `sac.ts` (mistura configuração com lógica e espalha o valor pelos testes), `.env`/variáveis de ambiente (passo de build a mais para valores que não variam por ambiente, e sem tipagem em tempo de compilação) e campos na interface (fora do escopo desta fase — ver Non-Goals).

### 4. Fórmulas do SAC

Com valor financiado `P`, prazo `n` (meses) e taxa mensal `i`:

- Amortização constante: `A = P / n`
- Juros do período: `J_k = saldo devedor inicial do período * i`, com saldo inicial `P` no primeiro período e `A` no último
- Primeira parcela: `P1 = A + P * i = P * (1/n + i)`
- Última parcela: `Pn = A + A * i = (P/n) * (1 + i)`
- Comprometimento da renda: `C = P1 / renda * 100`

No SAC as parcelas decrescem, então a primeira parcela é a maior e é a que define o comprometimento da renda.

Casos de referência (usados também nos testes, com os parâmetros de fábrica): `P = 400.000` (imóvel de `500.000` com entrada de `100.000`), `n = 420`, `i = 10%/12 = 0,8333..%` → `P1 = 4.285,71`, `Pn = 960,32`; com renda de `15.000` → `C = 28,57%` e, com renda de `10.000` → `C = 42,86%`.

### 5. Taxa mensal = taxa nominal anual / 12

`i = annualInterestRate / 100 / 12`. Esta é a convenção adotada pelo SimulaImóvel neste MVP: a taxa configurada é tratada como nominal anual com capitalização mensal, então a taxa mensal da simulação é a taxa anual dividida por 12. É uma premissa do simulador, não uma afirmação sobre o que instituições financeiras praticam — contratos reais podem usar outra convenção, e por isso o resultado é uma estimativa (ver Risks / Trade-offs). Alternativa considerada: taxa efetiva composta, `(1 + a)^(1/12) - 1`, que daria `0,7974%` ao mês em vez de `0,8333%` (primeira parcela de `4.142,04` em vez de `4.285,71`, cerca de 3% menor). A conversão fica isolada em uma única função (`toMonthlyRate`), então trocar de convenção é uma mudança de uma linha mais os números esperados dos testes.

### 6. Arredondamento apenas nos valores exibidos

O cálculo roda em `number` (float64) e cada saída monetária é arredondada para centavos ao final, com arredondamento "meio para cima" (`Math.round` sobre centavos). O comprometimento da renda é calculado a partir da primeira parcela **já arredondada**, para que a tela seja reproduzível na mão a partir dos números mostrados. Alternativas consideradas: aritmética em centavos inteiros (mais precisa, porém exige tratar a taxa como fração e complica cada fórmula) e biblioteca decimal (mais uma dependência, sem ganho perceptível nesta faixa de valores: com `P` até bilhões o erro do float64 fica abaixo de 1 centavo).

### 7. Entradas numéricas com `type="number"`

Os campos usam `<input type="number">`, lidos com `Number(value)` e `""` tratado como ausente. Isso evita a ambiguidade de separadores (`1.234,56` vs `1234.56`) e funciona bem em teclado móvel. Alternativa considerada: input de texto com máscara pt-BR (aceita milhar com ponto, mas exige parsing próprio, validação de digitação e mais testes) — fica como evolução futura. A **saída**, por outro lado, é sempre formatada em pt-BR com `Intl.NumberFormat('pt-BR')`.

### 8. Estado local, cálculo derivado

`App` guarda os três campos como strings em `useState` e deriva `validationErrors` e `result` com `useMemo`. Sem botão "Calcular" e sem estado de "já simulei": a tela mostra resultados assim que as entradas são válidas (ver specs). Sem Redux/Zustand/React Hook Form — não há necessidade em uma tela com três campos.

### 9. Erros de validação em módulo próprio

`validateSacInput` retorna um mapa campo → mensagem (em pt-BR), e a UI só renderiza o que vier preenchido. As mensagens vivem no domínio para que os testes as verifiquem e para que a redação fique em um único lugar. O erro é vinculado ao campo por `aria-describedby` + `role="alert"` (ver specs de acessibilidade).

### 10. CSS puro, mobile-first

`src/styles.css` com layout de coluna única, sem Tailwind, CSS-in-JS ou biblioteca de componentes. Motivo: zero dependências extras e nenhum passo de build adicional; o volume de estilo do MVP é pequeno. Alternativa considerada: CSS Modules (isolamento melhor, porém mais arquivos para pouco CSS).

### 11. Estrutura de arquivos

```
index.html
package.json
tsconfig.json
tsconfig.node.json
vite.config.ts
README.md
src/
  main.tsx
  App.tsx
  App.test.tsx
  styles.css
  domain/
    parameters.ts     # ÚNICO lugar com taxa, prazo e limite de comprometimento
    parameters.test.ts
    sac.ts            # tipos, fórmulas e validação (recebe os parâmetros)
    sac.test.ts
    format.ts         # formatCurrencyBrl, formatPercentBr
    format.test.ts
  components/
    SimulationForm.tsx
    SimulationForm.test.tsx
    ResultPanel.tsx
    ResultPanel.test.tsx
```

`vite.config.ts` configura `@vitejs/plugin-react` e Vitest com `environment: 'jsdom'`, `globals: true`, `restoreMocks: true` e `setupFiles: ['./src/test-setup.ts']`; o setup importa `@testing-library/jest-dom/vitest`, que adiciona as matchers de DOM usadas nos testes de componente.

### 12. Requisitos escritos em pt-BR com as palavras-chave SHALL/MUST

Os specs usam português, mas mantêm `SHALL`/`MUST` em maiúsculas como marcadores normativos, porque é o que o `openspec validate` (inclusive `--strict`) reconhece.

## Risks / Trade-offs

- **Primeira/última parcela não são o valor do contrato** → os números ignoram seguros (MIP/DFI), taxa de administração, tarifas e atualização monetária (TR). Mitigação: requisito de aviso permanente de estimativa na tela e no README, além de rótulos "estimada" nos resultados.
- **Convenção de taxa divergente do banco do usuário** → quem capitaliza de forma composta verá parcelas diferentes. Mitigação: conversão isolada em `toMonthlyRate`, premissa registrada no README e no design.
- **Parâmetros invisíveis na interface** → o usuário não ajusta taxa nem prazo e pode não perceber que o resultado não corresponde à proposta do banco dele. Mitigação: exibir as premissas usadas junto dos resultados (ver specs), documentar no README como alterá-las no único módulo de parâmetros e manter o aviso de que o valor é estimativa.
- **Arredondamento por parcela** → a soma das parcelas não fecha exatamente com o total do contrato em centavos. Mitigação: o MVP exibe apenas primeira e última parcela, e o arredondamento é documentado; uma futura tabela mês a mês exigirá decidir onde alocar o resíduo.
- **Resultado é indicativo, não aprovação de crédito** → nenhuma instituição é consultada, não há verificação de score ou limite real. Mitigação: texto explícito de que o app é uma estimativa e não constitui proposta de crédito.
- **Entrada igual ao valor do imóvel** → não há nada a financiar; é tratado como erro de validação em vez de simulação com parcela zero.
- **Sem persistência** → recarregar a página descarta os dados. Trade-off aceito conscientemente no MVP; se virar problema, `localStorage` é a evolução mais simples.
- **`type="number"` recusa separadores pt-BR** → digitar `500.000,00` num campo numérico nativo não é possível em todos os navegadores. Mitigação: mensagens de validação e a evolução para máscara pt-BR citada nas decisões.
- **Sem CI** → os testes rodam localmente; nada impede um merge com teste vermelho. Fora de escopo por ora, mas é o próximo incremento de infraestrutura.

## Migration Plan

Projeto greenfield: não há dados, contratos ou consumidores a migrar. A entrega é o `npm run build` (artefatos estáticos em `dist/`), publicável em qualquer host de arquivos estáticos. Rollback: revertar o merge do change — nada é compartilhado com outros sistemas. O rollback não afeta dados de usuário, já que não há persistência.

## Open Questions

- Taxa de juros, prazo e limite de comprometimento devem virar campos da interface em uma próxima iteração, permitindo comparar cenários? Hoje são parâmetros internos; expô-los altera o requisito de entrada da tela e, por isso, precisa de uma decisão própria.
- Vale acrescentar total de juros pagos ou a tabela de amortização mês a mês em uma próxima iteração? É aditivo e não muda o que já está especificado aqui.
- Onde publicar o build (GitHub Pages, Vercel, Netlify)? Não altera specs, design nem tarefas deste change.
- O rótulo e a redação final do aviso de estimativa devem passar por revisão jurídica? O texto atual é informativo e pode ser ajustado sem impacto estrutural.


