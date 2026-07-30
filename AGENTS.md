# Nexor Agent Entry Point

Este arquivo é o ponto de entrada para agents. O repo tem duas ramificações:

- `.ai/`: contexto de negócio e design system.
- `project/`: código real do produto, frontends, backends, packages, testes e assets de runtime.

## Ordem de leitura

1. Leia `CLAUDE.md`.
2. Classifique a tarefa.
3. Leia `.ai/context/INDEX.md`.
4. Para feature relevante, leia `.ai/context/business/INDEX.md` e o contexto de negócio aplicável.
5. Para interface, leia `.ai/design-system/INDEX.md` e o design system da marca aplicável.
6. Abra apenas os contextos necessários para a tarefa.
7. Edite código apenas em `project/`, salvo quando a tarefa for atualizar contexto/regras.

## Relação com CLAUDE.md

- `AGENTS.md` é o ponto de entrada genérico para agents neste repo.
- `CLAUDE.md` contém instruções específicas do Claude Code e deve ser lido primeiro quando existir.
- Evite duplicar regras detalhadas nos dois arquivos; prefira manter o contexto de negócio e de interface em `.ai/` e deixar estes arquivos como roteadores curtos.

## Roteamento rápido

- Regras de negócio, jornada, escopo de produto ou operação offline: `.ai/context/business/`.
- UI, estilos, tokens e componentes: `.ai/design-system/INDEX.md`.
- UI de painéis, admin, operação e dashboard: `.ai/design-system/painel/`.
- Backend/API: `project/backend/api/AGENTS.md`.
- Frontend Nexor institucional/plataforma: `project/frontend/nexor/AGENTS.md` + `.ai/design-system/nexor/` + `.ai/context/business/nexor/`.
- Frontend Biteplaner produto: `project/frontend/biteplaner/AGENTS.md` + `.ai/design-system/biteplaner/` + `.ai/context/business/biteplaner/`.

## Regras globais

- Não expor secrets no frontend.
- Não logar dados pessoais sensíveis.
- Validar toda entrada externa com schema.
- Colocar autorização no backend.
- Encapsular Supabase em repositories/integrations.
- Não adicionar IA runtime ao produto sem decisão explícita de arquitetura.
- Antes de implementar feature relevante, conferir se ela cabe no escopo descrito em `.ai/context/business/`.
- Se a feature fugir do escopo, contradizer o contexto ou criar regra nova, questione o usuário e atualize `.ai/context/business/`.
- Antes de implementar interface, conferir se ela respeita `.ai/design-system/`.
- Minimizar dados pessoais em textos livres antes de persistir, auditar ou enviar a integrações.
- Registrar auditoria para ações sensíveis.
- Testar casos negativos de segurança e LGPD.

## Planejamento e histórico

- Não mantenha planos temporários, specs de execução, relatórios locais ou arquivos de sessão dentro do repositório.
- Documentação permanente deve ficar em `.ai/` quando for contexto de produto/design, ou em `project/` quando for documentação técnica diretamente ligada ao código.
- Quando uma decisão virar estado oficial do sistema, atualize o documento permanente correspondente em vez de preservar versões antigas em Markdown separado.

## Antes de concluir

- Rode build/test relevantes do projeto frontend ou backend alterado.
- Confirme que nenhum secret foi adicionado.
- Confirme que paths novos respeitam `.ai/` para contexto e `project/` para código.
- Confirme que não foram adicionados arquivos temporários de planejamento, execução ou relatórios locais.