# Spec Delta

## ADDED Requirements

### Requirement: Layout responsivo da tela principal

O sistema SHALL apresentar o formulário de simulação e o painel de resultados lado a lado em duas colunas quando a largura da viewport for de pelo menos 48rem, e SHALL mantê-los empilhados verticalmente em viewports mais estreitas, sem alterar campos, validações, cálculos, formatações ou qualquer comportamento existente da simulação.

#### Scenario: Painéis lado a lado em tela larga

- **WHEN** a largura da viewport é de pelo menos 48rem e há resultados exibidos
- **THEN** o formulário e o painel de resultados ocupam colunas lado a lado, alinhados pelo topo

#### Scenario: Empilhamento vertical em tela estreita

- **WHEN** a largura da viewport é menor que 48rem
- **THEN** o formulário e o painel de resultados permanecem empilhados verticalmente, como atualmente

#### Scenario: Formulário sozinho em tela larga

- **WHEN** a largura da viewport é de pelo menos 48rem e nenhuma entrada é válida
- **THEN** o formulário ocupa toda a largura disponível, sem coluna vazia ao lado

#### Scenario: Comportamento inalterado em qualquer largura

- **WHEN** o usuário usa a simulação em qualquer largura de viewport
- **THEN** campos, validações, mensagens, cálculos e formatações são idênticos aos já especificados nos demais requisitos
