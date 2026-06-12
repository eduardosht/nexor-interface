# Frontend Agent Context

Ao trabalhar no `nexor-interface`, siga o padrão em `.ai/context/engineering/frontend/architecture.md`.

Checklist antes de alterar código:

- Ler `AGENTS.md`, o contexto de negócio aplicável e o design-system aplicável.
- Identificar se a mudança pertence a `pages`, `features`, `components`, `styles`, `mocks` ou `packages/design-system`.
- Evitar aumentar arquivos grandes como `BiteplanerHub`, `WorkflowFormsPanel`, `ProducaoDentista` e `biteplanerFlow`.
- Usar componentes do design-system antes de criar variações locais.
- Manter textos em UTF-8 real, sem mojibake.

Checklist antes de finalizar:

- Rodar teste/build relevante.
- Buscar marcadores de mojibake nos arquivos tocados.
- Verificar se nenhum secret foi adicionado.
- Atualizar mocks quando o contrato de backend mudar.
