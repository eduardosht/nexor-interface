# Core Foundations

## Principios

- Simples antes de flexivel.
- Menos componentes, mais variacoes controladas.
- O token decide cor, espaco e estado; a página não deve inventar estilos.
- A linguagem de marca muda entre produtos, mas a anatomia dos componentes deve continuar reconhecivel.

## Arquitetura de tokens

Todo tema deve expor, no minimo:

- `colors`
- `fonts`
- `space`
- `radius`
- `shadow`
- `motion`
- `maxWidth`

## Modelo semantico de cores

Toda marca deve mapear suas cores para estes papéis:

- `bg.page`
- `bg.subtle`
- `surface.default`
- `surface.subtle`
- `surface.strong`
- `border.default`
- `border.strong`
- `text.default`
- `text.muted`
- `text.soft`
- `accent.default`
- `accent.strong`
- `accent.soft`
- `feedback.error`
- `feedback.errorBg`
- `feedback.successBg`

## Tipografia

Cada marca pode ter sua propria fonte de display e body, mas o sistema compartilha está hierarquia:

- `display.hero`
- `display.section`
- `heading.lg`
- `heading.md`
- `body.lg`
- `body.md`
- `body.sm`
- `label`
- `caption`

## Escala de espacamento

Escala base recomendada: multiplo de `4px`.

Tokens minimos:

- `space.1 = 4px`
- `space.2 = 8px`
- `space.3 = 12px`
- `space.4 = 16px`
- `space.5 = 20px`
- `space.6 = 24px`
- `space.8 = 32px`
- `space.10 = 40px`
- `space.12 = 48px`
- `space.16 = 64px`
- `space.20 = 80px`
- `space.24 = 96px`

## Radius

Padrao simplificado:

- `radius.sm = 4px`
- `radius.md = 8px`
- `radius.lg = 12px`
- `radius.xl = 16px`
- `radius.pill = 999px`

## Sombra

Padrao simplificado:

- `shadow.sm`
- `shadow.md`
- `shadow.lg`

Evitar inventar sombras por componente.

## Motion

Padrao simplificado:

- `motion.fast = 120ms`
- `motion.base = 180ms`
- `motion.slow = 280ms`

Curvas recomendadas:

- `ease.standard`
- `ease.emphasized`

Evitar animacoes decorativas fora de hero, transicoes de painel e feedback contextual.
