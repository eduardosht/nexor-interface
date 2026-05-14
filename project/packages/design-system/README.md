# Nexor Design System Package

Pacote local da biblioteca de componentes compartilhados.

## Scripts

```bash
npm run storybook
npm run storybook:build
```

Execute os scripts a partir de `project/packages/design-system/`.

## Estrutura

- `src/`: componentes, tokens e provider
- `.storybook/`: configuracao do Storybook
- `src/**/*.stories.tsx`: stories vivas dos componentes
- `src/docs/*.mdx`: paginas conceituais

## Inicializacao

```tsx
import { initDesignSystem } from '@nexor/design-system';

const { DesignSystemRoot } = initDesignSystem({ brand: 'biteplaner' });
```

Depois disso, os componentes usam a marca ativa por contexto e nao precisam receber `brand` como prop.

## Regra

Toda mudanca visual compartilhavel deve preferencialmente entrar primeiro aqui.
