# Proposal

## Why

Em telas largas, o layout atual empilha formulário e resultados em uma única coluna de 40rem: quem digita não vê o resultado ao lado e precisa rolar entre entrada e saída. Com espaço horizontal disponível, apresentar os dois painéis lado a lado reduz a rolagem e permite conferir entradas e resultados simultaneamente — mantendo o empilhamento atual no celular, onde a largura não comporta duas colunas.

## What Changes

- Em viewports de pelo menos 48rem (768px), o formulário de simulação e o painel de resultados passam a ser exibidos lado a lado, em duas colunas iguais alinhadas pelo topo.
- Em viewports menores que 48rem (celulares), os dois painéis continuam empilhados verticalmente exatamente como hoje.
- Em telas largas, enquanto não houver resultados (entradas inválidas), o formulário ocupa toda a largura disponível — nenhuma coluna vazia ao lado.
- A largura máxima do layout sobe de 40rem para 64rem apenas nas telas largas que exibem as duas colunas.
- Mudança exclusivamente de apresentação: cálculos SAC, parâmetros internos, validações, campos, mensagens e formatação permanecem intocados.
- Mobile-first mantido, CSS puro em `src/styles.css`, zero dependências novas.

## Capabilities

### New Capabilities
Nenhuma. Nenhum capability novo é introduzido.

### Modified Capabilities
- `financing-simulation`: capability existente (`openspec/specs/financing-simulation/`) recebe um **requisito novo de apresentação responsiva** via delta com operação **ADDED** em `specs/financing-simulation/spec.md`. Nenhum requisito existente é modificado, removido ou renomeado — todos os 9 requisitos atuais continuam válidos.

## Impact

- **`src/styles.css`**: nova media query `@media (min-width: 48rem)` com grid de duas colunas para o wrapper dos painéis e `.app` com `max-width: 64rem` nesse breakpoint; a base mobile-first (< 48rem) fica inalterada.
- **`src/App.tsx`**: wrapper estrutural de apresentação (`.main-layout`) em torno de `SimulationForm` e `ResultPanel`. Nenhuma mudança de props, estado, cálculo ou validação.
- **Testes**: nenhum teste existente depende de largura de tela (jsdom não implementa layout); a suíte atual deve continuar verde sem alteração.
- **`index.html`**: já contém a meta viewport (verificado) — sem mudança.
- **Dependências**: nenhuma nova.
- **Compatibilidade**: navegadores modernos com CSS Grid (suporte amplo); sem efeito em APIs ou no deploy estático atual.

## Assumptions

Premissas assumidas e registradas (ajustes finos podem vir de uso real):

- **Breakpoint**: `48rem` (768px) — o menor breakpoint comum que comporta duas colunas de formulário confortáveis; abaixo dele o empilhamento atual é mantido.
- **Colunas iguais**: `1fr 1fr` com espaçamento (gap) entre os painéis e alinhamento pelo topo (`align-items: start`).
- **Largura máxima**: `64rem` em telas largas (duas colunas de ~30rem + espaçamento); nas estreitas, permanece `40rem`.
- **Estado sem resultados**: o formulário sozinho ocupa a largura total da tela larga via CSS (`:only-child`), sem nenhum estado ou lógica nova no React.
- **Espaçamento**: `margin-top` do painel de resultados vira `0` dentro do grid; o espaçamento passa a vir do gap.
