# Onboarding - Visao Geral do Projeto

**Objetivo deste documento:** ajudar uma nova dev a entender rapidamente como o repositorio esta organizado, onde procurar cada tipo de informacao e como navegar sem precisar entrar no detalhe interno de cada app logo no primeiro contato.

---

## 1. Visao geral

Este repositorio junta:

- contexto de negocio
- design system
- decisoes e specs
- planos e sprints
- codigo dos produtos

A ideia central e separar bem:

- o que e **contexto e direcao**
- o que e **planejamento**
- o que e **implementacao real**

---

## 2. Estrutura principal do repositorio

```text
nexor/
  .ai/
  docs/
  sprints/
  project/
  emails/
  AGENTS.md
  CLAUDE.md
  README.md
```

### Leitura rapida de cada area

| Pasta/arquivo | Papel |
|---|---|
| `AGENTS.md` | ponto de entrada geral para entender como o repo deve ser navegado |
| `CLAUDE.md` | instrucoes operacionais complementares para agentes e fluxo do repo |
| `.ai/` | contexto vivo do produto, negocio, design system, specs e decisoes |
| `docs/` | materiais de apoio, consultas operacionais e documentacao complementar |
| `sprints/` | visao pratica de planejamento e andamento do trabalho |
| `project/` | codigo real do produto |
| `emails/` | artefatos de comunicacao e materiais relacionados a e-mails |

---

## 3. Como pensar o repo

Uma forma simples de entender a organizacao e esta:

- `.ai/` responde **por que** e **como deveria ser**
- `sprints/` responde **o que estamos fazendo agora**
- `docs/` responde **o que ajuda a operar e consultar**
- `project/` responde **o que existe implementado de fato**

Se houver divergencia entre planejamento e codigo, o codigo mostra o estado atual da implementacao, mas a divergencia deve ser tratada e alinhada.

---

## 4. Pasta `.ai/`

Essa e a area de contexto do projeto. Ela nao e o produto em execucao, e sim a base que orienta decisoes.

### Estrutura por cima

```text
.ai/
  context/
  decisions/
  design-system/
  specs/
```

### O que vai em cada parte

| Pasta | Papel |
|---|---|
| `.ai/context/` | contexto de negocio, regras, escopo, arquitetura e referencias de trabalho |
| `.ai/decisions/` | decisoes tomadas e registradas ao longo do projeto |
| `.ai/design-system/` | fundamentos visuais, principios, componentes e canais de design |
| `.ai/specs/` | especificacoes de funcionalidades, mudancas estruturais e contratos de implementacao |

### Quando olhar `.ai/`

- antes de mexer em regra de negocio
- antes de criar ou alterar interface
- quando surgir duvida sobre escopo
- quando precisar validar se uma feature faz sentido no produto

---

## 5. Pasta `docs/`

`docs/` concentra documentacao complementar e operacional.

Hoje ela funciona como apoio para:

- materiais tecnicos de consulta
- documentacao util para o dia a dia
- registros mais operacionais que nao precisam morar em `.ai/`

### Exemplo de uso

- guias de consulta para banco
- materiais auxiliares para operacao
- documentos transversais que apoiam o time

---

## 6. Pasta `sprints/`

Essa pasta concentra o planejamento mais pratico do trabalho.

Ela serve para mostrar:

- o que esta em andamento
- como as frentes foram divididas
- quais sao os proximos blocos de entrega

### Como usar

Uma nova dev deve olhar `sprints/` para entender:

- prioridades atuais
- ordem recomendada de execucao
- dependencias entre frentes
- o que ja foi pensado para os proximos passos

---

## 7. Pasta `project/`

Essa e a pasta mais importante do ponto de vista de implementacao. E aqui que mora o codigo do produto.

### Estrutura macro

```text
project/
  frontend/
  backend/
  packages/
```

### Papel de cada area

| Pasta | Papel |
|---|---|
| `project/frontend/` | frontends do ecossistema |
| `project/backend/` | servicos e API do backend |
| `project/packages/` | pacotes compartilhados, como design system e outras bases comuns |

### Regra pratica

Se a tarefa for implementacao real de produto, quase sempre a mudanca vai acontecer dentro de `project/`.

---

## 8. Frontends, sem entrar no micro

Dentro de `project/frontend/` existem duas frentes principais do ecossistema:

- `nexor`
- `biteplaner`

### Visao de alto nivel

| App | Papel macro |
|---|---|
| `nexor` | camada institucional e de plataforma, concentrando entrada no ecossistema |
| `biteplaner` | camada de produto e dominio operacional do Biteplaner |

### Como pensar a relacao entre eles

- Nexor cuida da entrada mais central do ecossistema
- Biteplaner cuida do dominio especifico do produto
- a fronteira entre os dois precisa ser respeitada nas implementacoes

Este documento nao entra no detalhe interno das pastas de cada app de proposito.

---

## 9. Backend, sem entrar no micro

Dentro de `project/backend/` fica a API e os servicos que sustentam o ecossistema.

### Visao de alto nivel

O backend concentra:

- autenticacao e autorizacao
- contratos consumidos pelos frontends
- regras sensiveis
- acesso a dados
- auditoria, validacao e preocupacoes de seguranca

Em geral, qualquer regra sensivel deve ser tratada aqui, e nao no browser.

---

## 10. Packages compartilhados

`project/packages/` existe para guardar pecas reaproveitaveis do ecossistema.

O caso mais importante hoje e a base compartilhada de design system, que ajuda a manter consistencia visual e de componentes entre as frentes.

Pense nessa pasta como a area de ativos reutilizaveis do monorepo.

---

## 11. Ordem recomendada de leitura para uma nova dev

### Primeiro contato

1. `AGENTS.md`
2. `CLAUDE.md`
3. `.ai/context/INDEX.md`
4. `.ai/design-system/INDEX.md`
5. `sprints/index.md`
6. este arquivo de onboarding

### Depois disso

- se a tarefa for de negocio, olhar `.ai/context/`
- se a tarefa for de interface, olhar `.ai/design-system/`
- se a tarefa for de execucao atual, olhar `sprints/`
- se a tarefa for implementacao, ir para `project/`

---

## 12. Regra mental importante

Nao comecar pelo codigo de forma cega.

Antes de implementar:

- entender o contexto
- entender o escopo
- entender se existe sprint/plano ativo
- so depois entrar no codigo

Essa ordem evita retrabalho e ajuda a manter coerencia entre produto, design e implementacao.

---

## 13. Resumo final

Se voce lembrar de apenas quatro coisas, que sejam estas:

1. `.ai/` e a camada de contexto e direcao.
2. `sprints/` mostra o trabalho planejado e em andamento.
3. `project/` e o produto real implementado.
4. `nexor` e `biteplaner` fazem parte do mesmo ecossistema, mas com papeis diferentes.

---

## 14. Ponto de partida sugerido

Para uma nova dev entrar no projeto com seguranca:

- leia o contexto geral
- entenda as sprints ativas
- identifique em qual camada sua tarefa vive
- so entao entre no codigo correspondente

Esse fluxo ja reduz bastante o tempo de adaptacao ao repo.
