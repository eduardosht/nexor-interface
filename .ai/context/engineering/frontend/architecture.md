# Frontend Architecture Pattern

O `nexor-interface` deve evoluir como uma aplicação React modular orientada por domínio, com design-system compartilhado e páginas finas. O objetivo é preservar velocidade de entrega sem concentrar regra de negócio, data fetching, formatação, UI e estilos em arquivos grandes.

## Princípio central

Páginas roteáveis devem orquestrar contexto de navegação e composição visual. Regras de domínio, chamadas de API, presenters, hooks, validações, mocks e componentes reutilizáveis devem morar em módulos próprios.

## Estrutura esperada

```text
src/features/<produto-ou-contexto>/<dominio>/
  <dominio>.api.ts
  <dominio>.types.ts
  <dominio>.presenter.ts
  <dominio>.queries.ts
  <dominio>.hooks.ts
  <Componente>.tsx
  <Componente>.styles.ts
  __tests__/
```

Para páginas:

```text
src/pages/<area>/<Pagina>/
  index.tsx
  styles.ts
  index.test.tsx
```

Quando uma página crescer demais, extrair primeiro presenters e componentes puros; depois hooks e services; por último dividir a rota.

## Camadas

- `pages`: rotas, leitura de params/search params, composição de seções e navegação.
- `features`: domínio de produto ou operação. Exemplo: `biteplaner/orders`, `biteplaner/production`, `admin/licensing`.
- `presenter`: labels, status, display IDs, cores semânticas e mapeamento de DTO para UI.
- `api`: cliente de backend por domínio. Não deve conhecer componentes React.
- `queries`: query keys e funções de cache/invalidação com React Query.
- `hooks`: estado derivado de UI e integração de queries/mutations quando o fluxo for reutilizável.
- `components`: componentes compartilhados do app.
- `packages/design-system`: componentes reutilizáveis entre app, painel, admin e produtos.
- `mocks`: contratos de desenvolvimento sincronizados com o backend.

## Design-system

Todo padrão visual recorrente deve convergir para `project/packages/design-system/src`. Páginas não devem criar variações próprias de botão, tabela, modal, paginação, field ou status quando o pacote já tiver componente equivalente.

Componentes específicos de negócio podem ficar em `features`, mas devem usar primitives do design-system.

## Data fetching e estado

- React Query é o padrão para dados remotos.
- Query keys devem ficar próximas do domínio e ser estáveis.
- Não duplicar estado remoto em `useState` quando o cache já representa a fonte.
- Estado local deve ser usado para formulário em edição, seleção temporária, filtros e UI transitória.
- Dados sensíveis não devem ser mantidos em localStorage/sessionStorage sem necessidade e sem versionamento.

## Performance React

- Evitar componentes inline definidos dentro de componentes grandes.
- Extrair listas, tabelas, modais e gráficos em componentes memoizáveis quando houver renderização pesada.
- Importar bibliotecas pesadas no escopo da feature que realmente usa a funcionalidade.
- Evitar barrel imports amplos quando isso aumentar bundle ou dependências acidentais.

## Segurança e LGPD

O frontend não é fonte de autorização. Ele pode esconder ações por experiência, mas o backend precisa validar. O frontend também deve evitar renderizar dados clínicos ou pessoais em contextos indevidos, seguindo presenters por role quando necessário.

## Migração incremental

1. Criar presenters de domínio para dados já usados em muitas páginas.
2. Extrair API/types/query keys de `features/demo/biteplanerFlow.ts`.
3. Dividir `BiteplanerHub` por modo: cliente, parceiro, dentista, laboratório e admin.
4. Dividir `WorkflowFormsPanel` em engine de formulário, campos e seções.
5. Dividir `ProducaoDentista` em anamnese, solicitação de produção e seleção de laboratório.
6. Convergir componentes duplicados para `packages/design-system`.
