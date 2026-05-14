# Biteplaner Foundations

Baseado no frontend atual em `project/frontend/biteplaner/`.

## Linguagem visual

- premium
- atletica
- técnica
- confiavel
- contraste alto
- energia controlada, sem excesso de efeitos

## Tokens de marca

### Cor

Paleta canonica:

- `bg.page = #FFFFFF`
- `bg.subtle = #ACD9BB`
- `surface.default = #FFFFFF`
- `surface.subtle = #CDFCDD`
- `surface.strong = #ACD9BB`
- `border.default = #ACD9BB`
- `border.strong = #76B78E`
- `text.default = #1C5E3A`
- `text.muted = #3C7C56`
- `text.soft = #5B9B74`
- `accent.default = #3C7C56`
- `accent.strong = #1C5E3A`
- `accent.mid = #5B9B74`
- `accent.soft = #CDFCDD`
- `accent.support = #76B78E`
- `ink = #1C5E3A`
- `error = #B91C1C`

Regras:

- a paleta oficial de verdes do Biteplaner passa a ser `#CDFCDD`, `#ACD9BB`, `#76B78E`, `#5B9B74`, `#3C7C56` e `#1C5E3A`
- `Button primary` não usa degradê; a hierarquia vem da progressão entre os tons de verde
- fundos escuros heroicos são aceitaveis em landing, mas o sistema base e claro
- azul, laranja e outras cores encontradas em algumas paginas devem ser tratados como acentos contextuais, não como novos sistemas paralelos

### Tipografia

Padrao canonico:

- `font.display = Barlow Condensed`
- `font.body = Inter`

Decisão de padronizacao:

- o codigo atual usa `DM Sans` em alguns portais autenticados
- o design system oficial passa a considerar `Inter` como body unica da marca
- `DM Sans` deve ser tratada como divergencia legada, não como diretriz nova

Escala recomendada:

- `display.hero = clamp(56px, 8vw, 92px)`
- `display.section = clamp(34px, 4vw, 44px)`
- `heading.lg = 28px`
- `heading.md = 22px`
- `body.lg = 16px`
- `body.md = 14px`
- `body.sm = 13px`
- `label = 11px`

### Layout

- `maxWidth = 900px` para conteúdo principal de produto
- areas institucionais de landing podem respirar mais, mas sem virar grid excessivamente largo
- paineis e portais usam densidade moderada e leitura clara

### Radius

- botoes: `4px` ou `6px`
- campos: `6px` ou `8px`
- surfaces: `8px` a `16px`

Padronizacao recomendada:

- `Button = 4px`
- `Field = 8px`
- `Surface = 12px`
- `Badge pill = 999px`

### Motion

- hover por brilho, sombra leve ou leve translateY
- active com escala mínima
- drawer e sidebar com transicoes suaves

## Temas contextuais

O codigo atual tem temas por papel (`client`, `partner`, `dentist`, `lab`, `admin`).

Regra nova:

- isso deve ser tratado como override de acento e contexto, não como design systems independentes
- estrutura, tipografia, espacamento e componente continuam os mesmos
- a futura biblioteca deve aceitar `brand = biteplaner` e `context = client | partner | dentist | lab | admin`

## O que padronizar a partir de agora

- usar um único `Button`
- usar um único `Field`
- usar uma unica familia `Surface`
- reaproveitar shells de página e seção em landing, fluxo autenticado e paineis
