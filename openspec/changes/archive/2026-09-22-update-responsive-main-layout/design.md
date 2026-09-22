# Design

## Context

Ver `proposal.md` - Why para a motivação. O que condiciona o desenho:

- Hoje o app é coluna única: `.app` com `max-width: 40rem`, `.simulation-form` e `.results` como irmãos diretos de `.app`, `.results` com `margin-top: 1.5rem` e uma única media query (`30rem`, só padding) — verificado em `src/styles.css`.
- O main spec `financing-simulation` não trata de arranjo de layout: o requisito adicionado por este change é comportamento novo e observável (ver delta).
- jsdom não implementa layout: media queries não são verificáveis na suíte Vitest atual, então a verificação combinada será inspeção do CSS, build e conferência manual em larguras de referência.
- `index.html` já possui a meta viewport — nada a fazer lá.

## Goals / Non-Goals

**Goals:**

- Formulário e painel de resultados lado a lado (duas colunas iguais, alinhadas pelo topo) em viewports de pelo menos 48rem; empilhados abaixo disso.
- Formulário sozinho ocupando a largura total em tela larga quando não há resultados, sem coluna vazia.
- Largura máxima de 64rem nas telas largas; base mobile-first (< 48rem) inalterada.
- Zero mudança de comportamento: a suíte atual deve continuar verde sem editar nenhum teste.

**Non-Goals:**

- Redesign visual (cores, tipografia, componentes novos) ou segundos breakpoints.
- Painel de resultados fixo/sticky, abas, acordeões ou qualquer navegação.
- Detecção de viewport em JavaScript (`matchMedia`), CSS-in-JS ou bibliotecas de layout.
- Alterar requisitos existentes do main spec (nenhum MODIFIED/REMOVED/RENAMED).

## Decisions

### 1. Breakpoint único `min-width: 48rem` (768px)

Mobile-first: a base é o layout atual; a media query só adiciona o arranjo de duas colunas. Alternativas consideradas: `40rem` (duas colunas de ~18rem, apertadas para inputs) e `64rem` (só desktop; tablets em pé perderiam o ganho). Em 768px as colunas ficam com ~21,5rem cada — confortável para os inputs atuais.

### 2. Grid em um wrapper dedicado (`.main-layout`) em torno de form e resultados

`App.tsx` passa a envolver `SimulationForm` e `ResultPanel` em `<div className="main-layout">`, e a media query aplica `display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start;`. Alternativa rejeitada: aplicar o grid direto em `.app` — `h1` e a intro precisariam de span explícito de coluna, acoplando todo o markup à regra de layout. Flexbox também funcionaria, mas grid expressa "duas colunas com align-start" em menos regras; float foi descartado por ser legado e frágil.

### 3. Estado "sem resultados" resolvido em CSS com `:only-child`

`.main-layout > :only-child { grid-column: 1 / -1; }` faz o formulário ocupar a largura total quando é o único filho (não há resultados), sem coluna vazia. Alternativa considerada: classe condicional no React (`hasResults ? 'main-layout--split' : ...`) — rejeitada porque acoplaria lógica de exibição ao componente para algo que o CSS resolve, violando o "apenas apresentação" do proposal.

### 4. `.app` com `max-width: 64rem` dentro do breakpoint

Duas colunas de ~30rem + espaçamento. Alternativas: manter 40rem (colunas de ~18,5rem) e 72rem (painéis largos com muito espaço vazio). Nas telas estreitas, 40rem permanece.

### 5. `margin-top: 0` no `.results` dentro do breakpoint

O espaçamento passa a vir do `gap` do grid, que separa as colunas; manter a margem desalinharia o topo dos painéis com `align-items: start`. Abaixo de 48rem a margem atual permanece.

### 6. Componentes intocados

`SimulationForm` e `ResultPanel` mantêm classes, props e semântica (inclusive `aria-live`/region). Nenhuma prop nova, nenhum estado novo, nenhum teste editado.

### 7. Verificação em três camadas

(a) `npm run typecheck` + `npm run test:run` + `npm run build` todos verdes sem editar testes; (b) inspeção do CSS gerado (`dist/assets/*.css`) contendo a media query de 48rem; (c) conferência manual com a toolbar de dispositivos em 375px (empilhado), 768px (lado a lado com resultados e formulário full-width sem resultados) e 1280px.

## Risks / Trade-offs

- [Colunas de ~21,5rem em 768px podem parecer apertadas] → inputs ocupam a largura do painel; conferência manual em 768px valida; ajuste fino é uma linha de CSS.
- [Mudança do breakpoint no futuro exigiria atualizar o spec] → o cenário cita 48rem; registrado como premissa consciente (ver Open Questions).
- [Wrapper extra poderia afetar seletores de teste] → os testes usam role/label/texto, não hierarquia de DOM; a task de integração confirma a suíte verde sem edição.
- [Valores longos estourando a coluna] → valores formatados em pt-BR (até centenas de milhões) cabem em ~21rem; conferência manual cobre.
- [Navegadores sem CSS Grid] → fora de escopo: navegadores modernos suportam (mesmo público-alvo do change anterior).

## Migration Plan

Mudança local em dois arquivos (`src/App.tsx` e `src/styles.css`), sem migração de dados, API ou deploy. Entrega pelo build estático atual (`npm run build`). Rollback: reverter os dois arquivos em um único commit — nenhum estado persistido.

## Open Questions

Nenhum bloqueante. Ajuste fino do breakpoint (ex.: 45rem ou 52rem) pode surgir do uso real; como o cenário do spec cita explicitamente 48rem, mudá-lo exige atualizar o requisito — decisão consciente de follow-up, não deste change.
