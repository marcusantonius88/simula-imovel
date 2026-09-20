# Proposal

## Why

Quem vai financiar um imóvel precisa saber, antes de falar com o banco, quanto sobra para pagar de parcela todo mês. Hoje o projeto não tem nenhuma forma de estimar isso. O SimulaImóvel resolve isso com um cálculo SAC transparente, rodando inteiramente no navegador, sem depender de nenhum sistema bancário.

## What Changes

- Criar do zero um projeto front-end (Vite + React + TypeScript) neste repositório, que hoje contém apenas o scaffolding de `openspec/`.
- Criar uma tela única de simulação que solicita apenas três dados: valor do imóvel, valor da entrada e renda bruta mensal.
- Manter taxa de juros, prazo e limite de comprometimento como parâmetros internos, reunidos em um único módulo de configuração: taxa nominal de 10% a.a., prazo de 420 meses e limite de referência de 30% da renda. Alterar esses valores exige editar apenas esse módulo — nem a lógica de cálculo nem a interface mudam.
- Calcular no navegador o valor financiado, a primeira parcela (SAC), a última parcela (SAC) e o percentual de comprometimento da renda.
- Apresentar os resultados formatados em pt-BR (`R$ 1.234,56` e `28,57%`), junto das premissas usadas na simulação (taxa nominal anual, prazo e limite de referência), com indicação de dentro/acima do limite de 30% da renda e aviso de que os valores são estimativas.
- Validar os três campos no cliente, com mensagens em pt-BR, e só exibir resultados quando todas as entradas forem válidas.
- Não usar backend, banco de dados ou persistência: o cálculo é 100% local e nenhum dado do usuário sai do navegador.
- Cobrir a fórmula SAC e o fluxo de formulário/resultado com testes automatizados.
- Sem alterações de compatibilidade: não existe código anterior a ser quebrado (projeto greenfield).

## Capabilities

### New Capabilities
- `financing-simulation`: contrato de comportamento do simulador de financiamento habitacional pelo sistema SAC — entradas aceitas, validações com mensagens em pt-BR, cálculo do valor financiado, das parcelas (primeira e última) e do comprometimento da renda, e apresentação dos resultados.

### Modified Capabilities
Nenhuma. `openspec/specs/` está vazio: este é o primeiro capability do projeto.

## Impact

- **Novos arquivos**: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/**` (domínio, componentes, estilos), testes e `README.md`.
- **Configuração central**: `src/domain/parameters.ts` é o único lugar que define taxa de juros, prazo e limite de comprometimento — nenhum outro arquivo repete esses valores.
- **Dependências de runtime**: `react`, `react-dom`.
- **Dependências de desenvolvimento**: `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.
- **APIs / serviços / dados**: nenhum. Sem chamadas de rede, sem backend, sem banco, sem telemetria.
- **Entrega**: build estático (`npm run build`) servível em qualquer host de arquivos estáticos. Nenhuma configuração de deploy faz parte deste change.
- **Compatibilidade**: navegadores modernos (últimas versões de Chrome, Firefox, Safari e Edge). Sem requisito de SSR, SEO ou suporte a navegadores legados.

## Assumptions

Premissas do planejamento:

- **Stack**: Vite + TypeScript + React, com Vitest para testes.
- **Taxa de juros e prazo são parâmetros internos**: a tela não os solicita ao usuário. Ficam em um único módulo de parâmetros (`src/domain/parameters.ts`) com taxa nominal de 10% a.a. e prazo de 420 meses, e são injetados nas funções de domínio; mudar os valores é editar esse módulo, sem alterar a lógica de cálculo nem a interface.
- **Taxa mensal**: obtida pela taxa nominal anual dividida por 12.
- **Limite de referência de comprometimento**: 30% da renda bruta mensal, definido no mesmo módulo de parâmetros e usado apenas como indicador visual — o app não aprova crédito.
- **Idioma**: interface, mensagens e formatação em pt-BR, sem internacionalização nesta fase.
- **Sem persistência**: recarregar a página limpa os dados informados.
