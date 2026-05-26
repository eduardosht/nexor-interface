# Core Components

Está e a arquitetura canonica que futuras interfaces e a futura biblioteca React devem seguir.

## Button

Um componente so.

Props conceituais:

- `variant`: `primary | secondary | ghost`
- `tone`: `default | inverse`
- `size`: `sm | md | lg`
- `fullWidth`: opcional
- `loading`: opcional
- `leadingIcon` e `trailingIcon`: opcionais

Regras:

- `primary` e a ação principal da tela
- `secondary` e a ação de apoio com contorno ou superficie sutil
- `ghost` e a ação leve, sem competir com a principal
- `inverse` existe para uso sobre fundos escuros ou imagens, sem criar `WhiteButton` como componente separado
- não criar `white`, `danger`, `login`, `submit` e similares como componentes paralelos

## Field

Um componente so para entrada de dados.

Props conceituais:

- `as`: `input | select | textarea`
- `label`
- `hint`
- `error`
- `required`
- `leadingIcon` e `trailingIcon`: opcionais

Regras:

- select e textarea não devem ter linguagem visual propria
- campos de página legal ou landing seguem o mesmo campo base
- todo campo obrigatório deve indicar `(*)` na label, legend ou texto principal do controle
- validações de campo devem rodar no `blur` e também no envio como fallback
- erros de validação devem aparecer abaixo do campo correspondente, em vermelho, com texto direto como `Campo obrigatório`
- formulários não devem depender apenas de mensagens genéricas no topo/rodapé para erros de campo
- novos formulários devem usar os componentes base do design system (`Field`, `Select`, `RadioQuestionGroup`, `CheckboxField` ou equivalentes) para manter labels obrigatórias, foco e erro consistentes

## Surface

Um componente so para blocos visuais.

Props conceituais:

- `tone`: `default | subtle | accent`
- `padding`: `sm | md | lg`
- `interactive`: opcional

Regras:

- cards, paineis, caixas-resumo e wrappers devem nascer desta mesma família
- não criar um card totalmente novo para cada seção

## Badge

Um componente so para pequenos rotulos.

Props conceituais:

- `tone`: `neutral | accent | warning | error | success`

Regras:

- chips, tags e pequenos estados devem convergir para está familia

## NavItem

Um componente so para itens acionaveis de navegacao.

Props conceituais:

- `active`
- `compact`
- `icon`
- `badge`

Regras:

- header, sidebar e listas de ação podem variar de contexto, mas devem compartilhar estados e anatomia

## Data Display

Familias minimas:

- `StatCard`
- `Table`
- `EmptyState`
- `StatusBadge`

Regras:

- não multiplicar microcomponentes de dashboard sem necessidade
- tabela e lista responsiva podem ser duas apresentacoes da mesma familia

## Section Shell

Familia para paginas e blocos de conteúdo:

- `PageStack`
- `Section`
- `SectionHeader`
- `SectionTitle`
- `SectionDescription`

Regras:

- landing, dashboards e paginas internas devem usar shells consistentes

## Channels

O design system trabalha com duas dimensoes:

- marca
- canal

Canal oficial atual:

- `painel`

Regra:

- componentes base continuam os mesmos
- o canal pode introduzir patterns e subfamilias especializadas, especialmente para produtividade e administracao
