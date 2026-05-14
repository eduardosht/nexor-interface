# Painel Components

## Shell

Familias obrigatorias do canal:

- `AppShell`
- `Sidebar`
- `Topbar`
- `ContentArea`
- `PageHeader`

Regras:

- paineis diferentes não devem reinventar shell
- Nexor e Biteplaner podem variar tokens, mas compartilham anatomia

## Navigation

### Sidebar

Uso:

- modulos
- agrupamentos
- badges
- estados ativos

Regras:

- item ativo precisa ser imediatamente distinguivel
- grupos devem ser claros
- estado colapsado deve continuar usavel

### Topbar

Uso:

- contexto da tela
- ações globais
- notificacoes
- usuário autenticado

Regras:

- evitar competir com o conteúdo
- priorizar funcionalidade

## Data Display

Familias principais:

- `StatCard`
- `StatusBadge`
- `Table`
- `EmptyState`
- `InfoCard`
- `FieldGrid`
- `Chart`

Regras:

- cards de metrica devem parecer da mesma familia
- tabela e lista devem derivar do mesmo sistema de celula e header
- estados vazios precisam ser discretos e claros

## Filters

Familias principais:

- `FilterBar`
- `FilterButton`
- `SearchField`
- `DateRange`
- `SelectField`

Regras:

- filtros não devem virar uma colecao de mini componentes diferentes por tela
- filtros ativos precisam ser visiveis

## Actions

Uso recomendado de botoes no canal:

- `primary`: salvar, confirmar, criar, concluir etapa principal
- `secondary`: editar, revisar, aplicar, ver detalhe
- `ghost`: cancelar, fechar, limpar, ação secundaria leve

### IconButton

`IconButton` e uma familia do canal `painel`, não da camada pública.

Uso:

- ações compactas em tabela
- notificação
- expandir/recolher
- configurações locais

Regras:

- deve manter mesma linguagem em sidebars, headers e tabelas

## Forms

O canal `painel` usa o mesmo `Field` base da lib, com aplicacoes mais densas.

Patterns:

- formulários em section
- edicao inline controlada
- grids de campos
- filtros compactos

## Divergencias atuais do projeto

No estado atual, o canal `painel` ja aparece espalhado em:

- `PortalLayout`
- `AdminLayout`
- `features/portalDashboard/ui.tsx`
- paginas admin e portais do Biteplaner

Esses pontos devem convergir para uma familia unica do canal `painel`.
