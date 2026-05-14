# Nexor Claude Code Instructions

Este arquivo e lido automaticamente em toda conversa. Mantenha-o curto: detalhes vivem em `.ai/`.

## Estrutura do repo

```text
nexor/
  .ai/       contexto de negocio e design system
  project/   codigo do produto: frontends, backends, packages, testes e assets de runtime
```

## Regras de leitura

- Comece por `AGENTS.md`.
- Para contexto geral, leia `.ai/context/INDEX.md`.
- Para feature relevante, regra de negocio, jornada, ator, operacao offline ou validacao de escopo, leia `.ai/context/business/INDEX.md` e o contexto aplicavel.
- Para interface, leia `.ai/design-system/INDEX.md` e o design system da marca aplicavel.
- Para backend/API, leia `project/backend/api/AGENTS.md`.
- Para frontend Nexor institucional/plataforma, leia `project/frontend/nexor/AGENTS.md`.
- Para frontend Biteplaner produto, leia `project/frontend/biteplaner/AGENTS.md`.

## Frontend Nexor (institucional/plataforma)

- App: `project/frontend/nexor/`.
- Stack: React 19, TypeScript strict, Vite 6, Styled Components 6, Vitest.
- A Nexor agora centraliza tambem cadastro, login, conta e entrada multi-produto; rotas de conta podem ser adicionadas quando essa implementacao comecar.
- Testes: `npm run test:run` dentro de `project/frontend/nexor/`.

## Frontend Biteplaner (produto)

- App: `project/frontend/biteplaner/`.
- Stack: React 19, TypeScript strict, Vite 6, React Router DOM 7, Styled Components 6, Vitest.
- Biteplaner consome contas Nexor inscritas no produto; cadastro/login primarios devem migrar para o frontend Nexor.
- Rotas de produto, paineis e operacao permanecem no Biteplaner.
- Testes: `npm run test:run` dentro de `project/frontend/biteplaner/`.

## Backend API

- Service: `project/backend/api/`.
- Stack: Node.js, TypeScript strict, Fastify, Zod, Supabase encapsulado.
- Autorizacao sempre no backend.
- Supabase service role apenas no backend.
- Toda entrada externa deve passar por schema.
- Acoes sensiveis devem gerar auditoria.
- Testes: `npm run test` dentro de `project/backend/api/`.

## Seguranca e LGPD

- Nao expor secrets no frontend.
- Nao logar CPF, dados de saude, tokens, enderecos completos ou payloads sensiveis.
- Qualquer feature com dados pessoais, auth, admin, pagamentos, saude, terceiros ou logs exige classificacao de risco.
- IA e usada apenas para desenvolvimento; nao adicionar IA runtime ao produto sem nova decisao arquitetural.

## Contexto de negocio

Nexor e uma empresa-plataforma de produtos de performance.

Biteplaner e o primeiro produto: protetor bucal personalizado para atletas, com plataforma digital associada e possiveis servicos de telemedicina.

Ao construir interfaces de produto ou admin, considere foco em personalizacao, linguagem tecnica e alta exigencia de confianca.

## Escopo de negocio

Antes de implementar feature relevante, compare o pedido com `.ai/context/business/`. Se o pedido criar novo ator, etapa, regra comercial, integracao, dado pessoal, processo operacional ou contradizer o contexto existente, questione o usuario antes de implementar. Depois da resposta, atualize o contexto de negocio.

## Design system — regra obrigatoria

Toda tarefa de interface no Nexor ou Biteplaner exige leitura previa do design system antes de escrever qualquer CSS ou componente. Sem essa leitura, tokens de radius, cor e tipografia ficam errados.

Ordem de leitura obrigatoria antes de qualquer interface:

1. `.ai/design-system/core/foundations.md`
2. Para Nexor institucional: `.ai/design-system/nexor/foundations.md` + `.ai/design-system/nexor/components.md`
3. Para Biteplaner produto: `.ai/design-system/biteplaner/foundations.md` + `.ai/design-system/biteplaner/components.md`
4. Para paineis admin/operacional: `.ai/design-system/painel/`

Tokens Nexor a respeitar:

- Radius: CTA = `4px`, inputs/campos = `6px`, cards/surfaces = `12px`. Nunca usar pill (`border-radius: 100px` ou similar).
- Paleta: moncromatica. Sem cor de acento no institucional. Verde Biteplaner nao entra como token Nexor.
- Botao primary: fundo `#171717`, texto `#FAFAFA`, radius `4px`.
- Botao secondary: fundo branco, borda `#E0E0E0`, texto `#171717`.

Nao criar variacoes ad hoc de botao, input ou card. Usar os componentes canonicos do design system.
