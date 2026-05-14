# Nexor Components

## Button

### Primary

Uso:

- CTA principal de hero
- envio de formulário
- ação principal de seção

Visual:

- fundo `text.default`
- texto `bg.page`
- radius `4px`
- uppercase opcional quando fizer sentido institucional
- hover por opacidade ou leve elevacao

### Secondary

Uso:

- CTA de apoio
- links de navegação destacados

Visual:

- fundo `surface.default`
- borda `border.default`
- texto `text.default`

### Ghost

Uso:

- ação textual
- navegacao discreta
- CTA de baixa hierarquia

Visual:

- sem fundo persistente
- texto `text.muted`
- hover aproximando para `text.default`

## Field

Uso:

- formulário de contato
- formulários legais ou institucionais futuros

Visual:

- fundo `surface.default`
- borda `border.default`
- focus ring monocromatico usando `text.default` com opacidade baixa
- label pequena em uppercase

## Surface

### Default

Uso:

- cards de legal
- cards de depoimento
- containers informativos

Visual:

- fundo branco
- borda sutil
- sombra leve opcional

### Subtle

Uso:

- seções destacadas como contato
- agrupadores secundarios

Visual:

- fundo `bg.subtle`
- borda baixa ou nenhuma

## Header

Padrao:

- transparente ou vidro claro sobreposto ao hero
- links discretos
- nenhum CTA gritante

## Footer

Padrao:

- funcional
- informativo
- sem competicao com hero

## Section Shell

Padrao:

- `SectionLabel`
- `Title`
- `Body`
- `Actions`

Todas as secoes institucionais devem reaproveitar está anatomia em vez de reinventar espacamentos e titulos.

## Collapse

Accordion-style expand/collapse component. Used in FAQ sections (e.g. BitePlaner product page).

**Exported from:** `@nexor/design-system` as `Collapse`

**Props:**
- `trigger: ReactNode` — label shown in the clickable header row
- `children: ReactNode` — body content revealed when open
- `defaultOpen?: boolean` — starts expanded (default: false)

**Visual spec:**
- Container: `border: 1px solid #E0E0E0`, `border-radius: 12px`, `background: #FFFFFF`
- Trigger row: `font-weight: 600`, `font-size: 15px`, `color: #171717`, padding `20px 24px`
- Body: `font-size: 14px`, `color: #525252`, `line-height: 1.65`, padding `0 24px 20px`
- Icon: `+` character rotated 45° (becomes ×) when open — `transition: transform 180ms ease`
- Height animation: `180ms ease`
- Multiple items stack with `gap: 8px` between them

**Rules:**
- No pill radius — `border-radius: 12px` only
- No color accent on trigger
- Body hidden via `height: 0` + `overflow: hidden` (not `display: none`)
- `aria-expanded` on trigger button reflects open state

**Usage:**
```tsx
import { Collapse } from '@nexor/design-system';

<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
  <Collapse trigger="Qual o valor do BitePlaner?">
    O valor inicial do BitePlaner é R$ 400,00.
  </Collapse>
  <Collapse trigger="Para quais esportes é indicado?">
    Esportes de contato e alta intensidade.
  </Collapse>
</div>
```

## Desvios atuais a corrigir

- `Hero.tsx` tem `CtaPrimary` e `CtaSecondary` locais
- `Contato.tsx` tem `SubmitButton` local
- `Contato.tsx` define `Input`, `Select` e `Textarea` locais
- `Header.tsx` tem `NavLink` proprio que pode virar `NavItem`
