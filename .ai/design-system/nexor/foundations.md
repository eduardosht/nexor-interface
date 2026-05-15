# Nexor Foundations

Baseado no frontend institucional atual em `project/nexor/`.

## Linguagem visual

- monocromatica
- técnica
- limpa
- pouco ornamental
- foco em contraste, ritmo e espacamento

## Tokens de marca

### Cor

Paleta canonica:

- `bg.page = #FAFAFA`
- `bg.subtle = #F0F0F0`
- `surface.default = #FFFFFF`
- `surface.subtle = #F0F0F0`
- `border.default = #E0E0E0`
- `border.strong = #C8C8C8`
- `text.default = #171717`
- `text.muted = #525252`
- `text.soft = #737373`

Regras:

- Nexor não depende de cor de acento permanente no institucional
- destaque vem de tipografia, contraste e composicao
- verde Biteplaner não deve entrar como token da marca Nexor

### Tipografia

- `font.body = Inter`
- `font.display = Inter`
- `font.mono = JetBrains Mono`

Escala recomendada:

- `display.hero = clamp(48px, 5.5vw, 80px)`
- `display.section = clamp(32px, 3vw, 40px)`
- `body.lg = 15px`
- `body.md = 14px`
- `body.sm = 13px`
- `label = 11px`

### Layout

- `maxWidth = 1200px`
- secoes internas usam `48px` horizontal em desktop e `24px` em mobile
- grid institucional prioriza blocos amplos e respiro generoso

### Radius

- CTA leve: `4px`
- campos e inputs: `6px`
- cards e surfaces: `12px`

### Motion

- hover discreto
- transicoes suaves
- pouca escala
- opacidade e deslocamento curto em blocos

### BitePlaner context palette

Tokens disponíveis via `getBrandTokens('nexor').biteplanerContext`. Representam a marca do produto BitePlaner e devem ser usados **exclusivamente** em elementos de UI relacionados ao BitePlaner: hero e CTA da página `/biteplaner`, cards de produto no dashboard, e badges de status do produto.

Nunca usar em elementos da marca Nexor: header, footer, páginas de auth, Sobre, Parceiros, ou qualquer chrome neutro.

| Token | Valor | Uso |
|-------|-------|-----|
| `accentSoft` | `#CDFCDD` | Backgrounds sutis de tint |
| `accentSubtle` | `#ACD9BB` | Superfícies leves / bordas |
| `accentSupport` | `#76B78E` | Acento de suporte |
| `accentMid` | `#5B9B74` | Tom médio |
| `accentDefault` | `#3C7C56` | Interátivo padrão |
| `accentStrong` | `#1C5E3A` | Botões primários, acento forte |
| `ink` | `#1C5E3A` | Texto sobre superfícies claras |

## O que padronizar a partir de agora

- parar de criar CTA por seção com estilo proprio
- unificar `Hero` CTA, `Contato` submit e links acionaveis na familia `Button`
- unificar `Contato` input/select/textarea na familia `Field`
- unificar cards institucionais na familia `Surface`
