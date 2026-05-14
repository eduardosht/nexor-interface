# Nexor Design System

Este diretorio guarda a referencia visual oficial para interfaces do ecossistema Nexor.

## Objetivo

Servir como fonte de verdade para IA e para implementacao humana ao criar interfaces em `project/`.

O design system deve:

- partir do que ja existe no codigo hoje
- reduzir variacao visual desnecessaria
- manter componentes simples e reutilizaveis
- preparar o caminho para uma futura biblioteca React multimarca

## Estrutura

- `core/`: principios, tokens compartilhados e regras de composicao
- `nexor/`: design system da marca institucional Nexor
- `biteplaner/`: design system da marca de produto Biteplaner
- `painel/`: canal de design system para paineis administrativos, operacionais e de gestão
- `audit/`: diagnostico das inconsistencias atuais encontradas no codigo
- `library-roadmap.md`: direcao para evoluir a documentação para uma biblioteca real

## Documentação viva

O Storybook oficial da lib fica em:

- `project/packages/design-system/`

Papel de cada camada:

- `.ai/design-system/`: contexto, principios, regras e direcao
- `project/packages/design-system/src`: implementacao React compartilhada
- `project/packages/design-system/storybook-static` ou `npm run storybook`: catalogo vivo de uso visual

## Regras gerais

- Não criar variações ad hoc de botão. O padrão oficial é `primary`, `secondary` e `ghost`.
- Não criar um input por página. O padrão oficial é um único componente `Field`, com variacao por elemento (`input`, `select`, `textarea`).
- Não criar vários tipos de card sem necessidade. O padrão oficial é um único `Surface/Card` com variações leves de densidade e destaque.
- Marcas diferentes podem ter tokens e atmosfera diferentes, mas devem compartilhar a mesma arquitetura de componentes.
- Canais diferentes podem ter comportamento e densidade diferentes. `painel` e o canal oficial para interfaces administrativas.
- Quando o codigo atual divergir do design system, a implementacao futura deve convergir para o design system, salvo decisão explicita em contrario.

## Ordem de leitura

1. `core/INDEX.md`
2. `audit/current-ui-audit.md`
3. a marca aplicavel (`nexor/` ou `biteplaner/`)
4. o canal aplicavel quando existir, especialmente `painel/`
5. `library-roadmap.md` quando a tarefa envolver extracao de componentes
