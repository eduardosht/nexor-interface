# Mapeamento Do Backend E Features Disponiveis

Data de referencia: 2026-05-02

## Objetivo deste documento

Este documento mapeia o backend atual de `project/backend/api/` por feature, com foco em responder:

- qual problema de negocio cada feature atende
- o que o backend ja implementa de fato
- quais rotas existem para cada fluxo
- em quais tabelas e integracoes o backend se apoia
- qual o nivel de prontidao para os frontends Nexor e Biteplaner

## Resumo executivo

O backend ja esta bem mais avancado do que os frontends em quatro frentes:

1. conta Nexor e auth base
2. enrollment do Biteplaner
3. fluxo operacional de ordens do Biteplaner
4. governanca operacional e admin

Hoje o backend ja suporta:

- conta Nexor com perfil interno, status, roles e consentimentos
- verificacao de disponibilidade de CPF/CNPJ no fluxo tecnico legado de cadastro
- enrollment do produto Biteplaner com atribuicao de referral
- criacao de order draft publico antes do login
- criacao de ordem autenticada
- pagamento manual/stub
- selecao de dentista/local de atendimento
- vinculacao operacional da consulta inicial pelo dentista
- appointments, confirmacoes, no-show e transicoes de status
- workflow forms operacionais com rascunho, submissao e revisao
- formularios clinicos do dentista
- inaptidao e encerramento administrativo
- operacao/admin para parceiros, dentistas, laboratorios, perfis e notificacoes
- auditoria persistida

Regra de negocio aprovada em 2026-05-02 que passa a orientar os proximos ajustes:

- cadastro publico do usuario final na Nexor deve ser simples, apenas e-mail e senha
- apos login, o usuario sempre cai primeiro na area logada da Nexor
- a primeira consulta com o dentista acontece antes da cobranca do Biteplaner
- so ha pagamento quando o dentista declara o usuario apto
- se o dentista declarar inaptidao, o fluxo deve encerrar sem cobranca
- se o dentista exigir tratamento previo, a ordem fica em espera ate nova avaliacao

As principais lacunas atuais nao estao na API principal, mas nas integracoes externas, na camada de experiencia e na aderencia ao novo fluxo aprovado:

- nao existe gateway de pagamento real, apenas `manual_stub`
- nao existe envio real de notificacao/e-mail, apenas `notification_events`
- nao existe agendamento automatizado, apenas registro operacional
- o catalogo de produtos e hardcoded com um unico produto: `biteplaner`
- o frontend ainda nao explora boa parte do contrato ja disponivel

## Integracoes reais do backend hoje

O backend hoje usa basicamente:

- Supabase Auth para validar Bearer Token e listar usuarios no fluxo tecnico legado de disponibilidade de documento
- Supabase Postgres como persistencia principal
- Fastify + Zod para expor e validar as rotas

O backend nao usa hoje:

- gateway de pagamento
- provedor de e-mail
- WhatsApp/SMS
- agenda externa
- IA runtime

## Mapa geral de dominios e rotas

### Health e docs

- `GET /health`
- `GET /docs`
- `GET /docs/json`

### Auth, conta Nexor e consentimentos

- `POST /v1/auth/validate-registration-identifier`
- `GET /v1/auth/me`
- `POST /v1/auth/profile`
- `PATCH /v1/auth/profile`
- `GET /v1/auth/consents`
- `POST /v1/auth/consents`
- `POST /v1/account/consents`
- `POST /v1/auth/onboarding/dentist`
- `POST /v1/auth/onboarding/partner`
- `POST /v1/auth/onboarding/lab`

### Produtos e enrollment

- `GET /v1/products`
- `GET /v1/account/product-enrollments`
- `GET /v1/products/biteplaner/enrollment`
- `POST /v1/products/biteplaner/enrollments`

### Operacao publica e referral

- `GET /v1/partners`
- `GET /v1/partner-invite-links/:token/validate`
- `GET /v1/clinics`
- `GET /v1/practice-locations`
- `GET /v1/partner/invite-links`
- `POST /v1/partner/invite-links`

### Ordem e jornada Biteplaner

- `POST /v1/order-drafts`
- `GET /v1/order-drafts/:draftId`
- `POST /v1/orders`
- `GET /v1/orders`
- `GET /v1/orders/:orderId`
- `GET /v1/orders/:orderId/timeline`
- `POST /v1/orders/:orderId/payment-intents`
- `GET /v1/orders/:orderId/payments-summary`
- `POST /v1/orders/:orderId/practice-location-selection`
- `POST /v1/orders/:orderId/initial-consultation-link`
- `POST /v1/orders/:orderId/clinic-selection`

### Appointments

- `POST /v1/orders/:orderId/appointments`
- `GET /v1/orders/:orderId/appointments`
- `PATCH /v1/orders/:orderId/appointments/:appointmentId`
- `POST /v1/orders/:orderId/appointments/:appointmentId/user-confirmation`
- `POST /v1/orders/:orderId/appointments/:appointmentId/dentist-confirmation`
- `POST /v1/orders/:orderId/appointments/:appointmentId/complete-match`
- `POST /v1/orders/:orderId/appointments/:appointmentId/no-show`

### Workflow forms operacionais

- `GET /v1/orders/:orderId/workflow-forms`
- `GET /v1/orders/:orderId/workflow-forms/:workflowFormId`
- `POST /v1/orders/:orderId/workflow-forms/:workflowFormId/submit`
- `PATCH /v1/orders/:orderId/workflow-forms/:workflowFormId/draft`
- `POST /v1/orders/:orderId/workflow-forms/:workflowFormId/revise`
- `POST /v1/orders/:orderId/workflow-forms/release`

### Formularios clinicos e desfechos

- `POST /v1/orders/:orderId/clinical-evaluation`
- `POST /v1/orders/:orderId/ineligibility`
- `POST /v1/orders/:orderId/forms/anamnesis`
- `POST /v1/orders/:orderId/forms/production-request`
- `POST /v1/orders/:orderId/forms/follow-up`
- `GET /v1/orders/:orderId/forms`
- `GET /v1/orders/:orderId/forms/:formId`
- `PATCH /v1/orders/:orderId/forms/:formId`

### Laboratorio, adaptacao e acompanhamento

- `POST /v1/orders/:orderId/lab-dispatch`
- `POST /v1/orders/:orderId/product-received`
- `POST /v1/orders/:orderId/adaptation-completed`
- `POST /v1/orders/:orderId/follow-ups/schedule`
- `POST /v1/orders/:orderId/complete`

### Admin

- `GET /v1/admin/profiles`
- `PATCH /v1/admin/profiles/:profileId/status`
- `POST /v1/admin/orders/:orderId/payment-confirmation`
- `POST /v1/admin/orders/:orderId/cancel`
- `PATCH /v1/admin/orders/:orderId/status`
- `POST /v1/orders/:orderId/refunds`
- `PATCH /v1/admin/refunds/:refundId`
- `GET /v1/admin/refunds`
- `GET /v1/admin/workflow-forms`
- `GET /v1/admin/audit-events`
- `GET /v1/admin/notification-events`
- `POST /v1/admin/notification-events/:eventId/mark-dispatched`

### Admin operacional de rede

- `POST /v1/admin/partners`
- `GET /v1/admin/partners`
- `PATCH /v1/admin/partners/:partnerId`
- `POST /v1/admin/clinics`
- `PATCH /v1/admin/clinics/:clinicId`
- `POST /v1/admin/clinics/:clinicId/dentists`
- `POST /v1/admin/dentists`
- `GET /v1/admin/dentists`
- `PATCH /v1/admin/dentists/:dentistId`
- `POST /v1/admin/dentists/:dentistId/practice-locations`
- `PATCH /v1/admin/practice-locations/:practiceLocationId`
- `PATCH /v1/admin/laboratories/:laboratoryId`
- `GET /v1/admin/laboratories`

## Feature por feature

## 1. Login, sessao e identidade Nexor

### Objetivo

Centralizar login, sessao e identidade de todos os usuarios do ecossistema na Nexor, deixando o Biteplaner como dominio operacional.

### O que o backend ja faz

- valida Bearer Token emitido pelo Supabase Auth
- monta o usuario autenticado com `profileId`, `roles`, `dentistId`, `partnerId`, `labId`
- bloqueia autenticacao se o perfil interno estiver com status `blocked`
- aplica autorizacao por role e ownership no backend

### Rotas

- `GET /v1/auth/me`

### Persistencia e integracoes

- Supabase Auth
- tabela `profiles`
- tabela `profile_roles`

### Observacoes importantes

- se o usuario existe no Supabase Auth, mas ainda nao criou `profile`, o backend ainda autentica e retorna um usuario sem `profileId`
- o default de role efetiva nesse caso cai para `customer`, mas varias features exigem `profile` existente

### Prontidao para frontend

Pronto para uso no frontend Nexor e para guards do Biteplaner.

### Gap principal de frontend

- o frontend precisa usar `GET /v1/auth/me` como fonte confiavel de sessao backend, nao apenas confiar no client-side auth do Supabase

## 2. Cadastro de perfil Nexor

### Objetivo

Completar o cadastro interno da conta Nexor depois do `signUp/signIn` no Supabase.

### O que o backend ja faz

- cria perfil interno com `fullName`, `phone`, `role`, `documentType`, `documentNumber`, `companyName`
- impede criar perfil duplicado para o mesmo auth user
- adiciona role na tabela `profile_roles`
- se a role for `customer`, garante registro em `customers`
- grava auditoria de criacao

### Rotas

- `POST /v1/auth/profile`
- `PATCH /v1/auth/profile`

### Persistencia e integracoes

- `profiles`
- `profile_roles`
- `customers`
- `audit_events`

### Regras relevantes

- tipos publicos aceitos hoje: `customer`, `partner`, `dentist`, `lab`, `admin`
- `admin` nao deveria ser publico do ponto de vista de produto, mas a rota aceita esse valor

### Prontidao para frontend

Pronto para o cadastro Nexor do MVP1.

### Pontos de atencao

- o frontend deve decidir se realmente expora `dentist`, `partner` e `lab` no cadastro inicial ou se usara isso apenas em onboarding operacional
- vale endurecer no futuro a criacao publica de `admin`

## 3. Validacao de CPF/CNPJ no cadastro

### Objetivo

Evitar cadastro duplicado de documento.

### O que o backend ja faz

- recebe `role` + `document`
- decide se a validacao e por CPF ou CNPJ conforme o papel
- procura duplicidade em `profiles`, `partners`, `laboratories`
- tambem varre `user_metadata` do Supabase Auth com `auth.admin.listUsers`

### Rotas

- `POST /v1/auth/validate-registration-identifier`

### Persistencia e integracoes

- `profiles`
- `partners`
- `laboratories`
- Supabase Auth Admin API

### Prontidao para frontend

Pronto para validacao pre-submit no cadastro Nexor.

## 4. Consentimentos de conta Nexor

### Objetivo

Persistir aceite de termos, privacidade e marketing da conta global Nexor.

### O que o backend ja faz

- registra consentimentos por perfil autenticado
- lista consentimentos ja gravados
- captura `ipAddress` no backend
- possui auditoria quando o consentimento passa via `ProfileService`

### Rotas

- `GET /v1/auth/consents`
- `POST /v1/auth/consents`
- `POST /v1/account/consents`

### Persistencia e integracoes

- `account_consents`
- `audit_events`

### Observacao importante

Existem duas formas de gravar consentimento:

- `POST /v1/auth/consents` para um aceite unitario com auditoria no service
- `POST /v1/account/consents` para lote de consentimentos

Para frontend Nexor, a rota mais alinhada com o sprint atual e `POST /v1/account/consents`.

### Prontidao para frontend

Pronto.

## 5. Onboarding operacional de dentista, parceiro e laboratorio

### Objetivo

Permitir que um usuario com conta Nexor solicite entrada como ator operacional do Biteplaner.

### O que o backend ja faz

- dentista: cria ou reaproveita registro em `dentists`, adiciona role `dentist`
- parceiro: cria ou reaproveita registro em `partners`, gera `partnerCode`, adiciona role `partner`
- laboratorio: cria ou reaproveita registro em `laboratories`, adiciona role `lab`
- todos geram auditoria

### Rotas

- `POST /v1/auth/onboarding/dentist`
- `POST /v1/auth/onboarding/partner`
- `POST /v1/auth/onboarding/lab`

### Persistencia e integracoes

- `dentists`
- `partners`
- `laboratories`
- `profile_roles`
- `audit_events`

### Regras relevantes

- dentista entra como `approvalStatus: pending`
- parceiro entra como `status: inactive`
- laboratorio entra como `status: pending`

### Prontidao para frontend

Pronto para telas de onboarding operacional.

### Gap funcional

- aprovacao/licenciamento continua administrativa, nao automatica

## 6. Catalogo de produtos Nexor

### Objetivo

Expor quais produtos a conta Nexor pode acessar.

### O que o backend ja faz

- retorna lista de produtos ativos

### Rotas

- `GET /v1/products`

### Persistencia e integracoes

- sem tabela de catalogo hoje
- retorno hardcoded no repository

### Prontidao para frontend

Pronto para MVP, mas limitado.

### Gap funcional

- hoje o catalogo nao e dinamico
- so existe `biteplaner`

## 7. Enrollment do Biteplaner

### Objetivo

Criar o vinculo entre conta Nexor e o produto Biteplaner antes ou durante a jornada do produto.

### O que o backend ja faz

- exige que a conta ja tenha `profile`
- lista enrollments da conta
- retorna enrollment especifico do Biteplaner
- cria enrollment do Biteplaner de forma idempotente
- aceita `inviteToken` para atribuicao comercial
- aceita `orderDraftId` para vincular contexto de jornada
- grava auditoria

### Rotas

- `GET /v1/account/product-enrollments`
- `GET /v1/products/biteplaner/enrollment`
- `POST /v1/products/biteplaner/enrollments`

### Persistencia e integracoes

- `product_enrollments`
- `partners`
- `partner_invite_links`
- `audit_events`

### Como funciona hoje

- se o usuario ja estiver inscrito, o backend retorna o enrollment existente
- se vier `inviteToken`, o backend valida o token e salva `source_type = partner_invite`
- se vier `orderDraftId`, salva isso em `metadata`

### Diagnostico de prontidao

Sim, o backend ja esta preparado para enrollment do MVP1.

### O que falta para o frontend explorar

- Nexor: chamar enrollment depois do cadastro/login quando o contexto for Biteplaner
- Biteplaner: usar o enrollment como pre-condicao de entrada na jornada de compra

## 8. Referral e links de parceiro

### Objetivo

Rastrear origem comercial de usuarios indicados por parceiros.

### O que o backend ja faz

- lista parceiros ativos publicos
- valida token publico de convite
- parceiro autenticado pode gerar seus proprios links
- token pode ser consumido quando a ordem e criada a partir do draft

### Rotas

- `GET /v1/partners`
- `GET /v1/partner-invite-links/:token/validate`
- `GET /v1/partner/invite-links`
- `POST /v1/partner/invite-links`

### Persistencia e integracoes

- `partners`
- `partner_invite_links`
- `audit_events`

### Como funciona hoje

- token pode ficar `valid`, `invalid`, `expired` ou `consumed`
- ao gerar ordem autenticada a partir de um draft, o link pode ser marcado como consumido

### Prontidao para frontend

Pronto para capturar `ref` e validar campanha/QR code.

## 9. Descoberta de rede assistencial

### Objetivo

Listar quem pode operar o Biteplaner no MVP.

### O que o backend ja faz

- lista consultorios ativos e licenciados
- lista practice locations ativas com endereco estruturado
- filtra apenas dentistas ativos, aprovados e licenciados

### Rotas

- `GET /v1/clinics`
- `GET /v1/practice-locations`

### Persistencia e integracoes

- `clinics`
- `dentist_practice_locations`
- `dentists`
- `addresses`

### Prontidao para frontend

Pronto para mapa/listagem de local de atendimento.

### Observacao

- o fluxo preferencial novo e por `practice-location`, nao mais por `clinic`

## 10. Entrada publica na jornada: order draft

### Objetivo

Permitir que o usuario salve contexto da jornada Biteplaner antes do login, especialmente local de atendimento e referral.

### O que o backend ja faz

- cria draft publico com `practiceLocationId`
- opcionalmente valida `inviteToken`
- salva `dentistId`, `partnerId` e `partnerInviteLinkId`
- permite retomar o draft depois
- grava auditoria

### Rotas

- `POST /v1/order-drafts`
- `GET /v1/order-drafts/:draftId`

### Persistencia e integracoes

- `order_drafts`
- `dentist_practice_locations`
- `partner_invite_links`
- `audit_events`

### Prontidao para frontend

Pronto para o fluxo publico Nexor/Biteplaner anterior ao login.

## 11. Criacao da ordem Biteplaner

### Objetivo

Criar a ordem central da jornada depois da autenticacao.

### O que o backend ja faz

- cria ordem autenticada para o proprio perfil
- pode herdar `partnerId`, `practiceLocationId` e `dentistId` a partir do draft
- inicia a ordem em `awaiting_payment`
- grava evento de status e auditoria
- consome o invite link quando o draft veio de referral

### Rotas

- `POST /v1/orders`
- `GET /v1/orders`
- `GET /v1/orders/:orderId`
- `GET /v1/orders/:orderId/timeline`

### Persistencia e integracoes

- `orders`
- `order_status_events`
- `audit_events`
- `order_drafts`

### Prontidao para frontend

Pronto.

### Observacoes

- listagem ja respeita visao por role: admin, dentista, parceiro, lab ou cliente
- parceiros nao podem ler timeline

## 12. Pagamento do MVP

### Objetivo

Destravar a jornada de compra mesmo sem gateway real.

### O que o backend ja faz

- cria `payment_intent` stub
- lista resumo de pagamentos
- admin pode confirmar pagamento manualmente
- a confirmacao move a ordem para `payment_confirmed` e depois `awaiting_scheduling`

### Rotas

- `POST /v1/orders/:orderId/payment-intents`
- `GET /v1/orders/:orderId/payments-summary`
- `POST /v1/admin/orders/:orderId/payment-confirmation`

### Persistencia e integracoes

- `payments`
- `orders`
- `order_status_events`
- `audit_events`

### Diagnostico

Backend pronto para MVP assistido, nao para checkout real.

### Gap funcional

- sem PSP real
- sem webhook
- sem antifraude
- sem conciliacao

## 13. Selecao de dentista e local de atendimento

### Objetivo

Depois do pagamento, permitir que o usuario selecione o local operacional correto.

### O que o backend ja faz

- valida que a ordem esta apta para a selecao
- valida que o local e ativo e vinculado a dentista apto
- salva `practiceLocationId` e `dentistId` na ordem
- mantem rota legada por `clinicId`

### Rotas

- `POST /v1/orders/:orderId/practice-location-selection`
- `POST /v1/orders/:orderId/clinic-selection`

### Persistencia e integracoes

- `orders`
- `dentist_practice_locations`
- `clinics`
- `dentists`
- `audit_events`

### Prontidao para frontend

Pronto, e o frontend deve priorizar `practice-location-selection`.

## 14. Vinculacao operacional da consulta inicial

### Objetivo

Refletir a regra de negocio do MVP: a consulta e combinada fora do sistema, mas precisa ser vinculada pelo dentista para a ordem continuar.

### O que o backend ja faz

- so dentista vinculado pode executar
- valida cliente, ordem e local
- cria ou reaproveita appointment inicial
- move a ordem para `in_progress`
- libera workflow form `customer_pre_consultation_intake`
- cria evento de notificacao
- grava auditoria

### Rotas

- `POST /v1/orders/:orderId/initial-consultation-link`

### Persistencia e integracoes

- `appointments`
- `orders`
- `form_submissions`
- `notification_events`
- `audit_events`

### Diagnostico

Esta e uma das partes mais maduras do backend. O modelo esta coerente com o contexto de negocio.

## 15. Appointments e confirmacao de comparecimento

### Objetivo

Gerenciar adaptacao, follow-up e confirmacao operacional da consulta.

### O que o backend ja faz

- cria appointments de adaptacao e follow-up
- lista e atualiza appointments
- cliente confirma presenca
- dentista confirma atendimento
- completa match entre as duas confirmacoes
- no-show do dentista devolve a ordem para `awaiting_scheduling`

### Rotas

- `POST /v1/orders/:orderId/appointments`
- `GET /v1/orders/:orderId/appointments`
- `PATCH /v1/orders/:orderId/appointments/:appointmentId`
- `POST /v1/orders/:orderId/appointments/:appointmentId/user-confirmation`
- `POST /v1/orders/:orderId/appointments/:appointmentId/dentist-confirmation`
- `POST /v1/orders/:orderId/appointments/:appointmentId/complete-match`
- `POST /v1/orders/:orderId/appointments/:appointmentId/no-show`

### Persistencia e integracoes

- `appointments`
- `orders`
- `order_status_events`
- `notification_events`
- `audit_events`

### Prontidao para frontend

Pronto para paineis do cliente e do dentista.

## 16. Workflow forms operacionais

### Objetivo

Suportar formularios operacionais e de feedback por etapa da jornada, com controle de visibilidade e versionamento.

### O que o backend ja faz

- lista workflow forms da ordem
- esconde payload quando o ator nao pode ver
- suporta `draft`, `submit` e `revise`
- cria historico em `form_submission_versions`
- libera formularios por etapa
- ja suporta templates:
  - `customer_pre_consultation_intake`
  - `dentist_review_by_customer`
  - `lab_review_by_dentist`
  - `dentist_review_by_lab`

### Rotas

- `GET /v1/orders/:orderId/workflow-forms`
- `GET /v1/orders/:orderId/workflow-forms/:workflowFormId`
- `POST /v1/orders/:orderId/workflow-forms/:workflowFormId/submit`
- `PATCH /v1/orders/:orderId/workflow-forms/:workflowFormId/draft`
- `POST /v1/orders/:orderId/workflow-forms/:workflowFormId/revise`
- `POST /v1/orders/:orderId/workflow-forms/release`
- `GET /v1/admin/workflow-forms`

### Persistencia e integracoes

- `form_submissions`
- `form_submission_versions`
- `workflow_step_form_templates`
- `form_templates`
- `form_template_versions`
- `audit_events`

### Diagnostico

Backend bastante preparado para UXs mais ricas de operacao.

### Gap funcional

- notificacao ainda e apenas evento interno
- o frontend ainda nao aproveita esse modelo

## 17. Avaliacao clinica, anamnese e pedido de producao

### Objetivo

Permitir que o dentista registre desfecho clinico e formularios principais do ciclo odontologico.

### O que o backend ja faz

- registra avaliacao clinica `eligible/ineligible`
- registra inaptidao separadamente
- cria formularios de `anamnesis`, `production_request` e `follow_up`
- permite versao nova de formulario
- restringe leitura e escrita de formularios clinicos a dentistas

### Rotas

- `POST /v1/orders/:orderId/clinical-evaluation`
- `POST /v1/orders/:orderId/ineligibility`
- `POST /v1/orders/:orderId/forms/anamnesis`
- `POST /v1/orders/:orderId/forms/production-request`
- `POST /v1/orders/:orderId/forms/follow-up`
- `GET /v1/orders/:orderId/forms`
- `GET /v1/orders/:orderId/forms/:formId`
- `PATCH /v1/orders/:orderId/forms/:formId`

### Persistencia e integracoes

- `orders`
- `forms`
- `order_status_events`
- `audit_events`

### Diagnostico

Pronto para MVP assistido, com boa separacao entre dado clinico e visoes administrativas.

## 18. Inaptidao e ressarcimento

### Objetivo

Encerrar a jornada produtiva quando o paciente for inapto e permitir tratamento administrativo do reembolso.

### O que o backend ja faz

- registra inaptidao na ordem
- move a ordem para `ineligible_refund`
- cria refund
- lista refunds para admin
- atualiza status de refund

### Rotas

- `POST /v1/orders/:orderId/ineligibility`
- `POST /v1/orders/:orderId/refunds`
- `GET /v1/admin/refunds`
- `PATCH /v1/admin/refunds/:refundId`

### Persistencia e integracoes

- `orders`
- `refunds`
- `audit_events`

### Diagnostico

Pronto para operacao interna. Ainda nao ha integracao financeira real de devolucao.

## 19. Laboratorio, recebimento, adaptacao e follow-up

### Objetivo

Cobrir a metade final da jornada Biteplaner depois da aprovacao clinica.

### O que o backend ja faz

- registra dispatch ao lab como evento operacional
- registra recebimento do produto
- avanca a ordem para `awaiting_adaptation`
- libera workflow forms de feedback do ciclo de laboratorio
- conclui adaptacao
- agenda automaticamente retornos de 3, 6 e 9 meses
- conclui a ordem

### Rotas

- `POST /v1/orders/:orderId/lab-dispatch`
- `POST /v1/orders/:orderId/product-received`
- `POST /v1/orders/:orderId/adaptation-completed`
- `POST /v1/orders/:orderId/follow-ups/schedule`
- `POST /v1/orders/:orderId/complete`

### Persistencia e integracoes

- `orders`
- `appointments`
- `form_submissions`
- `notification_events`
- `audit_events`

### Diagnostico

Pronto para MVP operacional/manual.

### Gap funcional

- sem portal de laboratorio realmente integrado
- sem disparo real de mensagens de acompanhamento

## 20. Admin de perfis Nexor

### Objetivo

Dar governanca sobre contas e acessos do ecossistema.

### O que o backend ja faz

- lista perfis com filtro
- altera status de perfil
- respeita role `admin`
- grava auditoria

### Rotas

- `GET /v1/admin/profiles`
- `PATCH /v1/admin/profiles/:profileId/status`

### Persistencia e integracoes

- `profiles`
- `profile_roles`
- `audit_events`

### Prontidao para frontend

Pronto para painel admin da Nexor/Biteplaner.

## 21. Admin operacional de parceiros, dentistas, locais e laboratorios

### Objetivo

Permitir montar e governar a rede operacional do Biteplaner.

### O que o backend ja faz

- cria, lista e atualiza parceiros
- cria e atualiza clinics legadas
- cria, lista e atualiza dentistas
- cria e atualiza practice locations
- garante uma practice location por dentista no MVP atual
- lista e atualiza laboratorios
- grava auditoria em todas as acoes relevantes

### Rotas

- `POST /v1/admin/partners`
- `GET /v1/admin/partners`
- `PATCH /v1/admin/partners/:partnerId`
- `POST /v1/admin/clinics`
- `PATCH /v1/admin/clinics/:clinicId`
- `POST /v1/admin/clinics/:clinicId/dentists`
- `POST /v1/admin/dentists`
- `GET /v1/admin/dentists`
- `PATCH /v1/admin/dentists/:dentistId`
- `POST /v1/admin/dentists/:dentistId/practice-locations`
- `PATCH /v1/admin/practice-locations/:practiceLocationId`
- `PATCH /v1/admin/laboratories/:laboratoryId`
- `GET /v1/admin/laboratories`

### Persistencia e integracoes

- `partners`
- `clinics`
- `dentists`
- `dentist_practice_locations`
- `addresses`
- `laboratories`
- `audit_events`

### Diagnostico

Backend forte nessa frente; o frontend admin e que ainda precisa acompanhar.

## 22. Auditoria e notificacoes internas

### Objetivo

Garantir rastreabilidade e fila operacional.

### O que o backend ja faz

- grava eventos em `audit_events`
- minimiza dados pessoais em metadata textual
- lista auditoria para admin
- registra eventos de notificacao
- permite marcar notificacao como despachada

### Rotas

- `GET /v1/admin/audit-events`
- `GET /v1/admin/notification-events`
- `POST /v1/admin/notification-events/:eventId/mark-dispatched`

### Persistencia e integracoes

- `audit_events`
- `notification_events`

### Diagnostico

Pronto para operacao interna, mas ainda sem canal externo automatizado.

## 23. Controle de status da ordem

### Objetivo

Impedir saltos invalidos na jornada.

### O que o backend ja faz

- aplica maquina de estados com transicoes permitidas
- registra status events
- impede usar atualizacao manual para burlar a liberacao de pagamento

### Status implementados

- `registration_started`
- `awaiting_payment`
- `payment_confirmed`
- `awaiting_scheduling`
- `in_progress`
- `appointment_confirmed`
- `ineligible_refund`
- `lab_processing`
- `product_received_by_clinic`
- `awaiting_adaptation`
- `follow_up`
- `completed`
- `cancelled`

### Diagnostico

Esse eixo do backend esta consistente e ja bem alinhado com o contexto de negocio do Biteplaner.

## O que os frontends precisam evoluir primeiro

## Prioridades para o frontend Nexor

1. login e sessao baseados em `GET /v1/auth/me`
2. cadastro completo usando `POST /v1/auth/profile`
3. consentimentos usando `POST /v1/account/consents`
4. dashboard `/conta` consumindo `GET /v1/products` e `GET /v1/account/product-enrollments`
5. quando houver contexto Biteplaner, criar enrollment com `POST /v1/products/biteplaner/enrollments`

## Prioridades para o frontend Biteplaner

1. fluxo publico de descoberta de local com `GET /v1/practice-locations`
2. criacao e retomada de `order-drafts`
3. criacao de ordem autenticada
4. tela de pagamento manual/MVP e acompanhamento de status
5. escolha de local e dentista apos confirmacao de pagamento
6. portal do dentista para `initial-consultation-link`
7. telas de workflow forms
8. telas de formularios clinicos
9. paineis admin para perfis, parceiros, dentistas, laboratorios, refunds e notificacoes

## Diagnostico final por maturidade

### Ja pronto para consumo imediato de frontend

- auth base
- perfil Nexor
- consentimentos
- enrollment Biteplaner
- referral
- listagem de practice locations
- order drafts
- criacao e consulta de ordens
- pagamento manual/stub
- appointments operacionais
- admin de perfis e rede

### Pronto, mas exige UX operacional mais elaborada

- workflow forms
- formularios clinicos
- inaptidao e refunds
- acompanhamento de laboratorio/adaptacao/follow-up
- notificacoes internas

### Ainda depende de integracao futura

- checkout/pagamento real
- envio real de e-mail/notificacao
- automacoes de agenda
- catalogo multi-produto dinamico
- portais externos realmente integrados para laboratorio

## Base usada para este mapeamento

- `project/backend/api/src/routes/`
- `project/backend/api/src/services/`
- `project/backend/api/src/repositories/`
- `project/backend/api/src/types/biteplaner.ts`
- `project/backend/api/tests/services/`
- `.ai/context/business/nexor/institutional-site.md`
- `.ai/context/business/biteplaner/product-flow.md`
- `docs/superpowers/specs/2026-04-29-sprint-1-nexor-conta-auth-design.md`
