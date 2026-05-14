# Nexor Frontend Agent Instructions

App React/Vite em `project/frontend/nexor/`.

## Leia antes

- `AGENTS.md` da raiz
- `.ai/design-system/INDEX.md`
- `.ai/design-system/nexor/`
- `.ai/context/business/nexor/institutional-site.md`

## Regras

- React 19 + TypeScript strict.
- A Nexor e a camada institucional/plataforma: landing, conta, cadastro/login e entrada multi-produto.
- Rotas de conta podem ser adicionadas quando necessarias para a experiencia de cadastro/login; preserve a simplicidade da landing institucional.
- Styled Components; nao usar Tailwind, CSS modules ou inline styles.
- Toda nova tela, pagina, componente ou feature de frontend deve ficar em pasta propria. Coloque `index.tsx`, `styles.ts`, testes e utils especificos dentro dessa pasta quando pertencerem ao mesmo contexto. Evite criar novos arquivos soltos no diretorio da pagina, exceto barrels como `index.ts` e arquivos compartilhados ja existentes.
- Seguir os tokens e componentes documentados em `.ai/design-system/nexor/`.
- Para cadastro/login/area de conta, conferir tambem o contexto de plataforma em `.ai/context/business/nexor/`.
- Nao colocar secrets no frontend.

## Porta de dev

5173.

## Verificacao

```bash
npm run build
npm run test:run
```

## Mock de desenvolvimento

Ao trabalhar em `src/mocks/handlers/`, manter os handlers sincronizados com os contratos das rotas em `project/backend/api/src/routes/`. Ao implementar uma nova rota no backend, adicionar o handler no arquivo correspondente antes de marcar a tarefa como concluida.
