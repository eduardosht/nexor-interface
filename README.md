# Nexor

Este repositorio organiza o ecossistema Nexor em duas frentes principais:

- `.ai/`: memoria operacional, contexto, regras, marca, decisoes, runbooks e skills para orientar agentes e desenvolvimento.
- `project/`: codigo real do produto, incluindo frontends, backends, packages, testes e assets usados em runtime.

A regra geral e simples: contexto e orientacao ficam em `.ai/`; implementacao de produto fica em `project/`.

## Estrutura da raiz

| Pasta/arquivo | Uso |
|---|---|
| `.ai/` | Base de conhecimento do projeto. Guarda contexto de produto, marca, engenharia, regulatorio, decisoes arquiteturais, runbooks, referencias e skills versionadas. |
| `.claude/` | Configuracoes locais/operacionais do Claude Code para este workspace. Nao e codigo de produto. |
| `.git/` | Metadados internos do Git. Nao deve ser editado manualmente. |
| `.superpowers/` | Materiais temporarios ou auxiliares de brainstorm/prototipacao gerados por ferramentas de ideacao. Nao deve ser tratado como fonte principal do produto. |
| `project/` | Codigo executavel do produto Nexor/Biteplaner. Alteracoes de frontend, backend, testes e runtime devem acontecer aqui. |
| `.gitignore` | Regras de arquivos e pastas ignoradas pelo Git. Atualmente ignora `node_modules/` em qualquer nivel. |
| `AGENTS.md` | Ponto de entrada para agentes. Define ordem de leitura, roteamento por tipo de tarefa, regras globais e criterios antes de concluir trabalho. |
| `CLAUDE.md` | Instrucoes especificas para uso com Claude Code. Complementa o contexto de agentes. |
| `README.md` | Este documento. Serve como mapa inicial do repositorio e orienta o uso de cada pasta. |

## `.ai/`

Pasta de contexto e governanca do projeto. Ela ajuda humanos e agentes a entenderem o negocio, a marca, os limites tecnicos e as regras de seguranca/compliance antes de alterar codigo.

| Pasta/arquivo | Uso |
|---|---|
| `.ai/README.md` | Resumo da ramificacao de IA/contexto e sua relacao com `project/`. |
| `.ai/context/` | Contexto vivo do projeto: negocio, setores, marca, engenharia e regulatorio. Deve ser lido conforme o tipo de tarefa. |
| `.ai/decisions/` | Registro de decisoes arquiteturais e tecnicas. Use quando uma escolha importante precisa ficar documentada. |
| `.ai/docs/` | Documentos auxiliares sobre comunicacao entre agentes, estrutura de desenvolvimento e materiais de apoio. |
| `.ai/reference/` | Materiais fonte de referencia, como assets, especificacoes e design system. Serve como insumo, nao necessariamente como runtime. |
| `.ai/runbooks/` | Procedimentos operacionais, de seguranca e compliance. Use para incidentes, revisoes e rotinas padronizadas. |
| `.ai/specs/` | Especificacoes implementaveis para features, contratos, criterios de aceite e planos de teste. |
| `.ai/skills/` | Skills versionadas do projeto para orientar tarefas recorrentes, como intake de feature, revisao LGPD e revisao de seguranca. |

### `.ai/context/`

| Pasta/arquivo | Uso |
|---|---|
| `.ai/context/INDEX.md` | Indice principal de contexto para agentes. |
| `.ai/context/agents/` | Responsabilidades e checklists por setor: governanca, seguranca, backend, frontend, produto/UX, dados, QA e outros. |
| `.ai/context/business/` | Escopo de negocio, produtos, jornadas, atores, regras comerciais e operacao fora do sistema. Deve validar features relevantes antes da implementacao. |
| `.ai/context/brand/` | Diretrizes de marca Nexor, Biteplaner e co-branding. Deve orientar UI, copy, apresentacoes e identidade visual. |
| `.ai/context/business/biteplaner/` | Contexto de negocio do Biteplaner, incluindo fluxo de produto, atores, jornada, status, formularios, notificacoes e pontos de atencao. |
| `.ai/context/business/nexor/` | Contexto de negocio/institucional da Nexor, incluindo estrutura do site institucional. |
| `.ai/context/brand/biteplaner/` | Design system Biteplaner, incluindo cores, componentes, tipografia, motion e espacamento. |
| `.ai/context/brand/nexor/` | Diretrizes da marca institucional Nexor. |
| `.ai/context/engineering/` | Padroes tecnicos e arquitetura por area, especialmente backend e fronteiras do sistema. |
| `.ai/context/regulatory/` | Regras e referencias de LGPD, seguranca, acessibilidade, risco e achados regulatorios. |

### `.ai/decisions/`

| Pasta | Uso |
|---|---|
| `.ai/decisions/adr/` | ADRs, ou Architecture Decision Records. Use para registrar decisoes tecnicas relevantes, alternativas consideradas e consequencias. |

### `.ai/docs/`

| Pasta/arquivo | Uso |
|---|---|
| `.ai/docs/agent-communication-map.md` | Mapa de comunicacao e responsabilidades entre agentes/setores. |
| `.ai/docs/developer-structure-guide.md` | Guia da estrutura de desenvolvimento do projeto. |
| `.ai/docs/superpowers/` | Documentacao ou materiais relacionados aos fluxos de brainstorm/prototipacao da pasta `.superpowers/`. |

### `.ai/reference/`

| Pasta | Uso |
|---|---|
| `.ai/reference/design-system/` | Materiais de design system usados como fonte de consulta. |
| `.ai/reference/nexor-specs/` | Especificacoes e materiais fonte sobre Nexor. |

### `.ai/runbooks/`

| Pasta | Uso |
|---|---|
| `.ai/runbooks/compliance/` | Procedimentos ligados a LGPD, dados pessoais, retencao, consentimento e direitos do titular. |
| `.ai/runbooks/operations/` | Procedimentos de operacao e suporte. |
| `.ai/runbooks/security/` | Procedimentos de seguranca, revisao, incidentes e boas praticas. |

### `.ai/skills/`

| Pasta/arquivo | Uso |
|---|---|
| `.ai/skills/README.md` | Explica as skills versionadas do projeto. |
| `.ai/skills/nexor-feature-intake/` | Skill para classificar e preparar features relevantes antes da implementacao. |
| `.ai/skills/nexor-lgpd-review/` | Skill para revisar tratamento de dados pessoais, dados sensiveis, finalidade, consentimento, retencao e terceiros. |
| `.ai/skills/nexor-security-review/` | Skill para revisar auth, autorizacao, secrets, logs, abuso, Supabase, uploads, admin e terceiros. |

## `project/`

Pasta de codigo real do produto. Tudo que executa em runtime, build, testes e integracoes de produto deve viver aqui.

| Pasta/arquivo | Uso |
|---|---|
| `project/README.md` | Resumo da estrutura de codigo do produto. |
| `project/frontend/` | Aplicacoes frontend. |
| `project/backend/` | Services backend e APIs. |
| `project/packages/` | Pacotes compartilhados futuros, como tipos, utilitarios e UI comum. Atualmente nao ha subpastas versionadas ali. |

### `project/frontend/`

| Pasta | Uso |
|---|---|
| `project/frontend/web/` | SPA React/Vite institucional Nexor + Biteplaner. Contem paginas, componentes, estilos, assets, rotas e testes do frontend. |

### `project/frontend/web/`

| Pasta/arquivo | Uso |
|---|---|
| `project/frontend/web/AGENTS.md` | Instrucoes especificas para agentes ao trabalhar no frontend. |
| `project/frontend/web/dist/` | Build gerado do frontend. Artefato de saida, nao fonte principal de edicao. |
| `project/frontend/web/node_modules/` | Dependencias instaladas localmente via npm. Deve continuar ignorado pelo Git. |
| `project/frontend/web/public/` | Arquivos publicos estaticos copiados para o build, como `robots.txt`. |
| `project/frontend/web/src/` | Codigo fonte do frontend. |
| `project/frontend/web/index.html` | HTML de entrada do app Vite. |
| `project/frontend/web/package.json` | Scripts e dependencias do frontend. |
| `project/frontend/web/package-lock.json` | Lockfile das dependencias do frontend. |
| `project/frontend/web/tsconfig*.json` | Configuracoes TypeScript do frontend. |
| `project/frontend/web/vercel.json` | Configuracao de deploy do frontend na Vercel. |
| `project/frontend/web/vite.config.ts` | Configuracao do Vite. |
| `project/frontend/web/vitest.config.ts` | Configuracao dos testes com Vitest. |

### `project/frontend/web/src/`

| Pasta/arquivo | Uso |
|---|---|
| `project/frontend/web/src/assets/` | Imagens e assets usados pelo frontend. |
| `project/frontend/web/src/components/` | Componentes React reutilizaveis, separados por layout, secoes e UI. |
| `project/frontend/web/src/context/` | Contextos React, como tema. |
| `project/frontend/web/src/hooks/` | Hooks reutilizaveis do frontend. |
| `project/frontend/web/src/pages/` | Paginas/rotas principais do site: Home, BitePlaner, Contato, Parceiros, Privacidade e outras. |
| `project/frontend/web/src/routes/` | Definicao das rotas do React Router. |
| `project/frontend/web/src/styles/` | Estilos globais, tema e tokens. |
| `project/frontend/web/src/types/` | Declaracoes TypeScript auxiliares do frontend. |
| `project/frontend/web/src/utils/` | Utilitarios do frontend. |
| `project/frontend/web/src/__tests__/` | Testes do frontend. |
| `project/frontend/web/src/main.tsx` | Entrada React do app. |

### `project/backend/`

| Pasta | Uso |
|---|---|
| `project/backend/api/` | Backend Node.js + TypeScript + Fastify. E a fronteira confiavel para autenticacao, autorizacao, Supabase, auditoria e politicas LGPD. |

### `project/backend/api/`

| Pasta/arquivo | Uso |
|---|---|
| `project/backend/api/README.md` | Documentacao do backend, stack, scripts e regras de seguranca. |
| `project/backend/api/AGENTS.md` | Instrucoes especificas para agentes ao trabalhar na API. |
| `project/backend/api/.env.example` | Exemplo de variaveis de ambiente esperadas pelo backend. Nao deve conter secrets reais. |
| `project/backend/api/.gitignore` | Regras de ignore especificas da API. |
| `project/backend/api/node_modules/` | Dependencias instaladas localmente via npm. Deve continuar ignorado pelo Git. |
| `project/backend/api/src/` | Codigo fonte da API. |
| `project/backend/api/tests/` | Testes automatizados da API. |
| `project/backend/api/package.json` | Scripts e dependencias da API. |
| `project/backend/api/package-lock.json` | Lockfile das dependencias da API. |
| `project/backend/api/tsconfig.json` | Configuracao TypeScript da API. |
| `project/backend/api/vitest.config.ts` | Configuracao dos testes com Vitest. |

### `project/backend/api/src/`

| Pasta/arquivo | Uso |
|---|---|
| `project/backend/api/src/app.ts` | Montagem da aplicacao Fastify, plugins e rotas. |
| `project/backend/api/src/server.ts` | Entrada do servidor HTTP. |
| `project/backend/api/src/compliance/` | Funcoes e politicas relacionadas a auditoria, consentimento e minimizacao de dados. |
| `project/backend/api/src/config/` | Configuracoes de ambiente e logger. |
| `project/backend/api/src/integrations/` | Integracoes externas encapsuladas, como Supabase. |
| `project/backend/api/src/repositories/` | Camada de acesso a dados. Regras do repo indicam que Supabase deve ser encapsulado aqui ou em integrations. |
| `project/backend/api/src/routes/` | Rotas HTTP da API. |
| `project/backend/api/src/schemas/` | Schemas de validacao de entrada e saida. |
| `project/backend/api/src/security/` | Tratamento seguro de erros e validacao de entrada. |
| `project/backend/api/src/services/` | Regras de negocio e casos de uso. |
| `project/backend/api/src/types/` | Tipos compartilhados dentro da API, como auth. |

### `project/backend/api/tests/`

| Pasta | Uso |
|---|---|
| `project/backend/api/tests/compliance/` | Testes de compliance, consentimento e minimizacao de dados. |

## Pastas geradas ou locais

Algumas pastas aparecem no workspace, mas nao devem ser editadas como fonte principal:

| Pasta | Uso |
|---|---|
| `project/frontend/web/dist/` | Resultado de build do frontend. Pode ser regenerado. |
| `project/frontend/web/node_modules/` | Dependencias instaladas do frontend. |
| `project/backend/api/node_modules/` | Dependencias instaladas da API. |
| `.git/` | Controle interno do Git. |
| `.superpowers/brainstorm/` | Artefatos auxiliares de brainstorm/prototipacao. |

## Regras praticas de trabalho

- Para entender o projeto, comece por `AGENTS.md`, `.ai/context/INDEX.md` e `.ai/context/agents/sectors.md`.
- Para feature relevante, valide escopo em `.ai/context/business/` antes de implementar.
- Para alterar codigo de produto, trabalhe dentro de `project/`.
- Para alterar contexto, marca, decisao, regra ou runbook, trabalhe dentro de `.ai/`.
- Para frontend, consulte `project/frontend/web/AGENTS.md` e os arquivos de marca em `.ai/context/brand/`.
- Para backend, consulte `project/backend/api/AGENTS.md` e `.ai/context/engineering/backend/`.
- Para dados pessoais, saude, pagamentos, logs, auth, admin ou terceiros, use tambem os contextos de seguranca e LGPD.
- Nunca exponha secrets no frontend.
- Nao registre dados pessoais sensiveis em logs.
- Valide entrada externa com schema.
- Coloque autorizacao real no backend.
- Encapsule Supabase em repositories/integrations.

## Sugestoes de melhoria

Estas sugestoes nao foram aplicadas; ficam registradas para avaliacao futura.

- Adicionar um `package.json` ou workspace na raiz para centralizar scripts comuns, como build/test do frontend e backend.
- Expandir `.gitignore` para ignorar artefatos locais comuns, como `dist/`, `.env`, logs e caches de ferramentas, se fizer sentido para o fluxo do time.
- Expandir `.ai/specs/` com templates de spec-driven development para features implementaveis, usando `.ai/context/business/` como fonte de escopo.
- Avaliar se `.superpowers/brainstorm/` deve ficar versionado, parcialmente ignorado ou movido para `.ai/docs/superpowers/`, dependendo do valor desses artefatos para o projeto.
- Criar READMEs especificos em `project/frontend/web/src/` e `project/backend/api/src/` quando a estrutura crescer, para orientar padroes internos por camada.
- Definir uma convencao para estados de ordem do Biteplaner em contexto de produto e, depois, refletir essa convencao em tipos compartilhados quando houver implementacao.
