# Frontend Modular Pattern Migration Plan

## Objetivo

Levar o `nexor-interface` para um padrão modular por domínio, mantendo `project/packages/design-system` como fonte de componentes compartilhados e reduzindo páginas/arquivos grandes.

## Critérios de sucesso

- Novas regras não crescem em `BiteplanerHub`, `WorkflowFormsPanel`, `ProducaoDentista` ou `biteplanerFlow`.
- Presenters, API, query keys e hooks ficam próximos do domínio.
- Componentes recorrentes convergem para o design-system.
- Textos novos usam UTF-8 real.
- `npm run test:run`, `npm run typecheck` e `npm run build` seguem passando.

## Fase 1 - Fundação

- [x] Criar contexto de arquitetura frontend em `.ai/context/engineering/frontend/`.
- [x] Criar contexto de agent frontend.
- [x] Extrair presenter de ordens Biteplaner para `src/features/biteplaner/orders/orderPresenter.ts`.
- [x] Reexportar presenter em `features/demo/biteplanerFlow.ts` para manter compatibilidade.
- [x] Rodar testes focados e typecheck.

Observação: as expectativas antigas de `ProducaoDentista/index.test.tsx` foram atualizadas após a reorganização do fluxo. A suíte completa do frontend passou em 70 arquivos e 414 testes, além de `typecheck` e `build`.

## Fase 2 - Biteplaner API e queries

- [x] Separar tipos de ordem, parceiro, licenciamento, forms e laboratório.
- [x] Mover chamadas de API de ordem para `features/biteplaner/orders/orders.api.ts`.
- [x] Mover chamadas de parceiro para `features/biteplaner/partners/partner.api.ts`.
- [x] Mover query keys para módulos por domínio.
- [x] Atualizar imports gradualmente.

## Fase 3 - Páginas operacionais grandes

- [x] Dividir `BiteplanerHub` por modo de acesso.
- [x] Extrair cards, tabelas, modais e gráficos do hub para componentes de feature.
- [x] Dividir `ProducaoDentista` em anamnese, solicitação de produção e seleção de laboratório.
- [x] Dividir `WorkflowFormsPanel` em engine, renderer de campos, lista de pendências e seções.

Observação: `BiteplanerHub` ganhou configuração de modo em `features/biteplaner/hub/hubModeConfig.ts` e gráfico do parceiro em `features/biteplaner/hub/partnerDashboard.tsx`; `ProducaoDentista` moveu a etapa `Solicitação de produção` para `ProductionRequestFields.tsx`; `WorkflowFormsPanel` moveu a lista de campos obrigatórios pendentes para `WorkflowFormsPendingRequiredLegend.tsx` e a guarda de hidratação de payload para `WorkflowFormsPanel.access.ts`, com teste dedicado.

## Fase 4 - Design-system

- [x] Auditar componentes locais duplicados com componentes já existentes no pacote.
- [x] Migrar botões, tabelas, modais, paginação, status e cards administrativos para o design-system.
- [x] Adicionar stories/testes quando um componente virar shared.

## Fase 5 - Qualidade e segurança

- [x] Adicionar testes de presenter e query keys por domínio.
- [x] Reduzir localStorage/sessionStorage a dados versionados e necessários.
- [x] Garantir que dados clínicos aparecem apenas em telas e roles permitidas.

Observação: `WorkflowFormsPanel` agora aplica uma guarda client-side antes de hidratar payload completo por role/template, além da autorização do backend. O teste `WorkflowFormsPanel.access.test.ts` cobre intake clínico, payloads customer-only e bloqueio quando `canViewPayload` é falso.
