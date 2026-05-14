# Roadmap Em Dupla - MVP1 E MVP2

**Data de referencia:** 2026-04-30  
**Base usada:** `sprints/index.md`, planos ativos em `docs/superpowers/plans/` e leitura do codigo atual

## 1. Objetivo do MVP1

Entregar um fluxo curto, real e homologavel:

1. usuario entra pela Nexor
2. cria conta ou faz login
3. entra no Biteplaner com contexto de produto e referral preservado
4. cria inscricao no produto
5. cria ordem inicial
6. acompanha status basico no painel

**Fica fora do MVP1**

- pagamento real com provedor
- fluxo clinico completo
- laboratorio operacional completo
- acompanhamento 3/6/9 meses
- notificacoes completas

## 2. Definicao objetiva de pronto do MVP1

O MVP1 termina quando estes pontos estiverem fechados:

- conta Nexor funcionando com cadastro, login, reset, conta e logout
- Biteplaner sem cadastro primario proprio para usuario final
- referral/invite preservado entre Nexor e Biteplaner
  - Isso quer dizer que, quando o usuário entra no fluxo por um link, QR Code ou convite de parceiro, essa origem não pode se perder no meio do caminho.
- enrollment Biteplaner criado para a conta Nexor
  - Isso quer dizer que, depois que o usuário já tem uma conta global na Nexor, o sistema cria o vínculo dele com o produto Biteplaner.
  - Exemplo simples: João cria conta na Nexor, isso só significa que ele existe na plataforma, quando João decide entrar no Biteplaner, o sistema cria um enrollment, esse enrollment diz que a conta do João agora participa do produto Biteplaner
- ordem inicial criada por usuario autenticado
- painel mostra proxima etapa sem ambiguidade
- testes minimos de backend e fronts passando
- mocks e placeholders criticos identificados explicitamente

## 3. Pessoa A - O que precisa fazer no MVP1

**Owner principal:** `project/frontend/nexor/` e `project/frontend/biteplaner/`

### Bloco A1 - Fechar a entrada oficial

- validar quais telas do Nexor sao a entrada oficial: `/entrar`, `/cadastro`, `/recuperar-senha`, `/conta`
- remover o Biteplaner como entrada primaria de cadastro do usuario final
- ajustar redirects do Biteplaner para apontar para a Nexor
- preservar `ref` ou `invite` durante login/cadastro

### Bloco A2 - Fechar o handoff Nexor -> Biteplaner

- criar estado claro de pos-login ou pos-cadastro levando para o Biteplaner
- mostrar feedback de referral valido, invalido, expirado ou consumido
- garantir que o usuario entenda a proxima acao: entrar no produto, concluir inscricao ou criar ordem

### Bloco A3 - Fechar o fluxo minimo do produto

- conectar a inscricao Biteplaner ao frontend real
- conectar resumo de draft ou ordem inicial ao usuario autenticado
- garantir que o painel do cliente mostre status real ou placeholder sinalizado
- expor claramente trechos ainda mockados

### Bloco A4 - Limpeza obrigatoria para destravar o MVP1

- corrigir a suite quebrada de cadastro no Nexor
- corrigir ou remover testes legados quebrados no Biteplaner
- mapear rotas ativas, legadas e mockadas
- alinhar tela real x teste real x documentacao real

### Entregaveis da Pessoa A no MVP1

- auth e conta Nexor estabilizados no frontend
- Biteplaner redirecionando corretamente para a Nexor
- handoff com referral preservado
- jornada visual de inscricao e ordem inicial sem ambiguidade
- suites do frontend sem falhas conhecidas ligadas a fluxo legado critico

## 4. Pessoa B - O que precisa fazer no MVP1

**Owner principal:** `project/backend/api/`, banco, migrations, policies e ambiente

### Bloco B1 - Fechar a fundacao de conta e roles

- validar modelo de conta Nexor versus dominio Biteplaner
- remover qualquer dependencia restante de `clinic_admin`
- garantir middleware com `401` para token invalido ou ausente
- garantir `403` para perfil bloqueado ou role indevida

### Bloco B2 - Fechar enrollment e referral

- consolidar contrato de `product_enrollments`
- fechar validacao de referral/invite
- persistir origem comercial sem expor dado sensivel indevido
- garantir que o frontend receba respostas estaveis para estados de referral

### Bloco B3 - Fechar ordem inicial

- validar transacao entre enrollment e criacao de ordem
- revisar historico inicial da ordem
- garantir unicidade e normalizacao de CPF/CNPJ onde aplicavel
- cobrir erros principais: invite invalido, expirado, consumido, draft inexistente, perfil ausente, role indevida

### Bloco B4 - Hardening minimo obrigatorio

- garantir auditoria de login, consentimentos, perfil e acoes admin
- revisar `account_consents`
- revisar RLS/policies de `profiles` e `product_enrollments`
- alinhar `.env.example`, seeds e contratos usados pelo frontend

### Entregaveis da Pessoa B no MVP1

- auth/autorizacao confiaveis
- enrollment Biteplaner persistido corretamente
- referral rastreavel
- ordem inicial criada com contrato estavel
- auditoria e isolamento minimo de dados fechados para homologacao

## 5. Dependencias cruzadas do MVP1

### Pessoa A depende da Pessoa B para

- contrato final de enrollment
- contrato final de validacao de referral/invite
- respostas reais da criacao de ordem
- regras de erro e permissao

### Pessoa B depende da Pessoa A para

- mapa real das telas ativas e dos fluxos efetivamente usados
- pontos do frontend onde referral precisa ser preservado
- identificacao de mocks que ainda bloqueiam fluxo real

## 6. Sequencia recomendada do MVP1

### Semana 1 - Limpar e alinhar

- Pessoa A: corrigir testes quebrados, mapear telas ativas e remover entrada primaria antiga do Biteplaner
- Pessoa B: revisar roles, policies, auth middleware e contratos reais usados pelo frontend

### Semana 2 - Fechar entrada e enrollment

- Pessoa A: fechar auth Nexor no frontend e handoff para Biteplaner
- Pessoa B: fechar enrollment, referral e respostas de erro

### Semana 3 - Fechar ordem inicial e homologar

- Pessoa A: conectar fluxo de inscricao e ordem no painel
- Pessoa B: fechar transacao da ordem inicial, auditoria e casos negativos

## 7. MVP2 Planejado A Partir Do `sprints/index.md`

O MVP2 deve comecar so depois do MVP1 homologado. O foco sai de entrada/conta e passa para compra assistida e continuidade operacional.

### Objetivo do MVP2

Entregar a jornada ate a consulta inicial:

1. conta Nexor e enrollment funcionando
2. ordem criada
3. pagamento manual ou stub confirmado
4. local de atendimento selecionado
5. dentista vincula consulta inicial
6. ordem avanca para acompanhamento operacional basico

### Escopo do MVP2

- Sprint 3: compra, pagamento e confirmacao financeira
- Sprint 4: selecao de local e vinculo da consulta inicial
- Sprint 5: aptidao, inaptidao e ressarcimento base

### Pessoa A no MVP2

- criar checkout e tela de status de pagamento
- bloquear selecao de local antes da confirmacao financeira
- criar tela de selecao de local com contato e orientacao clara
- criar tela do dentista para vinculo operacional da consulta
- exibir no painel do cliente a proxima etapa apos pagamento e apos vinculo
- tratar estados vazios, erros e excecoes de inaptidao com copy sensivel

### Pessoa B no MVP2

- consolidar modelo financeiro, desconto e comissao
- decidir se pagamento continua manual ou integra provedor
- criar confirmacao financeira administrativa ou webhook
- liberar selecao de local apenas apos pagamento confirmado
- garantir autorizacao do dentista para vinculo de consulta
- implementar registro de aptidao/inaptidao e inicio de ressarcimento
- manter auditoria e minimizacao de dados clinicos

### Definicao objetiva de pronto do MVP2

- ordem avanca somente apos confirmacao financeira
- usuario consegue escolher local ativo e ver contato
- dentista consegue vincular consulta inicial a cliente e ordem
- inaptidao bloqueia continuidade produtiva e inicia ressarcimento base
- admin acompanha status e excecoes sem acesso a dado clinico indevido

## 8. Resumo executivo para alinhamento rapido

### MVP1

- **Pessoa A:** fechar entrada Nexor, handoff, frontend real e limpeza de legado
- **Pessoa B:** fechar auth, enrollment, referral, ordem inicial e hardening minimo

### MVP2

- **Pessoa A:** checkout, status, selecao de local, fluxo do cliente e fluxo do dentista
- **Pessoa B:** financeiro, regras de liberacao, vinculo operacional, inaptidao e ressarcimento base

### Regra de priorizacao

- nao expandir laboratorio, formularios clinicos completos ou acompanhamento antes de MVP1 e MVP2 estarem homologados
