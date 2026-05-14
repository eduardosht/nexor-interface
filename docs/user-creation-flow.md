# Fluxo de Criacao de Usuario por Role

Este documento descreve o fluxo atual de criacao de usuarios no ecossistema Nexor/Biteplaner, indicando:

- qual frontend inicia cada etapa
- para qual rota/backend a requisicao vai
- qual service/repository processa a acao
- em quais tabelas os dados sao persistidos

## Visao Geral

Hoje existem 2 camadas diferentes no cadastro:

1. **Conta de identidade Nexor**
   - cria a conta no Supabase Auth
   - no fluxo publico do usuario final, exige apenas e-mail e senha
   - cria o perfil interno global
   - registra os consentimentos da conta

2. **Cadastro operacional por role**
   - cria os registros especificos do dominio Biteplaner
   - vincula o perfil global a tabelas operacionais como `dentists`, `partners` e `laboratories`

Em termos praticos:

- `customer` fica praticamente completo no cadastro base
- `dentist`, `partner` e `lab` precisam de cadastro base + onboarding operacional
- `admin` nao possui cadastro publico; nasce via seed/script

Observacao de regra de negocio aprovada em 2026-05-02:

- o cadastro publico do usuario final na Nexor nao depende de CPF, CNPJ ou outro documento
- documentos e dados operacionais ficam restritos a seeds administrativas, onboarding operacional ou etapas futuras especificas

---

## 1. Origem da conta de autenticacao

### 1.1 Usuario comum via frontend Nexor

O frontend Nexor cria a conta de autenticacao diretamente no Supabase Auth.

Origem:
- `project/frontend/nexor/src/pages/Cadastro/index.tsx`

Chamada:
- `supabase.auth.signUp({ email, password, options: { data: ... } })`

Persistencia:
- `auth.users` no schema de autenticacao do Supabase

Metadados enviados no `signUp` no fluxo alvo de negocio:
- `email`
- `password`

Observacao:
- o backend e fluxos legados ainda podem aceitar `role`, `documentType` e `documentNumber`, mas isso nao faz parte do cadastro publico alvo do usuario final

Observacoes:
- essa etapa **nao passa pelo backend**
- se a confirmacao de e-mail estiver habilitada, o Supabase pode criar o usuario sem devolver `session`

### 1.2 Admin via script

O admin nao e criado por tela publica.

Origem:
- `project/backend/api/scripts/seed-admin.ts`

Chamada:
- `supabase.auth.admin.createUser(...)`

Persistencia:
- `auth.users`

Metadados:
- `role: 'admin'`
- `fullName`
- `documentType: 'cpf'`
- `documentNumber`

---

## 2. Fluxo Base da Conta Nexor

Este e o fluxo que transforma o usuario autenticado em um perfil reconhecido pelo backend.

### 2.1 Frontend que inicia

Frontend:
- `project/frontend/nexor/src/pages/Cadastro/index.tsx`

Fluxo:
1. usuario faz `signUp` no Supabase Auth
2. se o Supabase devolver `session.access_token`, o frontend chama o backend
3. se o Supabase nao devolver sessao imediata, o frontend salva um `pending registration`
4. depois da confirmacao de e-mail, a tela `project/frontend/nexor/src/pages/Conta/index.tsx` tenta reconciliar o cadastro pendente

### 2.2 Rota do backend para criar perfil

Rota:
- `POST /v1/auth/profile`

Arquivo:
- `project/backend/api/src/routes/auth.routes.ts`

Service chamado:
- `ProfileService.createProfile`

Arquivo:
- `project/backend/api/src/services/profile.service.ts`

Repository chamado:
- `ProfileRepository.createProfile`

Arquivo:
- `project/backend/api/src/repositories/profile.repository.ts`

### 2.3 Dados esperados pela rota

Regra de negocio alvo:

- para conta publica do usuario final, a criacao da conta base nao deve depender de documento
- quando existir reconciliacao de perfil global, ela deve funcionar com dados minimos de identidade e consentimento

Contrato tecnico legado ainda encontrado no backend:

Payload atual do backend:

```json
{
  "fullName": "Nome",
  "phone": "Opcional",
  "role": "customer | partner | dentist | lab | admin",
  "documentType": "cpf | cnpj",
  "documentNumber": "documento normalizado",
  "companyName": "Opcional para cnpj"
}
```

### 2.4 Tabelas afetadas no fluxo base

#### `profiles`

Armazena o perfil global da conta Nexor.

Campos principais usados na criacao:
- `auth_user_id`
- `email`
- `full_name`
- `phone`
- `role`
- `document_type`
- `document_number`
- `company_name`
- `cpf` (mantido por compatibilidade quando `document_type = 'cpf'`)

#### `profile_roles`

Armazena os papeis associados ao perfil.

No fluxo base, o backend insere:
- `profile_id`
- `role`

Neste momento ainda pode nao haver vinculo operacional:
- `dentist_id`
- `partner_id`
- `lab_id`

esses campos so sao preenchidos no onboarding operacional.

#### `customers`

Somente para role `customer`.

Quando `role === 'customer'`, o backend chama `ProfileRepository.ensureCustomer(profile.id)` e faz `upsert` em:
- `customers.profile_id`

### 2.5 Auditoria no fluxo base

Tabela:
- `audit_events`

Evento gravado:
- `profile.created`

Purpose:
- `biteplaner_account_onboarding`

---

## 3. Fluxo de Consentimentos da Conta

Depois do perfil, o frontend registra os consentimentos da conta Nexor.

### 3.1 Frontend que chama

Frontend:
- `project/frontend/nexor/src/pages/Cadastro/index.tsx`
- `project/frontend/nexor/src/pages/Conta/index.tsx` no fluxo de reconciliacao

Rota:
- `POST /v1/account/consents`

Arquivo:
- `project/backend/api/src/routes/consent.routes.ts`

Repository usado:
- `ConsentRepository.record`

Arquivo:
- `project/backend/api/src/repositories/consent.repository.ts`

### 3.2 Tabela afetada

#### `account_consents`

Campos gravados:
- `profile_id`
- `consent_type` (`terms`, `privacy`, `marketing`)
- `accepted`
- `accepted_at`
- `ip_address`

Observacao:
- esse endpoint registra os consentimentos gerais da conta
- existe tambem a rota `POST /v1/auth/consents`, mas o fluxo principal de cadastro atual usa `POST /v1/account/consents`

---

## 4. Fluxo por Role

## 4.1 Customer

### Entrada

Frontend:
- Nexor Cadastro

Arquivo:
- `project/frontend/nexor/src/pages/Cadastro/index.tsx`

### Passos

1. `supabase.auth.signUp(...)`
2. `POST /v1/auth/profile`
3. `POST /v1/account/consents`

### Backend

Rota:
- `POST /v1/auth/profile`

Service:
- `ProfileService.createProfile`

Repository:
- `ProfileRepository.createProfile`
- `ProfileRepository.ensureCustomer`

### Tabelas afetadas

- `auth.users`
- `profiles`
- `profile_roles`
- `customers`
- `account_consents`
- `audit_events`

### Resultado

O usuario fica com:
- perfil global criado
- role `customer`
- registro em `customers`

Nao precisa de onboarding operacional extra para existir como cliente da plataforma.

---

## 4.2 Dentist

Existem 2 camadas para dentista.

### Camada 1: conta base

Frontend:
- Nexor Cadastro

Arquivo:
- `project/frontend/nexor/src/pages/Cadastro/index.tsx`

Fluxo:
1. `supabase.auth.signUp(...)`
2. `POST /v1/auth/profile`
3. `POST /v1/account/consents`

Persistencia:
- `auth.users`
- `profiles`
- `profile_roles`
- `account_consents`
- `audit_events`

Neste ponto o usuario ja tem role `dentist` no perfil global, mas ainda pode nao ter registro operacional em `dentists`.

### Camada 2: onboarding operacional

Frontend:
- Biteplaner Onboarding

Arquivo:
- `project/frontend/biteplaner/src/pages/OnboardingPage.tsx`

Rota:
- `POST /v1/auth/onboarding/dentist`

Service:
- `OperationsService.selfRegisterDentist`

Repository:
- `OperationsRepository.findDentistByProfileId`
- `OperationsRepository.createDentist`
- `ProfileRepository.addRole`

### Tabelas afetadas no onboarding operacional

#### `dentists`

Campos iniciais gravados:
- `profile_id`
- `full_name`
- `cro_number`
- `status = 'active'`
- `approval_status = 'pending'`
- `license_status = 'pending'`
- `training_status = 'pending'`

#### `profile_roles`

Atualiza/adiciona a role `dentist` com:
- `dentist_id`

#### `audit_events`

Evento:
- `dentist.self_registered`

Purpose:
- `biteplaner_dentist_onboarding`

### Resultado

O usuario passa a ter:
- perfil global
- role `dentist`
- registro operacional em `dentists`
- `profile_roles.dentist_id` apontando para a linha criada

---

## 4.3 Partner

Tambem possui 2 camadas.

### Camada 1: conta base

Frontend:
- Nexor Cadastro

Arquivo:
- `project/frontend/nexor/src/pages/Cadastro/index.tsx`

Fluxo:
1. `supabase.auth.signUp(...)`
2. `POST /v1/auth/profile`
3. `POST /v1/account/consents`

Persistencia:
- `auth.users`
- `profiles`
- `profile_roles`
- `account_consents`
- `audit_events`

No cadastro base, `partner` usa:
- `documentType = 'cnpj'`
- `documentNumber`
- `companyName`

### Camada 2: onboarding operacional

Frontend:
- Biteplaner Onboarding

Arquivo:
- `project/frontend/biteplaner/src/pages/OnboardingPage.tsx`

Rota:
- `POST /v1/auth/onboarding/partner`

Service:
- `OperationsService.selfRegisterPartner`

Repository:
- `OperationsRepository.findPartnerByProfileId`
- `OperationsRepository.createPartner`
- `ProfileRepository.addRole`

### Tabelas afetadas no onboarding operacional

#### `partners`

Campos iniciais gravados:
- `profile_id`
- `name`
- `cnpj`
- `contact_email`
- `partner_code`
- `partner_slug`
- `status = 'inactive'`

#### `profile_roles`

Atualiza/adiciona a role `partner` com:
- `partner_id`

#### `audit_events`

Evento:
- `partner.self_registered`

Purpose:
- `biteplaner_partner_onboarding`

### Resultado

O usuario passa a ter:
- perfil global
- role `partner`
- registro operacional em `partners`
- `profile_roles.partner_id` apontando para o parceiro criado

---

## 4.4 Lab

Tambem possui 2 camadas.

### Camada 1: conta base

Frontend:
- Nexor Cadastro

Arquivo:
- `project/frontend/nexor/src/pages/Cadastro/index.tsx`

Fluxo:
1. `supabase.auth.signUp(...)`
2. `POST /v1/auth/profile`
3. `POST /v1/account/consents`

Persistencia:
- `auth.users`
- `profiles`
- `profile_roles`
- `account_consents`
- `audit_events`

No cadastro base, `lab` usa:
- `documentType = 'cnpj'`
- `documentNumber`
- `companyName`

### Camada 2: onboarding operacional

Frontend:
- Biteplaner Onboarding

Arquivo:
- `project/frontend/biteplaner/src/pages/OnboardingPage.tsx`

Rota:
- `POST /v1/auth/onboarding/lab`

Service:
- `OperationsService.selfRegisterLaboratory`

Repository:
- `OperationsRepository.findLaboratoryByProfileId`
- `OperationsRepository.createLaboratory`
- `ProfileRepository.addRole`

### Tabelas afetadas no onboarding operacional

#### `laboratories`

Campos iniciais gravados:
- `profile_id`
- `cnpj`
- `status = 'pending'`
- `coverage_area`
- `delivery_range`

#### `profile_roles`

Atualiza/adiciona a role `lab` com:
- `lab_id`

#### `audit_events`

Evento:
- `laboratory.self_registered`

Purpose:
- `biteplaner_laboratory_onboarding`

### Resultado

O usuario passa a ter:
- perfil global
- role `lab`
- registro operacional em `laboratories`
- `profile_roles.lab_id` apontando para o laboratorio criado

---

## 4.5 Admin

Admin nao passa pelo fluxo publico da Nexor.

### Origem

Script:
- `project/backend/api/scripts/seed-admin.ts`

### Fluxo

1. cria usuario em `auth.users` via `supabase.auth.admin.createUser`
2. faz `upsert` em `profiles`
3. faz `upsert` em `profile_roles`

### Tabelas afetadas

- `auth.users`
- `profiles`
- `profile_roles`

### Dados gravados

#### `profiles`

- `auth_user_id`
- `email`
- `full_name`
- `role = 'admin'`
- `status = 'active'`
- `document_type = 'cpf'`
- `document_number`
- `cpf`

#### `profile_roles`

- `profile_id`
- `role = 'admin'`

Observacao:
- o script nao cria `account_consents`
- o script nao passa por `ProfileService`

---

## 5. Consulta da identidade no backend

Depois da criacao, o frontend consulta a identidade consolidada em:

- `GET /v1/auth/me`

Arquivo:
- `project/backend/api/src/routes/auth.routes.ts`

Service:
- `AuthService.authenticate`

Esse fluxo:
- valida o token do Supabase Auth
- procura o perfil em `profiles`
- carrega roles em `profile_roles`
- monta o usuario autenticado com `roles`, `dentistId`, `partnerId` e `labId`

Tabelas lidas:
- `auth.users` via `supabase.auth.getUser(token)`
- `profiles`
- `profile_roles`

---

## 6. Tabelas Envolvidas no Fluxo de Criacao

### `auth.users`

Origem:
- Supabase Auth

Uso:
- identidade primaria de login
- email/senha
- `user_metadata` com role e documento no momento do `signUp` ou seed

### `profiles`

Origem:
- backend, via `POST /v1/auth/profile`
- ou seed de admin

Uso:
- perfil global Nexor
- documento, telefone, role principal, empresa, status

### `profile_roles`

Origem:
- backend, via `ProfileRepository.addRole`
- ou seed de admin

Uso:
- lista de papeis do perfil
- vinculos operacionais opcionais:
  - `dentist_id`
  - `partner_id`
  - `lab_id`

### `customers`

Origem:
- criada automaticamente quando `role = 'customer'`

Uso:
- marcar o perfil como cliente operacional

### `account_consents`

Origem:
- `POST /v1/account/consents`

Uso:
- consentimentos gerais da conta

### `dentists`

Origem:
- `POST /v1/auth/onboarding/dentist`

Uso:
- dominio operacional do dentista

### `partners`

Origem:
- `POST /v1/auth/onboarding/partner`

Uso:
- dominio operacional do parceiro

### `laboratories`

Origem:
- `POST /v1/auth/onboarding/lab`

Uso:
- dominio operacional do laboratorio

### `audit_events`

Origem:
- services do backend

Uso:
- trilha de auditoria de criacao de perfil, consentimento e onboarding operacional

---

## 7. Sequencia Recomendada por Role

## 7.1 Customer

1. Nexor Cadastro
2. `signUp` no Supabase
3. `POST /v1/auth/profile`
4. `POST /v1/account/consents`
5. acesso normal ao portal

## 7.2 Dentist

1. Nexor Cadastro
2. `signUp` no Supabase
3. `POST /v1/auth/profile`
4. `POST /v1/account/consents`
5. Biteplaner onboarding
6. `POST /v1/auth/onboarding/dentist`

## 7.3 Partner

1. Nexor Cadastro
2. `signUp` no Supabase
3. `POST /v1/auth/profile`
4. `POST /v1/account/consents`
5. Biteplaner onboarding
6. `POST /v1/auth/onboarding/partner`

## 7.4 Lab

1. Nexor Cadastro
2. `signUp` no Supabase
3. `POST /v1/auth/profile`
4. `POST /v1/account/consents`
5. Biteplaner onboarding
6. `POST /v1/auth/onboarding/lab`

## 7.5 Admin

1. rodar `seed-admin.ts`
2. criar `auth.users`
3. fazer `upsert` em `profiles`
4. fazer `upsert` em `profile_roles`

---

## 8. Observacoes Importantes sobre o Estado Atual do Codigo

### 8.1 O cadastro base oficial esta centralizado na Nexor

O fluxo mais alinhado com o contrato atual do backend e:
- `project/frontend/nexor/src/pages/Cadastro/index.tsx`

Na regra de negocio alvo, esse fluxo deve evoluir para um cadastro publico simples com:
- `email`
- `password`

Campos como `role`, `documentType`, `documentNumber` e `companyName` devem deixar de ser obrigatorios para o usuario final no cadastro publico e permanecer apenas onde houver onboarding operacional especifico.

### 8.2 Existem chamadas legadas no Biteplaner

Os arquivos abaixo ainda parecem usar um payload antigo para `POST /v1/auth/profile`:

- `project/frontend/biteplaner/src/pages/OnboardingPage.tsx`
- `project/frontend/biteplaner/src/pages/AccountHome.tsx`

Eles ainda tentam enviar campos como:
- `cpf`
- `consents` em formato diferente

enquanto o contrato atual do backend espera:
- `role`
- `documentType`
- `documentNumber`

Ou seja:
- o fluxo conceitual de onboarding operacional continua claro
- mas essas telas do Biteplaner merecem revisao para ficarem 100% aderentes ao contrato atual da API

### 8.3 Role global e cadastro operacional nao sao a mesma coisa

Exemplo:
- um usuario pode ter `role = 'lab'` em `profiles` e em `profile_roles`
- mas so vira laboratorio operacional completo quando existir uma linha em `laboratories` e `profile_roles.lab_id` estiver preenchido

O mesmo vale para:
- `dentists`
- `partners`

---

## 9. Resumo Executivo

O fluxo de criacao de usuario hoje funciona assim:

- a autenticacao nasce em `auth.users`
- o backend cria o perfil global em `profiles`
- o backend registra as roles em `profile_roles`
- `customer` ganha linha em `customers` logo no cadastro base
- `dentist`, `partner` e `lab` ganham registros operacionais depois, via onboarding dedicado
- `admin` nao nasce por frontend; nasce via script

Se voce quiser descobrir rapidamente por onde um usuario entrou, a ordem de investigacao mais util e:

1. `auth.users`
2. `profiles`
3. `profile_roles`
4. `customers` ou `dentists` ou `partners` ou `laboratories`
5. `account_consents`
6. `audit_events`
