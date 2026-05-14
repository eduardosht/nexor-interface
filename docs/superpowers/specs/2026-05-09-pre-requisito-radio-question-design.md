# Pre-requisito Radio Question Design

## Contexto

A pagina `/painel/pre-requisito` usa grupos de radio locais simples para escolhas como tipo de documento, menoridade e respostas de triagem odontologica. A imagem de referencia mostra esse padrao com maior hierarquia visual: opcoes em cards para escolhas maiores e botoes compactos alinhados por pergunta para respostas `Nao`/`Sim`.

## Decisao

Extrair o padrao de pergunta com radio para o design system como `RadioQuestionGroup`, mantendo o escopo focado na reutilizacao do controle e na aplicacao inicial da pagina de pre-requisito.

O componente tera dois modos:

- `variant="inline"` para perguntas em linha com opcoes compactas, usado no questionario odontologico e na pergunta de menoridade.
- `variant="cards"` para opcoes maiores com titulo, descricao e icone opcional, usado na escolha `CPF` versus `RNE / estrangeiro`.

## Comportamento

- O componente sera controlado por `value` e `onChange`.
- Cada opcao tera `value`, `label`, `description?`, `icon?` e `disabled?`.
- O grupo tera `name`, `label`, `hint?`, `required?`, `variant?` e `columns?`.
- Inputs nativos `radio` permanecem no DOM para acessibilidade e compatibilidade com testes.
- O estado selecionado tera borda azul, fundo sutil e indicador de radio destacado.
- O estado de foco usa `:focus-within` para deixar a opcao navegavel por teclado.

## Aplicacao em `/painel/pre-requisito`

A pagina passa a importar `RadioQuestionGroup` de `@nexor/design-system` e remove os estilos locais de `RadioGroup` e `RadioLabel` para radios.

Mudancas visuais de pagina ficam limitadas a:

- container mais largo para suportar perguntas em linha;
- cards/secoes com borda para organizar documento, questionario e consentimentos;
- uso do componente novo nos radios existentes;
- preservacao do fluxo, validacoes e payload atual.

Consentimentos, banner de status e demais blocos continuam locais nesta entrega.

## Fora do escopo

- Criar componente de consentimento.
- Criar componente de resumo de pedido.
- Alterar contratos de API, mock de backend ou regras de negocio.
- Mudar dados coletados ou logica de bloqueio por impedimento.

## Testes

- Testar `RadioQuestionGroup` no design system para renderizacao, selecao por clique, estado selecionado e descricao acessivel.
- Ajustar os testes de `PreRequisito` somente quando necessario para refletir a nova apresentacao mantendo o comportamento esperado.
