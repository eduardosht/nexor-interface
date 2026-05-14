# Biteplaner Partner Referral Flow Design

## Contexto

O parceiro indicador no Biteplaner representa academias, coaches, instituições de treinamento ou profissionais autorizados a apresentar o produto a clientes potenciais. Diferente de dentistas e laboratórios, o parceiro não opera etapas clínicas nem produtivas e não precisa de curso, prova, contrato de licenciamento ou certificado no MVP. O fluxo aprovado para esta etapa é um onboarding cadastral com revisão da Nexor Admin e, após aprovação, um painel focado em indicação individual rastreável.

## Objetivos

- Remover o submenu `Ordem` do modo parceiro, mantendo `Home`, `Indicar` e `Avaliações`.
- Criar um onboarding de parceiro alinhado aos cadastros de dentista e laboratório, mas com escolha de cadastro como CPF ou CNPJ.
- Permitir que a Nexor Admin revise, aprove ou recuse solicitações de parceiro.
- Liberar o modo parceiro somente após aprovação administrativa.
- Separar a geração de links em uma página dedicada `Indicar`.
- Transformar a Home do parceiro em um dashboard visual de funil: links gerados, clientes cadastrados, links convertidos em conta e compras finalizadas.
- Preservar atribuição de parceiro por cookie ao acessar um link individual, para que a origem não seja perdida se o cliente navegar antes de cadastrar ou comprar.

## Escopo Funcional

### Onboarding do parceiro

A página `/painel/biteplaner/cadastro/parceiro` deve seguir a estrutura visual dos onboardings profissionais já existentes. O usuário escolhe o tipo de documento:

- `CPF`, para parceiro pessoa física, como coach ou profissional indicador.
- `CNPJ`, para parceiro pessoa jurídica, como academia, centro de treinamento ou instituição.

Campos mínimos:

- nome do parceiro ou instituição;
- tipo de documento;
- CPF ou CNPJ com máscara e validação;
- e-mail de contato;
- cidade e estado;
- canais de atuação ou resumo da atuação comercial;
- aceite dos termos operacionais e política de privacidade.

O envio cria ou atualiza um `account_product_roles` de `product_key = biteplaner`, `role = partner`, `status = pending`, com os dados brutos em `metadata`. A tela deve mostrar disclaimer informando que a Nexor verificará a solicitação antes de liberar o acesso.

### Revisão administrativa

Criar uma página administrativa para parceiros em `/painel/admin/parceiros`, com a mesma lógica das filas de dentistas e laboratórios:

- listar solicitações pendentes, aprovadas e recusadas;
- filtrar por status;
- visualizar os dados enviados;
- aprovar;
- recusar com motivo obrigatório.

Na aprovação, o backend deve:

- criar ou atualizar o registro operacional em `partners`;
- manter o parceiro `active`;
- ativar o `account_product_roles` do parceiro;
- vincular o `partner_id` ao perfil;
- registrar auditoria;
- criar notificação de aprovação para o usuário.

Na recusa, o backend deve:

- marcar o `account_product_roles` como `rejected`;
- registrar motivo em `metadata.adminReview`;
- registrar auditoria;
- criar notificação de recusa.

### Menu parceiro

No modo `partner`, a navegação Biteplaner deve exibir apenas:

- `Home`;
- `Indicar`;
- `Avaliações`.

O submenu `Ordem` não deve aparecer para parceiro.

### Home do parceiro

A Home do parceiro em `/painel/biteplaner?mode=partner` deixa de ser uma tela operacional de tabelas e passa a ser um dashboard visual. Ela deve consumir um resumo do backend ou mock com:

- total de links gerados;
- clientes cadastrados por link;
- links convertidos em conta;
- clientes com compra finalizada;
- taxa de conversão link -> cadastro;
- taxa de conversão cadastro -> compra.

O layout recomendado usa cards de métrica e gráficos simples de barras/funil, sem expor dados clínicos ou detalhes de ordem.

### Página Indicar

Criar `/painel/biteplaner/indicar?mode=partner`. Essa página concentra a funcionalidade operacional do parceiro:

- lista de indicações/links já gerados;
- formulário para gerar novo link individual;
- QR Code mockado ou real no frontend para o link selecionado;
- ações de copiar link, abrir WhatsApp e e-mail;
- status do link: ativo, consumido, expirado ou inativo;
- dados permitidos do indicado: nome, e-mail e telefone quando existirem.

Cada link deve ser individual, criado para um potencial cliente qualificado, preservando a regra de não usar link permanente compartilhado em massa.

### Atribuição por link e cookie

Ao acessar `/cadastro?invite=<token>` ou outro link público de parceiro, o frontend deve:

- validar o token com `/v1/partner-invite-links/:token/validate`;
- salvar o token válido em cookie first-party com escopo Nexor;
- manter também compatibilidade com o armazenamento atual de sessão quando existir;
- usar esse token ao criar conta, ativar inscrição Biteplaner ou criar rascunho/ordem.

O cookie deve ter expiração controlada no MVP. Recomendação: 30 dias ou até o link ser consumido. O backend continua sendo a fonte de verdade: token expirado, consumido ou inativo deve ser recusado mesmo se ainda existir cookie.

### Backend e mocks

Rotas novas ou ajustadas:

- `GET /v1/admin/biteplaner/partner-requests`
- `GET /v1/admin/biteplaner/partner-requests/:productRoleId`
- `POST /v1/admin/biteplaner/partner-requests/:productRoleId/approve`
- `POST /v1/admin/biteplaner/partner-requests/:productRoleId/reject`
- `GET /v1/partner/referrals`
- `POST /v1/partner/invite-links`
- `GET /v1/partner/summary`

Os mocks em `project/frontend/nexor/src/mocks/handlers/` devem acompanhar essas rotas para validar o fluxo em `VITE_MOCK=true`.

## Dados e Segurança

Parceiros não acessam dados clínicos, documentos odontológicos, anexos ou conteúdo sensível da ordem. O painel do parceiro pode exibir apenas dados comerciais mínimos dos indicados e status de conversão agregados.

Entradas externas precisam de schema no backend. Ações de aprovação, recusa e geração de link devem gerar auditoria. CPF e CNPJ não devem ser logados em payload completo; quando necessário, registrar apenas metadados mínimos ou documento mascarado.

## Atualização de contexto de negócio

O contexto `.ai/context/business/biteplaner/product-flow.md` deve ser ajustado para deixar explícito que:

- parceiro segue revisão cadastral administrativa, mas não fluxo de licenciamento com curso/prova;
- parceiro aprovado tem função operacional única de gerar links individuais e acompanhar conversão;
- a atribuição por link deve ser preservada por cookie quando o cliente entra pela recomendação.

## Testes

Frontend:

- onboarding parceiro com CPF válido;
- onboarding parceiro com CNPJ válido;
- botão de envio bloqueado com documento inválido;
- menu parceiro sem `Ordem` e com `Indicar`;
- Home parceiro com gráficos e métricas;
- página `Indicar` listando links e gerando novo link;
- captura de invite token e persistência em cookie.

Backend:

- criação de role pendente para parceiro;
- aprovação e recusa admin;
- vínculo de role e `partner_id` ao perfil;
- autorização de rotas de parceiro;
- validação/consumo de invite link;
- resumo agregado sem dados clínicos.

Validação final:

- `npm run test:run` no frontend Nexor com testes focados;
- `npm run build` no frontend Nexor;
- `npm run test` e `npm run build` no backend API quando rotas/services forem alterados.
