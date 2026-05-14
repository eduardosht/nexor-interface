# Supabase Day-to-Day Queries

Consultas SQL prontas para uso no dia a dia no Supabase SQL Editor.

Estas queries foram montadas com base no schema atual do projeto, principalmente nas tabelas:

- `profiles`
- `profile_roles`
- `customers`
- `dentists`
- `partners`
- `laboratories`
- `orders`
- `payments`
- `refunds`
- `product_enrollments`
- `order_status_events`

## Observacoes

- As consultas abaixo assumem uso administrativo no Supabase.
- Se voce rodar como usuario autenticado comum, as policies de RLS podem limitar os resultados.
- Em buscas por cliente, troque os exemplos como `joao`, e-mails e documentos pelos valores reais.

## Usuarios e papeis

### 1. Total de perfis cadastrados

```sql
select count(*) as total_profiles
from profiles;
```

### 2. Quantidade por role

```sql
select
  pr.role,
  count(distinct pr.profile_id) as total
from profile_roles pr
group by pr.role
order by total desc;
```

### 3. Perfis com seus papeis

```sql
select
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.status,
  string_agg(distinct pr.role, ', ' order by pr.role) as roles,
  p.created_at
from profiles p
left join profile_roles pr on pr.profile_id = p.id
group by p.id, p.full_name, p.email, p.phone, p.status, p.created_at
order by p.created_at desc;
```

### 4. Contagem operacional por tipo

```sql
select
  count(*) filter (where pr.role = 'customer') as customers,
  count(*) filter (where pr.role = 'dentist') as dentists,
  count(*) filter (where pr.role = 'partner') as partners,
  count(*) filter (where pr.role = 'lab') as laboratories,
  count(*) filter (where pr.role = 'admin') as admins
from profile_roles pr;
```

## Dentistas, parceiros e laboratorios

### 5. Dentistas com status operacional

```sql
select
  d.id,
  d.full_name,
  p.email,
  d.status,
  d.approval_status,
  d.license_status,
  d.training_status,
  d.cro_number,
  d.created_at
from dentists d
left join profiles p on p.id = d.profile_id
order by d.created_at desc;
```

### 6. Parceiros com codigo e status

```sql
select
  pa.id,
  pa.name,
  pa.partner_code,
  pa.partner_slug,
  pa.status,
  pa.commission_status,
  pa.contact_email,
  pa.created_at
from partners pa
order by pa.created_at desc;
```

### 7. Laboratorios

```sql
select
  l.id,
  p.full_name,
  p.company_name,
  p.email,
  l.status,
  l.coverage_area,
  l.delivery_range,
  l.created_at
from laboratories l
left join profiles p on p.id = l.profile_id
order by l.created_at desc;
```

## Ordens

### 8. Quantidade total de ordens

```sql
select count(*) as total_orders
from orders;
```

### 9. Quantidade de ordens por status

```sql
select
  status,
  count(*) as total
from orders
group by status
order by total desc;
```

### 10. Ordens com dados do cliente, dentista, parceiro e laboratorio

```sql
select
  o.id,
  o.status,
  o.clinical_outcome,
  c.full_name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  d.full_name as dentist_name,
  pa.name as partner_name,
  lp.full_name as lab_name,
  o.price_final,
  o.discount_amount,
  o.commission_amount,
  o.created_at
from orders o
left join profiles c on c.id = coalesce(o.customer_profile_id, o.user_profile_id)
left join dentists d on d.id = o.dentist_id
left join partners pa on pa.id = o.partner_id
left join profiles lp on lp.id = o.lab_profile_id
order by o.created_at desc;
```

## Buscar ordens por cliente

### 11. Buscar ordens por nome do cliente

```sql
select
  o.id,
  o.status,
  c.full_name as customer_name,
  c.email,
  c.phone,
  o.created_at
from orders o
join profiles c on c.id = coalesce(o.customer_profile_id, o.user_profile_id)
where c.full_name ilike '%joao%'
order by o.created_at desc;
```

### 12. Buscar ordens por e-mail do cliente

```sql
select
  o.id,
  o.status,
  c.full_name,
  c.email,
  o.created_at
from orders o
join profiles c on c.id = coalesce(o.customer_profile_id, o.user_profile_id)
where c.email ilike '%cliente@%'
order by o.created_at desc;
```

### 13. Buscar cliente por CPF/documento e ver suas ordens

```sql
select
  c.id as customer_profile_id,
  c.full_name,
  c.email,
  c.document_number,
  o.id as order_id,
  o.status,
  o.created_at
from profiles c
left join orders o on coalesce(o.customer_profile_id, o.user_profile_id) = c.id
where c.document_number = '12345678900'
order by o.created_at desc nulls last;
```

## Pagamentos e reembolsos

### 14. Resumo de pagamentos por status

```sql
select
  status,
  count(*) as total,
  sum(amount_cents) / 100.0 as total_brl
from payments
group by status
order by total desc;
```

### 15. Ordens sem pagamento confirmado

```sql
select
  o.id,
  o.status,
  c.full_name as customer_name,
  p.status as payment_status,
  p.amount_cents / 100.0 as amount_brl,
  o.created_at
from orders o
left join profiles c on c.id = coalesce(o.customer_profile_id, o.user_profile_id)
left join payments p on p.order_id = o.id
where p.id is null or p.status <> 'confirmed'
order by o.created_at desc;
```

### 16. Reembolsos em aberto

```sql
select
  r.id,
  r.order_id,
  r.status,
  r.reason,
  r.created_at
from refunds r
where r.status in ('initiated', 'processing')
order by r.created_at desc;
```

## Produto Biteplaner

### 17. Quantos usuarios estao inscritos no Biteplaner

```sql
select
  status,
  count(*) as total
from product_enrollments
where product_key = 'biteplaner'
group by status
order by total desc;
```

### 18. Inscritos no Biteplaner com parceiro de origem

```sql
select
  pe.id,
  p.full_name,
  p.email,
  pe.status,
  pe.source_type,
  pa.name as partner_name,
  pe.created_at
from product_enrollments pe
join profiles p on p.id = pe.profile_id
left join partners pa on pa.id = pe.partner_id
where pe.product_key = 'biteplaner'
order by pe.created_at desc;
```

## Diagnostico rapido

### 19. Clientes sem nenhuma ordem

```sql
select
  p.id,
  p.full_name,
  p.email,
  p.created_at
from profiles p
join profile_roles pr on pr.profile_id = p.id and pr.role = 'customer'
left join orders o on coalesce(o.customer_profile_id, o.user_profile_id) = p.id
where o.id is null
order by p.created_at desc;
```

### 20. Ultimos eventos de status de uma ordem especifica

```sql
select
  ose.order_id,
  ose.from_status,
  ose.to_status,
  ose.reason,
  ose.created_at
from order_status_events ose
where ose.order_id = 'COLE_O_ID_DA_ORDEM_AQUI'
order by ose.created_at desc;
```

## Status de ordens usados hoje

Para referencia, o backend trabalha com estes status:

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
