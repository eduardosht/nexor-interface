# Spec: Nexor Account E Product Enrollment

## Objetivo

Separar cadastro/login global da Nexor do domínio operacional do Biteplaner, sem quebrar o fluxo já existente.

A Nexor passa a ser dona de:

- conta
- login/sessão
- perfil básico
- consentimentos gerais
- entrada multi-produto
- perfis por produto, como cliente, parceiro, dentista e laboratório do Biteplaner

O Biteplaner permanece dono de:

- inscrição no produto
- ordem
- compra/pagamento
- referral/comissão do produto
- dados complementares, aprovações e vínculos operacionais de dentistas, parceiros, locais de atendimento e laboratórios
- formulários e dados odontológicos
- acompanhamento e histórico operacional

## Principio De Migração

A migração deve ser incremental.

Não renomear ou remover `profiles`, `profile_roles` e `customers` no primeiro passo se isso quebrar endpoints existentes. Primeiro criar a fronteira conceitual e os contratos novos; depois migrar telas e services para os nomes/camadas novas.

## Modelo De Dados Proposto

### Camada global Nexor

Pode reaproveitar `profiles` inicialmente, tratando-a como perfil global Nexor.

Campos atuais relevantes:

- `profiles.auth_user_id`
- `profiles.email`
- `profiles.full_name`
- `profiles.phone`
- `profiles.cpf`
- `profiles.status`
- `consents`

Direcao futura:

| Conceito | Tabela atual | Nome conceitual |
|---|---|---|
| Conta Supabase Auth | `auth.users` | identidade de autenticação |
| Perfil global | `profiles` | Nexor profile/account profile |
| Consentimentos gerais | `consents` com purpose global | Nexor account consents |
| Roles globais | subset de `profile_roles` | Nexor/global roles |
| Perfis por produto | `account_product_roles` | papéis escopados por produto |

### Inscrição em produto

Criar tabela nova:

```sql
product_enrollments
```

Campos sugeridos:

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | primary key |
| `profile_id` | uuid | referência `profiles(id)` |
| `product_key` | text | inicialmente `biteplaner` |
| `status` | text | `started`, `active`, `inactive`, `blocked` |
| `source_type` | text | `direct`, `partner_invite`, `admin`, `migration` |
| `source_ref` | text | token, slug ou referência externa quando houver |
| `partner_id` | uuid nullable | parceiro Biteplaner quando aplicável |
| `metadata` | jsonb | sem dados sensíveis livres |
| `created_at` | timestámptz | default now |
| `updated_at` | timestámptz | default now |

Indices/constraints:

- unique parcial ou composta em `profile_id + product_key` para impedir inscrição duplicada ativa.
- index por `product_key/status`.
- index por `partner_id` quando houver atribuicao comercial.

### Camada Biteplaner

Manter tabelas de produto:

- `orders`
- `customers`
- `partners`
- `partner_invite_links`
- `dentists`
- `dentist_practice_locations`
- `laboratories`
- `forms` / `workflow_forms`
- `payments`
- `refunds`
- `order_status_events`

Mudanca recomendada:

- `orders.customer_profile_id` continua apontando para `profiles(id)`.
- `orders` deve receber ou derivar `product_enrollment_id` no futuro para rastrear explicitamente a inscrição que originou a ordem.
- `customers` deixa de representar cadastro global e passa a representar o papel operacional de cliente Biteplaner.

### Perfis por produto

Criar tabela:

```sql
account_product_roles
```

Campos principais:

| Campo | Tipo | Observação |
|---|---|---|
| `profile_id` | uuid | referência `profiles(id)` |
| `product_key` | text | inicialmente `biteplaner` |
| `role` | text | `customer`, `partner`, `dentist`, `lab` |
| `status` | text | `pending`, `active`, `rejected`, `suspended` |
| `source_type` | text | `self_service`, `admin`, `migration`, `partner_invite` |
| `metadata` | jsonb | dados complementares mínimos, sem payload clínico livre |
| `approved_by_profile_id` | uuid nullable | admin que aprovou |
| `approved_at` | timestámptz nullable | data de aprovação |

## Perfis E Permissoes

Separar mentalmente:

### Roles globais Nexor

Possiveis:

- `account_user`
- `platform_admin`

### Perfis Biteplaner registrados na Nexor

- `customer`
- `dentist`
- `partner`
- `lab`

Esses perfis são escopados ao produto `biteplaner` e ficam na camada Nexor para permitir que uma mesma conta tenha multiplos perfis no produto.

Status:

- `customer`: ativado imediatamente quando a conta decide adquirir o Biteplaner.
- `partner`, `dentist`, `lab`: entram como `pending` e só liberam área operacional quando forem aprovados.

`clinic_admin` não deve ser usado no MVP sem nova decisão de negocio.

## Contratos Backend Propostos

### Conta Nexor

Rotas novas ou aliases conceituais:

```text
GET    /v1/account/me
POST   /v1/account/profile
PATCH  /v1/account/profile
GET    /v1/account/consents
POST   /v1/account/consents
GET    /v1/account/product-roles
POST   /v1/account/products/biteplaner/roles/customer
POST   /v1/account/products/biteplaner/roles/partner
POST   /v1/account/products/biteplaner/roles/dentist
POST   /v1/account/products/biteplaner/roles/lab
```

Podem reaproveitar internamente services atuais de profile no primeiro ciclo.

### Produtos Nexor

```text
GET /v1/products
```

Resposta mínima:

```json
{
  "products": [
    {
      "key": "biteplaner",
      "name": "Biteplaner",
      "status": "active"
    }
  ]
}
```

### Inscrição Biteplaner

```text
POST /v1/products/biteplaner/enrollments
GET  /v1/products/biteplaner/enrollment
```

Payload de criação:

```json
{
  "inviteToken": "opcional",
  "orderDraftId": "opcional"
}
```

Resposta:

```json
{
  "enrollment": {
    "id": "uuid",
    "productKey": "biteplaner",
    "status": "active",
    "partnerId": "uuid-ou-null"
  }
}
```

### Ordem Biteplaner

Manter rotas atuais, mas ajustar semantica:

```text
POST /v1/orders
```

Pre-condicoes:

- usuário autenticado
- perfil global Nexor existente
- inscrição Biteplaner existente ou criavel na mesma transação
- invite/order draft validos quando enviados

## Fluxo Frontend Proposto

### Entrada por referral

```text
Usuário abre link/QR Biteplaner
  -> Nexor captura produto=biteplaner e invite/token
  -> se não autenticado, vai para cadastro/login Nexor
  -> após auth, cria/retoma inscrição Biteplaner
  -> redireciona para resumo/checkout Biteplaner
```

### Rotas Nexor sugeridas

```text
/
/cadastro
/entrar
/conta
/conta/produtos
/produtos/biteplaner/entrar
```

### Rotas Biteplaner que mudam

Rotas atuais de cadastro/login no Biteplaner devem virar redirects ou handoff:

```text
/cadastro          -> Nexor /cadastro?produto=biteplaner
/login             -> Nexor /entrar?produto=biteplaner
/admin/login       -> Nexor /entrar?produto=biteplaner&role=admin
/onboarding        -> Biteplaner enrollment ou redirect para Nexor se perfil global faltar
```

## Sequencia De Implementação

### Fase 1 - Fundação sem quebra

- Criar migration `product_enrollments`.
- Criar migration `account_product_roles` e backfill dos roles Biteplaner legados.
- Criar repository/service de enrollment.
- Criar rotas `/v1/products` e `/v1/products/biteplaner/enrollments`.
- Criar aliases `/v1/account/*` para as rotas atuais de profile/consent.
- Criar rotas de perfil por produto em `/v1/account/products/biteplaner/roles/*`.
- Manter rotas antigas temporariamente.
- Adicionar testes negativos de enrollment.

### Fase 2 - Nexor frontend

- Adicionar rotas de cadastro/login/conta no frontend Nexor.
- Reaproveitar UI/fluxos existentes do Biteplaner quando fizer sentido, adaptando marca e copy.
- Preservar `produto=biteplaner`, `invite`, `draft` e `redirect`.
- Criar tela simples de produtos com Biteplaner.
- Na home do portal, exibir o Biteplaner com quatro opções: adquirir como cliente, solicitar parceria, solicitar cadastro de dentista e solicitar cadastro de laboratório.
- Cliente segue imediatamente para pre-requisito.
- Parceiro, dentista e laboratório saem da home para páginas dedicadas de cadastro complementar, com campos obrigatórios preliminares, aceite de termos/privacidade e mensagem de sucesso após envio. Esses fluxos criam perfil pendente e ficam em análise.

### Fase 3 - Biteplaner handoff

- Trocar cadastro/login primarios do Biteplaner por redirects para Nexor.
- Ao retornar autenticado, criar/retomar enrollment.
- Criar ordem somente após enrollment.
- Atualizar guards e testes.

### Fase 4 - Limpeza

- Remover dependencias de `clinic_admin`.
- Renomear purposes de auditoria de `biteplaner_account_*` para `nexor_account_*` quando forem globais.
- Revisar roles e separar globais de operacionais.
- Atualizar docs de API.

## Criterios De Aceite

- Usuário entra por link Biteplaner, cria/usa conta Nexor e retorna ao fluxo Biteplaner sem perder referral.
- Uma conta Nexor pode existir sem estar inscrita no Biteplaner.
- Uma conta Nexor inscrita no Biteplaner pode criar ordem.
- Dentista/parceiro/laboratório usam conta Nexor e perfil por produto Nexor, mas permissão operacional é aprovada no contexto Biteplaner.
- Backend bloqueia acesso a ordem Biteplaner sem enrollment/permissão adequada.
- Consentimentos gerais e consentimentos/formulários Biteplaner ficam separados por purpose e domínio.
- Nenhum dado clínico entra no perfil global Nexor.

## Testes Minimos

Backend:

- criar enrollment com usuário autenticado e perfil existente
- impedir enrollment duplicado ativo
- preservar parceiro quando invite valido
- rejeitar invite expirado/consumido/invalido
- rejeitar criação de ordem sem perfil/enrollment quando aplicável
- auditar criação de enrollment sem payload sensivel
- conta sem perfil por produto retorna `productRoles: []`
- cliente cria perfil ativo e enrollment idempotente
- parceiro/dentista/laboratório criam perfil pendente sem liberar acesso operacional

Frontend:

- Nexor preserva query params de produto/referral durante cadastro/login
- Biteplaner `/cadastro` redireciona para Nexor com contexto correto
- usuário autenticado sem enrollment ve handoff para ativar Biteplaner
- usuário com enrollment segue para resumo/checkout
- home do portal exibe as quatro opções do Biteplaner
- solicitações de parceiro/dentista/laboratório usam página dedicada, não modal
- modal `Acessar como` libera apenas perfis ativos e mostra pendentes como em análise

## Pontos Em Aberto

- Dominio final da conta Nexor: `/conta`, subdomínio dedicado ou outro.
- Nomes finais dos roles globais e operacionais.
- Se `orders` já deve receber `product_enrollment_id` na primeira migration ou em fase posterior.
- Se admin Nexor e admin Biteplaner serão o mesmo papel no MVP.
