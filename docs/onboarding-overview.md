# Onboarding - Nexor Interface

**Objetivo deste documento:** ajudar uma nova dev a entender rapidamente como o repositorio de interface esta organizado e onde procurar contexto antes de alterar telas, rotas, componentes ou copy.

## 1. Visao geral

Este repositorio contem a interface React/Vite do ecossistema Nexor/Biteplaner e a biblioteca compartilhada de design system.

## 2. Estrutura principal

```text
nexor-interface/
  .ai/
  docs/
  project/
    nexor/
    packages/
  AGENTS.md
```

| Pasta/arquivo | Papel |
|---|---|
| `AGENTS.md` | ponto de entrada para agentes e convencoes do repositorio |
| `.ai/context/` | contexto de negocio para validar escopo, jornada e copy |
| `.ai/design-system/` | fundamentos visuais, tokens, componentes e padroes de interface |
| `.ai/specs/` | especificacoes que orientam fluxos e contratos com a API |
| `docs/` | documentacao complementar util para produto, publicacao e handoff |
| `project/nexor/` | app React/Vite principal |
| `project/packages/design-system/` | pacote React de componentes e tokens compartilhados |

## 3. Como pensar o repo

- `.ai/context/` responde por que a experiencia existe e quais limites de negocio precisam ser respeitados.
- `.ai/design-system/` responde como interfaces devem parecer e se comportar.
- `project/nexor/` e `project/packages/` mostram a implementacao real.

Se houver divergencia entre documentacao e codigo, confirme o comportamento atual no codigo e atualize a documentacao junto da mudanca.

## 4. Ordem recomendada de leitura

1. `AGENTS.md`
2. `.ai/context/INDEX.md`
3. `.ai/design-system/INDEX.md`
4. `.ai/specs/` quando a tarefa envolver fluxo de produto, cadastro, login ou handoff
5. `project/README.md`
6. `project/nexor/README.netlify.md` quando a tarefa envolver deploy da interface

## 5. Limites de contexto

Este repositorio nao deve carregar guias operacionais de banco, mapeamento interno da API ou documentacao exclusiva de backend. Esses materiais ficam no repositorio `nexor-backend`.

Documentos transversais podem permanecer aqui quando ajudam a interface a entender jornada, copy, formularios, publicacao, parametros preservados ou contratos consumidos da API.
