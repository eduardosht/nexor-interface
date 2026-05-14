# Plano de Sprints Nexor/Biteplaner

Este markdown organiza os proximos ciclos da plataforma Nexor com o produto Biteplaner em duas frentes de trabalho:

- **Dev Frontend:** experiencia do usuario, conta Nexor, entrada multi-produto, paineis Biteplaner, rotas, formularios, estados de tela, integracao com API e qualidade visual.
- **Dev Backend/Infra:** API, Supabase, auth, autorizacao, accounts, product enrollments, migrations, auditoria, dados, seguranca, LGPD, integracoes, deploy e observabilidade.

O backend tambem assume a frente de infraestrutura do projeto: ambientes, variaveis, banco, policies, CI/CD, storage futuro, integracoes externas, verificacoes de seguranca e suporte aos contratos que o frontend consome.

## Decisao De Arquitetura Do Produto

A Nexor passa a ser a camada de identidade, cadastro e entrada multi-produto. O Biteplaner deixa de possuir cadastro primario de usuario final e passa a consumir contas Nexor inscritas no produto.

Spec tecnica de migracao: `.ai/specs/nexor-platform/account-product-enrollment-migration.md`.

Fronteira recomendada:

| Camada | Responsabilidade |
|---|---|
| Nexor | cadastro, login, sessao, perfil basico, consentimentos gerais, preferencias e selecao/entrada em produtos |
| Inscricao em produto | vinculo entre conta Nexor e produto especifico, preservando contexto de origem/referral |
| Biteplaner | ordem, compra, rede odontologica, parceiros, dentistas, locais, laboratorios, formularios, producao e acompanhamento |

Dentistas, parceiros e laboratorios podem usar conta Nexor para login, mas seus perfis operacionais, aprovacoes, licencas e permissoes pertencem ao Biteplaner.

## Estado Atual Do Projeto

### Ja implementado ou adiantado

**Backend/API**

- API Fastify com TypeScript strict, plugins de seguranca, CORS, rate limit, `/health`, env validation e handler de erro seguro.
- Supabase encapsulado em integrations/repositories.
- Migrations iniciais para core Biteplaner, alinhamentos de Sprint 1, rascunhos de pedido, convites de parceiro, painel admin, CNPJ/local unico, workflow forms e unicidade de identificadores.
- Rotas de auth: `/v1/auth/me`, perfil, consentimentos, validacao de CPF/CNPJ e onboarding de dentista/parceiro/laboratorio.
- Rotas de produtos Nexor: `/v1/products`, `/v1/account/product-enrollments` e inscricao Biteplaner.
- Rotas operacionais/admin para parceiros, consultorios, dentistas, locais de atendimento, laboratorios e invite links.
- Rotas de ordens: draft publico, criacao/listagem/detalhe, timeline, pagamento stub, selecao de local, vinculo operacional da consulta inicial, appointments, avaliacao clinica, inaptidao e workflow forms.
- Services/repositories para auth, profile, operations, orders, auditoria e transicoes de status.
- Testes de compliance, autorizacao, services de order/profile/operations e maquina de status.

**Frontend Biteplaner**

- Landing publica, paginas legais, pagina de parceiros e cadastro de parceiros.
- Cadastro/onboarding, resumo de rascunho de pedido, reset password e login.
- Auth provider, guards por sessao/role e rotas protegidas.
- Paineis iniciais para cliente, parceiro, dentista, laboratorio e admin.
- Layouts de painel, status labels, mascaras/validadores de CPF/CNPJ, client API e storage de order draft.
- Testes de componentes, rotas, paginas, status labels, env, storage e formularios de workflow.

### Lacunas e riscos atuais

- O funil de cadastro precisa sair do escopo do Biteplaner e virar conta Nexor.
- Falta modelo explicito de `product_enrollments` ou equivalente para vincular conta Nexor ao Biteplaner.
- Base tecnica de `product_enrollments` ja foi iniciada no backend; ainda falta conectar frontend Nexor/Biteplaner e usar esse vinculo na criacao de ordem.
- Referral/QR Biteplaner precisa atravessar a entrada Nexor sem perder origem comercial.
- O fluxo real de ponta a ponta ainda precisa ser consolidado: entrada por referral, conta Nexor, inscricao Biteplaner, ordem, pagamento, selecao de local, vinculo da consulta e handoff para dentista.
- Pagamento ainda esta em modo stub/manual; falta decidir ou integrar provedor real.
- O frontend tem muitos paineis estruturais, mas varias telas ainda sao placeholders ou precisam consumir dados reais.
- A regra de negocio diz que nao havera `clinic_admin` no MVP; qualquer rota/guard ou permissao que ainda aceite esse papel deve ser revisada.
- A arquitetura de formularios e specs citadas no sprint ainda precisam existir formalmente em `.ai/`, ou o sprint deve parar de apontar para arquivos ausentes.
- Notificacoes, ressarcimento real, laboratorio operacional completo, adaptacao e acompanhamento 3/6/9 meses ainda nao estao prontos para operacao real.

## Papel Dos Devs

### Dev 1 - Frontend

Responsavel por transformar o fluxo Biteplaner em uma experiencia clara, premium e operacionalmente utilizavel. Este dev deve cuidar das rotas, telas, componentes, integracao com API, estados de loading/erro/vazio, acessibilidade, responsividade, testes de UI e consistencia com `.ai/design-system/`.

Na pratica, o Dev Frontend deve:

- migrar cadastro/login/conta para a experiencia Nexor;
- preservar contexto de produto e referral ao entrar no Biteplaner;
- mapear cada etapa da jornada para uma tela ou estado de painel;
- consumir os contratos publicados pelo backend sem duplicar regra sensivel no browser;
- garantir que cliente, parceiro, dentista, laboratorio e admin vejam apenas o que precisam;
- manter textos de finalidade/consentimento claros, sem expor dado sensivel desnecessario;
- transformar placeholders em fluxos reais conforme o backend liberar endpoints;
- manter builds e testes do frontend passando.

### Dev 2 - Backend E Infra

Responsavel pela fronteira confiavel do produto. Este dev deve implementar API, banco, migrations, RLS/policies, repositories, services, auth, autorizacao, auditoria, LGPD, pagamento, notificacoes, integracoes, ambientes, CI/CD e hardening.

Na pratica, o Dev Backend/Infra deve:

- separar identidade Nexor de dominio operacional Biteplaner;
- criar modelo de inscricao/vinculo por produto;
- modelar dados e transicoes da ordem com migrations auditaveis;
- validar toda entrada externa com schemas;
- manter Supabase service role apenas no backend;
- implementar autorizacao por role e por ownership em todos os casos sensiveis;
- registrar auditoria persistida para acoes relevantes;
- criar contratos estaveis para o frontend e documentar mudancas;
- cuidar de infra, variaveis, deploy, logs, audit, secrets e testes de seguranca;
- manter builds, testes e verificacoes de backend passando.

## Proximos Passos Imediatos

1. **Criar a fundacao Nexor Account:** cadastro, login, perfil basico, consentimentos gerais e area minima de conta na Nexor.
2. **Criar inscricao em produto:** modelar como uma conta Nexor entra no Biteplaner e como referral/QR e preservado.
3. **Remover cadastro primario do Biteplaner:** transformar cadastro/onboarding Biteplaner em handoff para Nexor + inscricao no produto.
4. **Alinhar roles:** separar roles globais Nexor de papeis operacionais Biteplaner e remover/justificar qualquer uso de `clinic_admin`.
5. **Fechar contratos frontend/backend:** listar endpoints usados em cada tela e marcar o que e Nexor, Biteplaner, real, mockado ou placeholder.
6. **Priorizar Sprint 0/1/2 antes de expandir telas:** consolidar conta Nexor, product enrollment, order draft, criacao de ordem e pagamento antes de aprofundar laboratorio/acompanhamento.

## Sprint 0 - Plataforma Nexor, Decisoes E Especificacao

**Objetivo:** fechar regras sensiveis antes de codar ou expandir fluxos com dados pessoais, pagamento, saude e auditoria.

### Dev Frontend

- [ ] Mapear a jornada atual em telas: Nexor landing, Nexor cadastro/login/conta, entrada Biteplaner, resumo do pedido, checkout/status, selecao de local, portal do cliente, portal do dentista e admin.
- [ ] Identificar telas que ainda sao placeholder e classificar como: manter, conectar a API, redesenhar ou remover do MVP.
- [ ] Definir textos de finalidade, consentimento e proxima etapa para conta Nexor, inscricao Biteplaner e pre-consulta.
- [ ] Conferir rotas e guards contra a regra de roles do MVP.
- [ ] Documentar dependencias de API por tela.

### Dev Backend/Infra

- [ ] Formalizar modelo de conta Nexor, inscricao em produto e papeis operacionais Biteplaner.
- [x] Usar `.ai/specs/nexor-platform/account-product-enrollment-migration.md` como contrato de migracao inicial.
- [ ] Definir o que fica em `accounts/profiles` globais e o que fica em tabelas Biteplaner.
- [ ] Revisar e remover dependencias de `clinic_admin` se nao houver decisao explicita para mante-lo.
- [ ] Documentar maquina de status da ordem e transicoes autorizadas.
- [ ] Documentar politica inicial de pagamento stub/manual e ressarcimento por inaptidao.
- [ ] Criar specs ausentes em `.ai/` para formularios, permissao por ator, pagamento e ressarcimento.
- [ ] Classificar risco LGPD/seguranca por feature.

### Criterio de pronto

- Fluxo MVP curto confirmado: conta Nexor -> inscricao Biteplaner -> ordem -> pagamento -> local -> consulta.
- Roles globais e papeis Biteplaner alinhados entre negocio, backend e frontend.
- Specs minimas registradas para features sensiveis.
- Nenhuma tela nova depende de regra sensivel nao documentada.

## Sprint 1 - Conta Nexor, Auth E Admin

**Objetivo:** estabilizar cadastro/login/sessao na Nexor, roles globais, auditoria e painel admin basico.

**Spec tecnica:** `docs/superpowers/specs/2026-04-29-sprint-1-nexor-conta-auth-design.md`

### Decisoes fechadas neste sprint

- Formulario de cadastro em 3 passos: selecao de tipo de conta → dados + documento → consentimentos gerais.
- Regra de documento por tipo: `customer` e `dentist` usam CPF; `partner` e `lab` usam CNPJ + razao social.
- `clinic_admin` removido — sem decisao de manter no MVP.
- Roles validas: `customer | partner | dentist | lab | admin`.
- Sessao compartilhada via Supabase client com mesma project key; URL da Nexor configurada por `VITE_NEXOR_URL` no Biteplaner.
- Referral (`ref`) preservado em `sessionStorage` durante cadastro/login na Nexor e repassado ao enrollment Biteplaner.
- Card de produto em `/conta` exibido sem verificar enrollment — enrollment tratado no Sprint 2.
- Admin criado via seed script; sem rota publica de cadastro de admin.
- Consentimentos gerais persistidos em tabela `account_consents` com campos: `profile_id`, `consent_type`, `accepted`, `accepted_at`, `ip_address`.
- Auditoria persistida em tabela existente (ou nova) com campos: `actor_id`, `event_type`, `payload jsonb`, `created_at`.
- `phone` nao coletado no cadastro; editavel em `/conta` pos-registro.
- `status` inicial de todo novo perfil: `active`; perfil `blocked` rejeitado pelo middleware com 403.
- Se a confirmacao de e-mail do Supabase estiver habilitada, o cadastro deve aceitar `session = null` como sucesso parcial, orientar verificacao do inbox e concluir perfil/consentimentos automaticamente no primeiro acesso autenticado.

### Status atual

- Auth, profile, consentimentos, roles e guards ja existem em algum nivel, mas estao acoplados ao front Biteplaner e precisam ser reposicionados como Nexor Account.
- Admin possui rotas/paginas iniciais e endpoints administrativos.
- Ainda falta confirmar a robustez ponta a ponta: login real, sessao, autorizacao, erro, refresh, logout, auditoria e testes integrados.

### Artefatos da Sprint 1

- Plano de execucao:
  - `docs/superpowers/plans/2026-04-29-sprint-1-nexor-conta-auth.md`
- Spec tecnica:
  - `docs/superpowers/specs/2026-04-29-sprint-1-nexor-conta-auth-design.md`
- Checklist operacional:
  - `docs/superpowers/plans/2026-04-29-sprint-1-nexor-conta-auth-checklist.md`
- Runbook de homologacao:
  - `docs/superpowers/plans/2026-04-29-sprint-1-nexor-conta-auth-homologation-runbook.md`
- Runbook de producao:
  - `docs/superpowers/plans/2026-04-29-sprint-1-nexor-conta-auth-production-runbook.md`
- Resumo de entrega:
  - `docs/superpowers/plans/2026-04-29-sprint-1-nexor-conta-auth-delivery-summary.md`

### Dev Frontend

- [ ] Criar rotas `/entrar`, `/cadastro`, `/recuperar-senha` e `/conta` no frontend Nexor.
- [ ] Implementar formulario de cadastro em 3 passos com regra de documento por tipo de conta.
- [ ] Integrar login, logout, reset e sessao com Supabase Auth como conta Nexor.
- [ ] Preservar query param `ref` em `sessionStorage` durante cadastro/login na Nexor.
- [ ] Criar pagina `/conta` com card de entrada para o Biteplaner e botao de logout.
- [ ] Atualizar `AuthGuard` e `RoleGuard` no Biteplaner para redirecionar para `VITE_NEXOR_URL`.
- [ ] Desativar `RegisterPage` e `OnboardingPage` do Biteplaner como entrada primaria.
- [ ] Cobrir fluxos negativos de login, permissao e documento invalido em testes.

### Dev Backend/Infra

- [ ] Adicionar `document_type`, `document_number`, `company_name` em `profiles` se ausentes; garantir `status = active` no registro.
- [ ] Remover `clinic_admin` de todas as policies RLS, guards, middlewares e seeds.
- [ ] Validar middleware de auth: 401 para token ausente/invalido, 403 para role incorreta ou perfil bloqueado.
- [ ] Garantir autorizacao por role e ownership nos endpoints admin, operations e orders.
- [ ] Criar ou validar tabela de auditoria; persistir eventos de login, perfil, consentimento e acoes admin.
- [ ] Criar tabela `account_consents` e endpoint autenticado para registrar consentimentos.
- [ ] Revisar RLS/policies Supabase para remover `clinic_admin` e validar isolamento de `profiles` e `product_enrollments`.
- [ ] Criar seed script para admin (`scripts/seed-admin.ts`) e documentar no README.
- [ ] Atualizar `.env.example` com todas as variaveis incluindo `VITE_NEXOR_URL`.
- [ ] Rodar build/test/audit do backend e corrigir falhas.

### Criterio de pronto

- Usuario se cadastra pela Nexor com tipo e documento corretos, faz login, chega em `/conta` e entra no Biteplaner sem novo login.
- Backend rejeita token ausente/invalido e role incorreta com erro seguro; perfil bloqueado recebe 403.
- `clinic_admin` removido de todo o codebase.
- Auditoria basica e consentimentos persistidos.
- RLS nao permite leitura cruzada de perfis e enrollments.
- Seed de admin documentado e funcional.
- Builds e testes dos dois frontends e do backend passando.

## Sprint 2 - Inscricao Biteplaner, Referral E Ordem Inicial

**Objetivo:** consolidar o inicio real da jornada Biteplaner a partir da conta Nexor: referral/QR, product enrollment, consentimentos especificos, order draft e criacao da ordem.

### Status atual

- Ja existem order drafts, partner invite links, validacao semantica de invite, cadastro/onboarding e criacao de ordem.
- Ainda falta mover cadastro primario para Nexor, criar o conceito explicito de inscricao no Biteplaner e remover ambiguidades entre conta, local, draft e ordem.

### Dev Frontend

- [ ] Capturar `invite`/slug/query param na Nexor e preservar durante cadastro/login.
- [ ] Exibir feedback para referral valido, invalido, expirado ou consumido.
- [ ] Criar handoff Nexor -> Biteplaner com contexto de produto e referral.
- [ ] Separar consentimentos gerais Nexor de consentimentos especificos Biteplaner.
- [ ] Conectar resumo do order draft com inscricao Biteplaner e criacao de ordem autenticada.
- [ ] Criar tela de handoff pos-cadastro com proxima acao clara.
- [ ] Garantir que consentimentos de cadastro nao se misturem com formularios futuros da jornada.

### Dev Backend/Infra

- [x] Criar entidade/contrato de inscricao em produto para conta Nexor.
- [ ] Fechar contrato publico de validacao de referral/invite preservavel pela Nexor.
- [ ] Garantir que order draft nao permita vazamento de dados ou manipulacao de local/parceiro.
- [ ] Criar ou revisar transacao de inscricao Biteplaner e criacao de ordem com historico inicial, origem comercial e consentimentos.
- [ ] Garantir unicidade e normalizacao de CPF/CNPJ onde aplicavel.
- [ ] Testar casos negativos: invite expirado/consumido/invalido, draft inexistente, usuario sem perfil e role indevida.
- [ ] Documentar payloads e respostas esperadas para o frontend.

### Criterio de pronto

- Um usuario consegue entrar por referral, criar/usar conta Nexor, inscrever-se no Biteplaner, criar ordem e saber a proxima etapa sem ambiguidade.
- Parceiro e origem comercial ficam rastreados sem expor dados sensiveis indevidos.
- Testes cobrem os principais erros do fluxo.

## Sprint 3 - Compra, Pagamento E Confirmacao Financeira

**Objetivo:** permitir compra, status financeiro e avanco seguro para selecao de local.

### Dev Frontend

- [ ] Criar tela de checkout para o produto Biteplaner de R$ 400.
- [ ] Exibir desconto de 10% quando houver referral valido e regra aplicavel.
- [ ] Criar tela de status de pagamento: pendente, aprovado, falhado e manual em analise.
- [ ] Bloquear selecao de local antes de pagamento confirmado.
- [ ] Exibir mensagem clara sobre avaliacao odontologica e ressarcimento por inaptidao.

### Dev Backend/Infra

- [ ] Consolidar modelo de produto/preco/desconto/comissao.
- [ ] Evoluir pagamento stub/manual ou integrar provedor escolhido.
- [ ] Criar webhook/endpoint administrativo de confirmacao financeira, se o MVP continuar manual.
- [ ] Registrar eventos financeiros auditaveis sem logar dados sensiveis.
- [ ] Implementar transicao `awaiting_payment` para etapa que libera selecao de local.
- [ ] Preparar base do ressarcimento por inaptidao.

### Criterio de pronto

- Ordem so avanca apos confirmacao financeira.
- Status financeiro aparece corretamente para usuario e admin.
- Eventos financeiros sao auditaveis.

## Sprint 4 - Locais De Atendimento E Vinculo Da Consulta Inicial

**Objetivo:** usuario escolhe local ativo, recebe contatos e dentista vincula a consulta combinada fora da plataforma.

### Status atual

- Ja existem locais de atendimento, selecao de local e endpoint de vinculo operacional da consulta inicial.
- Falta conectar tudo na experiencia do usuario/dentista e validar o alinhamento com o fluxo sem agendamento inicial no sistema.

### Dev Frontend

- [ ] Criar/ajustar tela de selecao de local com lista apenas de locais ativos.
- [ ] Exibir dados de contato do local selecionado e orientacao para combinacao externa da consulta.
- [ ] Criar tela do dentista para vincular consulta inicial a cliente e ordem.
- [ ] Liberar no painel do cliente o proximo passo apos vinculo operacional.
- [ ] Tratar estado vazio quando nao houver locais ativos.

### Dev Backend/Infra

- [ ] Revisar listagem publica/autenticada de locais ativos com dentistas aprovados/licenciados.
- [ ] Garantir que a selecao de local so aconteca apos pagamento confirmado.
- [ ] Garantir que o dentista so vincule consulta em local/order permitidos.
- [ ] Liberar automaticamente o workflow form `customer_pre_consultation_intake` apos vinculo operacional, se essa regra estiver confirmada.
- [ ] Manter appointments apenas para adaptacao/acompanhamento ou documentar excecao temporaria.

### Criterio de pronto

- Usuario seleciona local e recebe contato.
- Dentista consegue vincular consulta inicial sem criar agenda dentro da plataforma.
- Ordem avanca para preparacao/andamento conforme regra de status.

## Sprint 5 - Consulta Inicial, Match E Inaptidao

**Objetivo:** cobrir a etapa clinica mais critica com seguranca, auditoria e acesso restrito.

### Dev Frontend

- [ ] Criar fluxo do usuario para confirmar comparecimento quando aplicavel.
- [ ] Criar tela do dentista para confirmar atendimento.
- [ ] Criar tela do dentista para registrar aptidao ou inaptidao.
- [ ] Exibir para admin ordens em excecao/ressarcimento.
- [ ] Garantir copy cuidadosa para inaptidao e ressarcimento.

### Dev Backend/Infra

- [ ] Implementar ou validar match operacional entre confirmacoes.
- [ ] Restringir registro de aptidao/inaptidao ao dentista autorizado.
- [ ] Registrar motivo de inaptidao no historico com controle de acesso.
- [ ] Bloquear laboratorio quando a ordem estiver inapta.
- [ ] Iniciar processo de ressarcimento com auditoria.
- [ ] Testar negativos de acesso a dado clinico.

### Criterio de pronto

- Ordem apta segue para formularios/producao.
- Ordem inapta encerra fluxo produtivo e abre ressarcimento.
- Admin acompanha excecao sem ler dados clinicos indevidos.

## Sprint 6 - Formularios Clinicos E Pedido De Producao

**Objetivo:** permitir anamnese e pedido de producao seguro para laboratorio.

### Dev Frontend

- [ ] Criar formulario de anamnese do dentista.
- [ ] Criar formulario de pedido de producao.
- [ ] Implementar rascunho/envio/revisao conforme spec aprovada.
- [ ] Exibir timeline da ordem para dentista e admin.
- [ ] Tratar erros de validacao sem expor dados sensiveis.

### Dev Backend/Infra

- [ ] Consolidar modelos versionados de formularios.
- [ ] Criar schemas Zod fechados para campos definidos.
- [ ] Auditar criacao, leitura, edicao, envio e revisao.
- [ ] Minimizar payload enviado ao laboratorio.
- [ ] Implementar transicao para `lab_processing`.
- [ ] Testar permissao de leitura/escrita por ator.

### Criterio de pronto

- Dentista envia anamnese e pedido de producao.
- Laboratorio recebe apenas dados necessarios.
- Formularios ficam versionados e auditaveis.

## Sprint 7 - Laboratorio, Recebimento E Adaptacao

**Objetivo:** controlar producao, recebimento pelo dentista/local e consulta de adaptacao.

### Dev Frontend

- [ ] Criar painel do laboratorio para visualizar pedidos permitidos.
- [ ] Criar acao de marcar produto fabricado/enviado, se estiver no escopo do laboratorio.
- [ ] Criar acao do dentista/local para marcar produto recebido.
- [ ] Criar fluxo de adaptacao e registro de ajustes iniciais.
- [ ] Atualizar timeline para usuario e operacao.

### Dev Backend/Infra

- [ ] Definir se laboratorio acessa plataforma ou recebe pedido por operacao manual no MVP.
- [ ] Implementar fluxo de envio ao laboratorio.
- [ ] Implementar recebimento pelo dentista/local.
- [ ] Implementar agendamento de adaptacao.
- [ ] Registrar ajustes iniciais com permissao e auditoria.
- [ ] Testar minimizacao de dados enviados ao laboratorio.

### Criterio de pronto

- Ordem sai de producao, registra recebimento e entra em adaptacao.
- Usuario e operacao conseguem acompanhar o status sem acessar dados indevidos.

## Sprint 8 - Acompanhamento 3/6/9 Meses

**Objetivo:** fechar o ciclo principal do produto.

### Dev Frontend

- [ ] Exibir proximos retornos no portal do cliente.
- [ ] Criar formulario de acompanhamento para dentista.
- [ ] Criar visao admin de ordens atrasadas, em acompanhamento e concluidas.
- [ ] Exibir historico completo por ordem conforme permissao.

### Dev Backend/Infra

- [ ] Gerar retornos periodicos de 3, 6 e 9 meses.
- [ ] Implementar formulario de acompanhamento.
- [ ] Implementar status `follow_up` e `completed`.
- [ ] Bloquear encerramento antecipado se a regra MVP continuar assim.
- [ ] Criar eventos de notificacao/lembrete.
- [ ] Testar atrasos, reprocessamento e permissoes.

### Criterio de pronto

- Retornos sao gerados e acompanhados.
- Ciclo encerra apenas conforme regra do MVP.
- Historico fica consistente para usuario, dentista e admin.

## Sprint 9 - Operacao, Notificacoes E Hardening

**Objetivo:** preparar o MVP para operacao real com governanca.

### Dev Frontend

- [ ] Consolidar dashboard admin com filtros por status, busca e visao de excecoes.
- [ ] Revisar loading/erro/vazio em todos os fluxos.
- [ ] Revisar acessibilidade e responsividade.
- [ ] Exibir notificacoes ou historico de comunicacoes quando liberado pelo backend.
- [ ] Reduzir exposicao de dados pessoais em listas e buscas.

### Dev Backend/Infra

- [ ] Implementar sistema real de notificacoes ou integracao escolhida.
- [ ] Implementar preferencias de contato e consentimento.
- [ ] Preparar rotinas de exportacao/exclusao LGPD conforme politica.
- [ ] Revisar logs para remover dados sensiveis.
- [ ] Rodar testes de abuso, autorizacao, regressao e `npm audit`.
- [ ] Revisar secrets, envs, deploy e observabilidade.

### Criterio de pronto

- Operacao consegue acompanhar ordens e excecoes.
- Notificacoes principais funcionam ou estao operacionalmente cobertas.
- Produto esta com hardening minimo para piloto real.

## Ordem Recomendada De Execucao

1. **Sprint 0:** alinhar Nexor Account, product enrollment, roles, specs ausentes e MVP curto.
2. **Sprint 1:** estabilizar conta Nexor, auth/admin/autorizacao.
3. **Sprint 2:** consolidar inscricao Biteplaner, referral e ordem.
4. **Sprint 3:** fechar pagamento stub/manual ou integracao financeira.
5. **Sprint 4:** conectar selecao de local e vinculo de consulta.
6. **Sprint 5 em diante:** aprofundar etapa clinica, laboratorio, adaptacao e acompanhamento.

## Checklist Antes De Encerrar Cada Sprint

- [ ] Build e testes relevantes do frontend passaram.
- [ ] Build e testes relevantes do backend passaram.
- [ ] Nenhum secret foi adicionado ao frontend ou ao repo.
- [ ] Rotas sensiveis validam entrada e autorizacao no backend.
- [ ] Acoes sensiveis geram auditoria.
- [ ] Dados pessoais e clinicos foram minimizados em logs, listas e payloads.
- [ ] Novas regras de negocio foram registradas em `.ai/context/business/`.
- [ ] Novos contextos/specs foram colocados em `.ai/`, e codigo runtime apenas em `project/`.
