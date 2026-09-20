# Tasks

## 1. Setup do projeto

- [x] 1.1 Criar a base Vite + React + TypeScript (`package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `.gitignore` com `node_modules/` e `dist/`) e verificar que `npm install` termina sem erros
- [x] 1.2 Adicionar os scripts `dev`, `build`, `preview`, `test`, `test:run` e `typecheck` (`tsc --noEmit`) ao `package.json` e verificar que `npm run typecheck` passa
- [x] 1.3 Adicionar as dependências de teste (`vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`), criar `src/test-setup.ts` importando `@testing-library/jest-dom/vitest`, configurar `test` no `vite.config.ts` (ambiente `jsdom`, `globals`, `restoreMocks`, `setupFiles: ['./src/test-setup.ts']`) e habilitar os tipos do Vitest no `tsconfig.json`; verificar com um teste trivial que `npm run test:run` passa

## 2. Domínio SAC (`src/domain`)

- [x] 2.1 Criar `src/domain/parameters.ts` com a interface `SimulationParameters` (taxa nominal anual, prazo em meses e limite de comprometimento) e a constante `DEFAULT_SIMULATION_PARAMETERS` valendo `10`, `420` e `30`, além de `src/domain/sac.ts` com os tipos `SacInput` (apenas valor do imóvel, entrada e renda mensal), `SacResult`, `SacValidationErrors` e o helper `toMonthlyRate` (taxa nominal anual / 12); verificar com `npm run typecheck` e com `src/domain/parameters.test.ts` conferindo os valores de fábrica e que `grep -rn "420" src/` só aponta `parameters.ts` e os testes
- [x] 2.2 Implementar `simulateSac(input, parameters = DEFAULT_SIMULATION_PARAMETERS)` com valor financiado (`imóvel - entrada`), primeira parcela `P * (1/n + i)` e última parcela `(P/n) * (1 + i)`, arredondando cada saída para centavos; verificar com teste unitário do caso de referência (`imóvel 500.000`, `entrada 100.000`, parâmetros de fábrica → `R$ 4.285,71` e `R$ 960,32`)
- [x] 2.3 Implementar o comprometimento da renda (primeira parcela arredondada ÷ renda × 100) e o campo `withinReferenceLimit` (`percentual <= parameters.maxIncomeCommitmentPercent`); verificar com teste do caso `renda = 15.000` → `28,57%` e `withinReferenceLimit = true` e do caso `renda = 10.000` → `42,86%` e `withinReferenceLimit = false`
- [x] 2.4 Implementar `validateSacInput` sobre os três campos do usuário, com uma mensagem em pt-BR por campo inválido (imóvel ≤ 0 ou ausente; entrada negativa ou ≥ imóvel; renda ≤ 0 ou ausente); verificar com testes cobrindo cada regra, incluindo o caso válido que retorna objeto sem chaves
- [x] 2.5 Cobrir as bordas em testes com parâmetros injetados: entrada zero (financiado = valor do imóvel), taxa `0%` (primeira = última = financiado ÷ prazo), prazo de 1 mês e garantia de que a última parcela é menor que a primeira quando a taxa é maior que zero; verificar com `npm run test:run`
- [x] 2.6 Verificar que trocar os parâmetros não exige tocar no domínio: teste que passa `{ annualInterestRate: 12, termMonths: 240, maxIncomeCommitmentPercent: 30 }` e confere `R$ 5.666,67` e `R$ 1.683,33`, e outro que reduz o limite para `20` e confere `withinReferenceLimit = false` para o caso de referência; verificar com `npm run test:run`
- [x] 2.7 Criar `src/domain/format.ts` com `formatCurrencyBrl` (`R$ 1.234,56`) e `formatPercentBr` (`28,57%`) usando `Intl.NumberFormat('pt-BR')`; verificar com testes de milhar, centavos e percentual

## 3. Interface

- [x] 3.1 Criar `src/components/SimulationForm.tsx` com apenas os três campos (valor do imóvel, valor da entrada e renda bruta mensal) em `<input type="number">`, rótulos associados (`label htmlFor`/`id`) e mensagens de erro em `role="alert"` ligadas ao campo por `aria-describedby`; verificar com teste de renderização inicial (campos vazios), de exibição das mensagens recebidas por props e de ausência de controles de taxa de juros, prazo ou limite de comprometimento (a tela expõe exatamente três campos)
- [x] 3.2 Criar `src/components/ResultPanel.tsx` exibindo valor financiado, primeira parcela, última parcela e comprometimento formatados, as premissas usadas (taxa nominal anual, prazo em meses e limite de referência), o indicador de dentro/acima do limite e o aviso permanente de estimativa, com a região de resultados em `aria-live="polite"`; verificar com teste que usa props conhecidas e confere os quatro textos formatados, as premissas e o indicador
- [x] 3.3 Ligar tudo em `src/App.tsx` com `useState` para os três campos (strings) e `useMemo` para `validationErrors` e `result`, calculando automaticamente a cada digitação com os parâmetros internos e só renderizando o `ResultPanel` quando não houver erros; verificar com `src/App.test.tsx` digitando `500000`, `100000`, `15000` e conferindo `R$ 400.000,00`, `R$ 4.285,71`, `R$ 960,32` e `28,57%`
- [x] 3.4 Verificar em `src/App.test.tsx` que campo vazio ou inválido mostra a mensagem correspondente e nenhum resultado, e que corrigir o valor faz a mensagem desaparecer e os resultados aparecerem
- [x] 3.5 Estilizar a tela em `src/styles.css` (coluna única, mobile-first, com bloco de aviso e destaque do indicador de limite) e verificar com `npm run build` que o CSS é gerado sem avisos de build

## 4. Verificação e documentação

- [x] 4.1 Escrever `README.md` com objetivo, premissas de cálculo (taxa nominal/12, parâmetros internos de 10% a.a. e 420 meses com o caminho de onde alterá-los em `src/domain/parameters.ts`, arredondamento em centavos, valores sem seguros/tarifas/TR), fórmulas SAC, comandos (`npm install`, `npm run dev`, `npm run test:run`, `npm run build`) e escopo fora do MVP; verificar lendo o arquivo renderizado
- [x] 4.2 Rodar `npm run typecheck`, `npm run test:run` e `npm run build` na raiz e confirmar que os três terminam com sucesso
- [x] 4.3 Rodar `npm run preview` e conferir manualmente o caso de referência (`500000` / `100000` / `15000`) exibindo financiado `R$ 400.000,00`, primeira parcela `R$ 4.285,71`, última parcela `R$ 960,32`, comprometimento `28,57%` e as premissas de 10% a.a. e 420 meses
- [x] 4.4 Conferir no DevTools (aba Network) que a aplicação não faz requisições além dos próprios assets estáticos, que nenhum dado informado vai para a rede e que recarregar a página volta os campos ao estado inicial
- [x] 4.5 Rodar `openspec validate add-sac-financing-simulator --strict` e confirmar que a saída é `is valid`
