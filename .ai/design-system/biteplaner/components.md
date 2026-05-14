# Biteplaner Components

## Button

Componente oficial: `Button`.

### Primary

Uso:

- compra
- continuar fluxo
- criar entidade
- confirmar passo principal

Visual:

- gradiente verde permitido
- texto branco
- fonte `display`
- uppercase
- radius `4px`

### Secondary

Uso:

- ação de apoio
- retorno menos prioritario
- alternativa segura ao primary

Visual:

- fundo verde bem suave
- texto `accent.default`
- borda de acento sutil

### Ghost

Uso:

- ação leve
- filtros simples
- pequenas ações inline

Visual:

- transparente
- texto `text.muted`
- hover com fundo `surface.subtle`

### Regras

- `LoginLink`, `MobileLoginLink`, `WhiteButton`, `FormSubmitBtn` e similares não são novas categorias de botão
- eles devem convergir para a familia `Button`

## Field

Componente oficial: `Field`.

Variacoes:

- `input`
- `select`
- `textarea`

Uso:

- onboarding
- login
- resumo do pedido
- busca e filtro
- formulários de contato

Visual:

- fundo `surface.default` ou `surface.subtle`
- borda `border.default`
- label pequena
- erro com `errorBg` e `errorBorder`
- focus com `accent.strong`

### Regras

- `Input.tsx` ja existe e deve virar a base
- campos inline em `Landing.tsx`, `OrderLocationSelection.tsx` e outras paginas devem convergir para essa base

## Surface

Componente oficial: `Surface`.

Variacoes:

- `default`
- `subtle`
- `interactive`
- `accent`

Uso:

- cards de seleção
- paineis lateráis
- widgets de dashboard
- blocos de resumo
- tabelas e estados vazios

Visual:

- fundo claro
- borda sutil
- sombra leve
- hover opcional em casos interativos

## Badge

Componente oficial: `Badge`.

Variacoes:

- `neutral`
- `accent`
- `warning`
- `error`
- `success`

Uso:

- status pequenos
- cidade
- categorias
- metadados de dashboard

## StatusBadge

Componente oficial para estados textuais com ponto ou indicador.

Uso:

- pedidos
- parceiros
- perfis
- etapas da jornada

## Navigation

### Header

Regras:

- mesma linguagem entre desktop e mobile
- CTA do topo deve ser uma aplicacao do `Button`, não componente paralelo
- links do menu usam familia `NavItem`

### Sidebar

Regras:

- `PortalLayout` e `AdminLayout` devem convergir para a mesma anatomia
- itens ativos usam `accent.soft`
- icones de ação usam familia `IconButton`

Observacao:

- todo `PortalLayout`, `AdminLayout` ou tela de dashboard também deve seguir o canal `.ai/design-system/painel/`

## Data Display

Familias recomendadas:

- `StatCard`
- `Table`
- `Section`
- `EmptyState`
- `Chart`

Regras:

- `features/portalDashboard/ui.tsx` ja e um bom embriao da futura biblioteca
- o que estiver disperso em paginas admin e portais deve convergir para essas familias

## Section Shell

Landing e paginas públicas devem compartilhar:

- `Section`
- `SectionInner`
- `Eyebrow`
- `SectionTitle`
- `SectionText`
- `SectionActions`

Regras:

- sections de landing não devem criar microtipografias novas a cada bloco
- o hero pode ser mais expressivo, mas continua dentro da mesma familia

## Desvios atuais a corrigir

- `Header.tsx` define CTA e links com estilos proprios fora de `Button`
- `Landing.tsx` tem `GhostLink` e `FormSubmitBtn` locais
- `PartnersPage.tsx` cria `WhiteButton` isolado
- `OrderLocationSelection.tsx` cria `Input` e `Select` locais
- `PortalLayout.tsx`, `AdminLayout.tsx` e paginas de portal repetem botoes de icone e surfaces
- `features/portalDashboard/ui.tsx` ja tem blocos maduros, mas ainda em paralelo ao restánte do app
