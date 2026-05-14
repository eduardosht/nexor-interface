# Current UI Audit

Este arquivo resume a leitura do codigo atual para orientar a padronizacao.

## Panorama geral

- Nexor está visualmente coeso, mas com poucos tokens e muitos componentes inline por seção.
- Biteplaner ja tem base melhor para design system, mas ainda espalha estilos por paginas, layouts e portais.
- O projeto ainda mistura componentes reutilizaveis reais com variantes locais que deveriam ser apenas props.

## Nexor

Arquivos observados:

- `project/frontend/nexor/src/styles/theme.ts`
- `project/frontend/nexor/src/components/Header.tsx`
- `project/frontend/nexor/src/sections/Hero.tsx`
- `project/frontend/nexor/src/sections/Contato.tsx`

Inconsistencias principais:

- CTA do hero vive em `CtaPrimary` e `CtaSecondary`
- submit do contato vive em `SubmitButton`
- campos do contato vivem dentro da propria seção
- menu do header usa link proprio em vez de familia comum de navegacao

Leitura:

- o institucional precisa de poucas familias de componente
- o problema não e falta de identidade; e falta de consolidacao

## Biteplaner

Arquivos observados:

- `project/frontend/biteplaner/src/styles/theme.ts`
- `project/frontend/biteplaner/src/components/Button.tsx`
- `project/frontend/biteplaner/src/components/Input.tsx`
- `project/frontend/biteplaner/src/components/Header.tsx`
- `project/frontend/biteplaner/src/components/PortalLayout.tsx`
- `project/frontend/biteplaner/src/pages/Landing.tsx`
- `project/frontend/biteplaner/src/pages/OrderLocationSelection.tsx`
- `project/frontend/biteplaner/src/pages/info/PartnersPage.tsx`
- `project/frontend/biteplaner/src/features/portalDashboard/ui.tsx`

Inconsistencias principais:

- existe `Button`, mas header, landing e paginas ainda criam botoes proprios
- existe `Input`, mas varias paginas ainda definem seus proprios inputs e selects
- o tema principal usa `Inter`, mas temas contextuais usam `DM Sans`
- landing pública, fluxo de pedido e portais evoluiram com familias visuais proximas, mas não consolidadas
- `PortalLayout` e `AdminLayout` repetem elementos de shell

Leitura:

- `Button.tsx`, `Input.tsx` e `features/portalDashboard/ui.tsx` devem ser o ponto de partida da futura biblioteca
- o principal ganho agora não e inventar mais componentes, e convergir o que ja existe

## Decisões desta versão do design system

- 3 variantes oficiais de botão: `primary`, `secondary`, `ghost`
- um único `Field` para input, select e textarea
- uma unica familia `Surface`
- um único corpo tipografico por marca
- temas por papel no Biteplaner existem, mas são contexto, não novos design systems
