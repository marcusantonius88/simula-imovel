# financing-simulation Specification

## Purpose

Define o contrato observável do SimulaImóvel: os três dados que o usuário informa (valor do imóvel, valor da entrada e renda bruta mensal), como o sistema os valida e quais números ele apresenta sobre um financiamento habitacional pelo sistema SAC, a partir de parâmetros internos de taxa de juros, prazo e limite de comprometimento.

## Requirements

### Requirement: Entrada de dados da simulação

O sistema SHALL oferecer uma tela única de simulação que solicita apenas o valor do imóvel, o valor da entrada e a renda bruta mensal, todos editáveis pelo usuário.

#### Scenario: Tela inicial

- **WHEN** a aplicação é carregada pela primeira vez
- **THEN** os campos de valor do imóvel, valor da entrada e renda bruta mensal estão visíveis, editáveis e vazios

#### Scenario: Taxa, prazo e limite fora da interface

- **WHEN** a tela de simulação é exibida
- **THEN** não existe nenhum campo, seletor ou controle editável de taxa de juros, prazo em meses ou limite de comprometimento de renda

#### Scenario: Alteração de um campo

- **WHEN** o usuário edita o valor de qualquer um dos três campos
- **THEN** o campo passa a exibir o valor digitado e mantém os demais campos inalterados

### Requirement: Parâmetros internos da simulação

O sistema SHALL usar taxa nominal de 10% ao ano, prazo de 420 meses e limite de referência de comprometimento de 30% da renda, definidos em um único módulo de parâmetros internos, sem solicitá-los ao usuário e sem repeti-los na lógica de cálculo.

#### Scenario: Cálculo a partir dos parâmetros de fábrica

- **WHEN** qualquer simulação é executada sem parâmetros sobrescritos
- **THEN** o cálculo usa taxa nominal de 10% ao ano (0,8333..% ao mês), prazo de 420 meses e limite de referência de 30% da renda

#### Scenario: Troca dos parâmetros sem alterar a lógica

- **WHEN** os parâmetros internos são substituídos por outros valores, como taxa de 12% ao ano e prazo de 240 meses
- **THEN** os resultados passam a refletir os novos valores
- **AND** a lógica de cálculo permanece a mesma, sem campos novos na interface

### Requirement: Cálculo do valor financiado

O sistema SHALL calcular o valor financiado como o valor do imóvel menos o valor da entrada.

#### Scenario: Cálculo com entrada parcial

- **WHEN** o valor do imóvel é R$ 500.000,00 e a entrada é R$ 100.000,00
- **THEN** o valor financiado exibido é R$ 400.000,00

#### Scenario: Cálculo sem entrada

- **WHEN** o valor da entrada é zero
- **THEN** o valor financiado é igual ao valor do imóvel

### Requirement: Cálculo das parcelas no sistema SAC

O sistema SHALL calcular a primeira e a última parcela pelo sistema SAC, com amortização constante e juros mensais incidentes sobre o saldo devedor, usando taxa mensal igual à taxa nominal anual configurada dividida por 12.

#### Scenario: Parcelas do caso de referência

- **WHEN** o valor do imóvel é R$ 500.000,00, a entrada é R$ 100.000,00 e são usados os parâmetros internos de fábrica
- **THEN** a primeira parcela exibida é R$ 4.285,71
- **AND** a última parcela exibida é R$ 960,32

#### Scenario: Parcelas decrescentes

- **WHEN** a taxa nominal anual configurada é maior que zero e o prazo é de mais de um mês
- **THEN** a última parcela é menor que a primeira parcela

#### Scenario: Taxa de juros zero

- **WHEN** a taxa nominal anual configurada é 0%
- **THEN** a primeira e a última parcela têm o mesmo valor, igual ao valor financiado dividido pelo prazo

### Requirement: Comprometimento da renda

O sistema SHALL calcular o percentual de comprometimento da renda dividindo a primeira parcela pela renda bruta mensal informada.

#### Scenario: Percentual do caso de referência

- **WHEN** a primeira parcela é R$ 4.285,71 e a renda bruta mensal é R$ 15.000,00
- **THEN** o comprometimento da renda exibido é 28,57%

#### Scenario: Comprometimento dentro do limite de referência

- **WHEN** o comprometimento da renda é menor ou igual a 30%
- **THEN** o sistema indica que a parcela está dentro do limite de referência de 30% da renda

#### Scenario: Comprometimento acima do limite de referência

- **WHEN** a primeira parcela é R$ 4.285,71 e a renda bruta mensal é R$ 10.000,00
- **THEN** o comprometimento da renda exibido é 42,86%
- **AND** o sistema indica que a parcela está acima do limite de referência de 30% da renda

### Requirement: Validação das entradas

O sistema SHALL validar as três entradas do usuário antes de calcular e MUST bloquear a exibição de resultados enquanto houver valor inválido, apresentando uma mensagem em português associada ao campo inválido.

#### Scenario: Valor do imóvel inválido

- **WHEN** o valor do imóvel está vazio, é zero ou é negativo
- **THEN** o sistema exibe a mensagem de que o valor do imóvel deve ser maior que zero
- **AND** nenhum resultado de simulação é exibido

#### Scenario: Entrada inválida

- **WHEN** o valor da entrada é negativo ou maior ou igual ao valor do imóvel
- **THEN** o sistema exibe a mensagem de que a entrada não pode ser negativa e deve ser menor que o valor do imóvel
- **AND** nenhum resultado de simulação é exibido

#### Scenario: Renda bruta mensal inválida

- **WHEN** a renda bruta mensal está vazia, é zero ou é negativa
- **THEN** o sistema exibe a mensagem de que a renda bruta mensal deve ser maior que zero
- **AND** nenhum resultado de simulação é exibido

#### Scenario: Entradas válidas

- **WHEN** todos os campos são preenchidos com valores válidos
- **THEN** as mensagens de erro desaparecem e os resultados da simulação são exibidos

### Requirement: Apresentação dos resultados

O sistema SHALL apresentar valor financiado, primeira parcela, última parcela e comprometimento da renda formatados em pt-BR com duas casas decimais, SHALL informar as premissas usadas na simulação (taxa nominal anual, prazo em meses e limite de referência) e SHALL avisar que os valores são estimativas que não incluem seguros, taxas administrativas, atualização monetária (TR) ou outras condições específicas da instituição financeira.

#### Scenario: Formatação dos resultados

- **WHEN** os resultados são exibidos
- **THEN** os valores monetários usam o formato `R$ 0.000,00`, com separador de milhar `.` e decimal `,`
- **AND** o comprometimento da renda usa o formato `0,00%`

#### Scenario: Premissas visíveis

- **WHEN** os resultados são exibidos
- **THEN** a tela informa a taxa nominal anual, o prazo em meses e o limite de referência de comprometimento usados na simulação

#### Scenario: Recálculo automático

- **WHEN** o usuário altera qualquer campo e as entradas continuam válidas
- **THEN** os resultados são recalculados e atualizados sem exigir clique em botão de calcular

#### Scenario: Aviso de estimativa

- **WHEN** os resultados são exibidos
- **THEN** a tela mostra um aviso permanente de que os valores são estimativas e não incluem seguros, taxas administrativas, atualização monetária (TR) ou outras condições específicas da instituição financeira

### Requirement: Acessibilidade do formulário

O sistema SHALL associar cada campo ao seu rótulo e SHALL anunciar mensagens de validação e resultados a tecnologias assistivas.

#### Scenario: Mensagem de erro associada ao campo

- **WHEN** uma entrada é inválida
- **THEN** a mensagem de erro é anunciada e está vinculada programaticamente ao campo que a originou

#### Scenario: Resultado anunciado

- **WHEN** os resultados são recalculados
- **THEN** a região de resultados é anunciada a leitores de tela sem mover o foco do campo em edição

### Requirement: Execução local sem backend

O sistema SHALL executar todo o cálculo no navegador, sem enviar dados informados pelo usuário para nenhum servidor e sem persistir dados entre sessões.

#### Scenario: Nenhuma chamada de rede de dados

- **WHEN** o usuário informa dados e recebe os resultados
- **THEN** a aplicação não realiza requisições de rede com os dados informados, nem para cálculo, nem para armazenamento

#### Scenario: Recarga da página

- **WHEN** o usuário recarrega a página após uma simulação
- **THEN** os campos voltam ao estado inicial, sem dados recuperados de armazenamento local ou de servidor

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
