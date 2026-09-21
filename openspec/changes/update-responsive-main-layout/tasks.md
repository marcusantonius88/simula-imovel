# Tasks

## 1. Layout responsivo (apresentação)

- [ ] 1.1 Envolver `SimulationForm` e `ResultPanel` em `<div className="main-layout">` em `src/App.tsx`, sem alterar props, estado ou lógica; verificar com `npm run typecheck`
- [ ] 1.2 Adicionar em `src/styles.css` a media query `@media (min-width: 48rem)` com `.main-layout` em grid (`grid-template-columns: 1fr 1fr`, `gap: 1.5rem`, `align-items: start`), a regra `.main-layout > :only-child { grid-column: 1 / -1; }` e `.results { margin-top: 0 }`, mantendo a base mobile (< 48rem) inalterada; verificar com `npm run build` sem avisos
- [ ] 1.3 Ajustar `.app` para `max-width: 64rem` dentro do breakpoint de 48rem (mantendo 40rem nas telas estreitas); verificar que o CSS gerado em `dist/assets/` contém a media query de 48rem
- [ ] 1.4 Verificação de integração: rodar `npm run typecheck`, `npm run test:run` e `npm run build` e confirmar que os três terminam verdes sem editar nenhum teste existente

## 2. Conferência manual

- [ ] 2.1 Conferir no navegador (toolbar de dispositivos do DevTools): em 375px, formulário e resultados empilhados verticalmente como hoje; em 768px e 1280px com entradas válidas, painéis lado a lado alinhados pelo topo; em 768px ou mais sem entradas válidas, formulário ocupando toda a largura sem coluna vazia
- [ ] 2.2 Confirmar na mesma conferência manual que o comportamento não mudou: validações e mensagens por campo, formatação pt-BR e caso de referência (`500000`/`100000`/`15000` → `R$ 400.000,00`, `R$ 4.285,71`, `R$ 960,32`, `28,57%`) idênticos em qualquer largura
