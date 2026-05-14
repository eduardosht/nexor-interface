# Business Context

Este diretório guarda o contexto de negócio do Nexor e de seus produtos: escopo, jornadas, atores, regras comerciais, operação offline, perguntas em aberto e limites do que já foi definido.

Use estes arquivos antes de implementar features relevantes. Eles servem para verificar se o pedido está dentro do escopo conhecido do projeto.

## Como usar

1. Identifique se a tarefa envolve Nexor institucional, Biteplaner ou outro produto.
2. Leia o contexto de negócio aplicavel.
3. Compare o pedido do usuário com o escopo, jornada, atores e regras existentes.
4. Se o pedido não estiver coberto, parecer contraditorio ou criar uma regra nova, questione o usuário antes de implementar.
5. Depois da resposta, atualize os arquivos de contexto para registrar a nova decisão.

## Produtos e contextos

- Nexor institucional/plataforma: `nexor/INDEX.md`, `nexor/institutional-site.md` e, para conteúdo/copy/marketing, `nexor/content-marketing-guidelines.md`.
- Biteplaner: `biteplaner/INDEX.md` e `biteplaner/product-flow.md`.

## Regra de escopo

Features podem expandir o produto, mas expansoes precisam ficar explicitas. Quando uma feature trouxer novo ator, nova etapa de jornada, nova regra comercial, novo dado pessoal, novo parceiro, novo canal operacional ou nova integração, registre a mudanca no contexto apropriado antes ou junto da implementacao.
