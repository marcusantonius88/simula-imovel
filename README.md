# 🏠 SimulaImóvel - Simulador de Financiamento Imobiliário

![Frontend: React/TypeScript/Vite](https://img.shields.io/badge/Frontend-React%20%2F%20TypeScript%20%2F%20Vite-3178C6?logo=react&logoColor=white)
![SDD: OpenSpec](https://img.shields.io/badge/SDD-OpenSpec-6E9F18?logo=markdown&logoColor=white)
![Build: NPM](https://img.shields.io/badge/Build-NPM-CB3837?logo=npm&logoColor=white)
![IDE: VSCode com Cline](https://img.shields.io/badge/IDE-VSCode%20com%20Cline-007ACC?logo=cline&logoColor=white)

O SimulaImóvel é uma aplicação web para estimar parcelas de financiamento imobiliário pelo sistema SAC, com foco em uma experiência simples, rápida e transparente para o usuário.

A ideia central é permitir que uma pessoa informe três dados básicos — valor do imóvel, valor da entrada e renda bruta mensal — e receba, no navegador, uma estimativa de financiamento com indicação de comprometimento da renda.

## 🎯 Problema

Muitas pessoas desejam entender rapidamente se uma proposta de compra de imóvel parece viável antes de iniciar contato com uma instituição financeira.

No entanto, a maioria dos simuladores disponíveis exige múltiplos campos, regras complexas ou ainda não deixam claro o impacto real da parcela no orçamento do comprador.

O SimulaImóvel busca responder uma pergunta simples:

- Qual seria a parcela inicial estimada de um financiamento no sistema SAC?
- Qual é o valor financiado?
- Qual é o comprometimento da renda?
- A proposta ficaria dentro de um limite de referência?

## 🚀 MVP

O MVP inclui:

- entrada de valor do imóvel;
- entrada de valor da entrada;
- entrada de renda bruta mensal;
- cálculo do valor financiado;
- cálculo da primeira parcela estimada;
- cálculo da última parcela estimada;
- cálculo do percentual de comprometimento da renda;
- indicação visual de se a parcela está dentro ou acima do limite de referência;
- renderização 100% no navegador, sem backend.

## 🏗️ Arquitetura

A aplicação foi pensada como um front-end leve e previsível, com lógica de negócio separada em camadas bem definidas.

```text
src/
  App.tsx                  # tela principal e estado do formulário
  domain/
    parameters.ts          # parâmetros internos do cálculo
    sac.ts                 # fórmulas SAC e validações
    format.ts              # formatação de moeda e percentual
  components/
    SimulationForm.tsx     # inputs do usuário
    ResultPanel.tsx        # painel com resultados e indicadores
```

A arquitetura foi organizada para manter o cálculo financeiro em um único ponto de responsabilidade, com parâmetros centralizados e sem impacto na interface.

## ⚙️ Stack Tecnológica

### Front-end

- React
- TypeScript
- Vite
- Vitest
- Testing Library

### Cálculo e regras de negócio

- Lógica SAC implementada em TypeScript
- Parâmetros internos em um único arquivo
- Formatação de moeda e percentual em pt-BR

## 🧮 Premissas de Cálculo

As premissas do MVP foram definidas para manter a simulação simples, reproduzível e fácil de entender:

- Taxa mensal = taxa nominal anual ÷ 12.
- Taxa nominal anual interna: 10% a.a.
- Prazo interno: 420 meses
- Limite de referência: 30% da renda
- Arredondamento em centavos, meio para cima, aplicado a cada saída
- O comprometimento da renda é calculado sobre a primeira parcela já arredondada
- Não há persistência; tudo acontece no navegador
- Não incluem seguros, tarifas, TR, taxas administrativas ou outras condições específicas de instituição financeira

### Fórmulas do SAC

Com valor financiado `P`, prazo `n` em meses e taxa mensal `i = anual / 100 / 12`:

| Grandeza | Fórmula |
| --- | --- |
| Amortização constante | `A = P / n` |
| Primeira parcela | `P1 = P × (1 / n + i)` |
| Última parcela | `Pn = (P / n) × (1 + i)` |
| Comprometimento da renda | `C = P1 ÷ renda × 100` |

Exemplo de referência com os parâmetros da fábrica:

- valor do imóvel: 500.000
- entrada: 100.000
- renda: 15.000
- valor financiado: R$ 400.000,00
- primeira parcela: R$ 4.285,71
- última parcela: R$ 960,32
- comprometimento: 28,57% (dentro do limite de 30%)

## 🐳 Ambiente Local

Para rodar o projeto localmente:

```bash
npm install
npm run dev
```

Para executar a suíte de testes:

```bash
npm run test:run
```

Para build de produção:

```bash
npm run build
```

Para pré-visualizar o build:

```bash
npm run preview
```

Para checagem de tipos:

```bash
npm run typecheck
```

## 🤖 Desenvolvimento Assistido por IA

Este projeto foi construído com práticas modernas de desenvolvimento assistido por IA, utilizando uma abordagem estruturada e orientada por especificações.

| Categoria | Utilização |
| --- | --- |
| IDE/Agente | VSCode com Cline |
| Modelo Principal | DeepSeek v4.1-Flash |
| Apoio Estratégico | ChatGPT |
| Metodologia | Spec-Driven Development (SDD) com OpenSpec |

A implementação foi conduzida a partir de especificações formais, seguindo a metodologia SDD com OpenSpec, em que cada funcionalidade foi planejada, documentada e validada antes da execução do código.

### 📋 Especificações do Projeto

As funcionalidades do SimulaImóvel foram organizadas e detalhadas por meio de especificações em [openspec](./openspec), contendo:

- objetivos da funcionalidade;
- regras de negócio;
- critérios de aceitação;
- fluxos de uso;
- checklist de implementação.

Estrutura relevante:

- [openspec/config.yaml](./openspec/config.yaml)
- [openspec/specs/financing-simulation/spec.md](./openspec/specs/financing-simulation/spec.md)
- [openspec/changes](./openspec/changes)

### 📚 Documentação

A documentação do projeto foi usada como base para orientar o desenvolvimento, manter consistência e reduzir ambiguidades na implementação.

Arquivos principais:

- [README.md](./README.md)
- [openspec/config.yaml](./openspec/config.yaml)
- [openspec/specs/financing-simulation/spec.md](./openspec/specs/financing-simulation/spec.md)
- [src/domain/parameters.ts](./src/domain/parameters.ts)
- [src/domain/sac.ts](./src/domain/sac.ts)
- [src/domain/format.ts](./src/domain/format.ts)
- [src/components/SimulationForm.tsx](./src/components/SimulationForm.tsx)
- [src/components/ResultPanel.tsx](./src/components/ResultPanel.tsx)

A IA foi utilizada para apoiar a definição de requisitos, a organização da estrutura do código, o refinamento das regras financeiras, a criação de testes e a revisão da implementação, sempre com validação humana no processo.

## 📋 Roadmap Inicial

### Fundação

- MVP funcional de simulação
- Parâmetros internos centralizados
- Lógica financeira isolada
- Testes automatizados

### Experiência

- ajustes de usabilidade e layout
- melhoria da legibilidade dos resultados
- refinamento do comportamento mobile

### Evolução futura

- comparação com outros sistemas de amortização
- exibição de tabela de amortização por mês
- suporte a cenários com seguros e tarifas
- personalização de parâmetros pelo usuário

## 🔒 Status

Projeto em desenvolvimento como MVP funcional.

A solução atual atende ao objetivo de estimar a parcela e o comprometimento da renda com uma abordagem simples, sem backend e sem persistência de dados.

## 📄 Licença

MIT

## Fora do Escopo do MVP

- backend, banco de dados, autenticação e persistência;
- campos de taxa de juros, prazo ou limite na interface;
- tabela de amortização mês a mês;
- comparação com regras reais de crédito bancário;
- CET, FGTS, subsídios ou outros mecanismos específicos de mercado;
- internacionalização, SSR, PWA e deploy.
