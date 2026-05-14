# Painel Foundations

## Objetivo

O canal `painel` existe para interfaces de trabalho, não para apresentacao institucional nem landing pública.

Seu foco e:

- produtividade
- clareza operacional
- legibilidade de dados
- previsibilidade
- densidade controlada

## Principios

- Menos teatralidade, mais clareza.
- Interface deve priorizar leitura, comparacao e ação.
- Estados de sistema e status precisam ser mais fortes que em paginas públicas.
- Layout deve suportar volume de informação sem virar ruído.

## Comportamento visual

- usar superfícies mais estruturadas
- usar borda e hierarquia de bloco de forma mais consistente
- reduzir decoracao heroica
- priorizar alinhamento, grids, spacing regular e estados de foco claros

## Tipografia

- display quase não aparece
- body e heading devem dominar
- uppercase deve ser reservado a labels pequenas, filtros e metadados

## Densidade

O canal `painel` aceita densidade maior que landing.

Padroes esperados:

- mais informação por viewport
- paddings menores que secoes públicas
- tabelas, cards de status e filtros mais compactos

## Cor e estado

O canal `painel` pode usar mais semantica de estado:

- sucesso
- alerta
- erro
- pendencia
- inativo

Mas isso deve continuar mapeado pelos tokens da marca base.

## Layout

Familias base do canal:

- `AppShell`
- `Sidebar`
- `Topbar`
- `PageStack`
- `Section`
- `FilterBar`
- `Table`
- `StatGrid`

## Regras de consistencia

- todo painel deve compartilhar shell estrutural semelhante
- filtros devem pertencer a uma familia consistente
- ações pequenas devem usar `ghost` ou `secondary`
- `primary` deve ser reservado a ações principais da tela
