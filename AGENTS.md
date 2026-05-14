# Nexor Agent Entry Point

Este arquivo e o ponto de entrada para agents. O repo tem duas ramificacoes:

- `.ai/`: contexto de negocio e design system.
- `project/`: codigo real do produto, frontends, backends, packages, testes e assets de runtime.

## Ordem de leitura

1. Leia `CLAUDE.md`.
2. Classifique a tarefa.
3. Leia `.ai/context/INDEX.md`.
4. Para feature relevante, leia `.ai/context/business/INDEX.md` e o contexto de negocio aplicavel.
5. Para interface, leia `.ai/design-system/INDEX.md` e o design system da marca aplicavel.
6. Abra apenas os contextos necessarios para a tarefa.
7. Edite codigo apenas em `project/`, salvo quando a tarefa for atualizar contexto/regras.

## Relacao com CLAUDE.md

- `AGENTS.md` e o ponto de entrada generico para agents neste repo.
- `CLAUDE.md` contem instrucoes especificas do Claude Code e deve ser lido primeiro quando existir.
- Evite duplicar regras detalhadas nos dois arquivos; prefira manter o contexto de negocio e de interface em `.ai/` e deixar estes arquivos como roteadores curtos.

## Roteamento rapido

- Regras de negocio, jornada, escopo de produto ou operacao offline: `.ai/context/business/`.
- UI, estilos, tokens e componentes: `.ai/design-system/INDEX.md`.
- UI de paineis, admin, operacao e dashboard: `.ai/design-system/painel/`.
- Backend/API: `project/backend/api/AGENTS.md`.
- Frontend Nexor institucional/plataforma: `project/frontend/nexor/AGENTS.md` + `.ai/design-system/nexor/` + `.ai/context/business/nexor/`.
- Frontend Biteplaner produto: `project/frontend/biteplaner/AGENTS.md` + `.ai/design-system/biteplaner/` + `.ai/context/business/biteplaner/`.

## Regras globais

- Nao expor secrets no frontend.
- Nao logar dados pessoais sensiveis.
- Validar toda entrada externa com schema.
- Colocar autorizacao no backend.
- Encapsular Supabase em repositories/integrations.
- Nao adicionar IA runtime ao produto sem decisao explicita de arquitetura.
- Antes de implementar feature relevante, conferir se ela cabe no escopo descrito em `.ai/context/business/`.
- Se a feature fugir do escopo, contradizer o contexto ou criar regra nova, questione o usuario e atualize `.ai/context/business/`.
- Antes de implementar interface, conferir se ela respeita `.ai/design-system/`.
- Minimizar dados pessoais em textos livres antes de persistir, auditar ou enviar a integracoes.
- Registrar auditoria para acoes sensiveis.
- Testar casos negativos de seguranca e LGPD.

## Specs de design (`docs/superpowers/specs/`)

- Specs em `docs/superpowers/specs/` (raiz) estao ativas — descrevem decisoes de design aprovadas que ainda guiam implementacoes em andamento.
- Ao concluir a implementacao correspondente a uma spec (plano executado, testes passando), mova o arquivo para `docs/superpowers/specs/done/`. Nao delete — preserve para historico.
- Se uma spec estiver em `docs/superpowers/specs/done/`, ela ja foi implementada. Leia apenas se precisar de contexto historico. Nao a use para guiar nova implementacao.
- Specs em `done/` nao substituem o codigo como fonte de verdade — o codigo e o historico git sao autoritativos apos a conclusao.

## Planos de implementacao (`docs/superpowers/plans/`)

- Antes de iniciar qualquer tarefa, verifique se existe um plano ativo em `docs/superpowers/plans/`.
- Se existir um plano para a tarefa em andamento, siga-o. Nao reinvente o que ja foi decidido.
- Ao concluir a execucao de um plano (todas as tasks marcadas como feitas e testes passando), mova o arquivo para `docs/superpowers/plans/done/`. Nao delete — preserve para historico.
- Se um plano estiver em `docs/superpowers/plans/done/`, ele ja foi executado. Nao o reexecute. Leia apenas se precisar de contexto historico.
- Planos em `docs/superpowers/plans/` (raiz) estao pendentes ou em andamento. Planos em `done/` estao concluidos.

## Antes de concluir

- Rode build/test relevantes do projeto frontend ou backend alterado.
- Confirme que nenhum secret foi adicionado.
- Confirme que paths novos respeitam `.ai/` para contexto e `project/` para codigo.
- Se uma task de plano foi concluida, mova o plano para `docs/superpowers/plans/done/` ao finalizar.
