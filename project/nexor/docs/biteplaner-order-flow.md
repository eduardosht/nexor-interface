# Fluxo da ordem Biteplaner

Este documento descreve a jornada operacional da ordem Biteplaner do ponto de vista do produto, incluindo a etapa exibida para o cliente, a seleção de clínica e os impactos de remoção de conta.

## Etapas exibidas ao cliente

1. **Pré-requisito**
   - `registration_started`
   - `pre_requisite_pending`
   - `new_user_onboarding`
2. **Consulta inicial**
   - `awaiting_scheduling`
   - `awaiting_dentist_acceptance`
   - `in_progress`
   - `ineligible_reassessment`
3. **Decisão clínica**
   - `appointment_confirmed`
   - `awaiting_clinical_decision`
   - `treatment_required`
4. **Compra**
   - `awaiting_payment`
5. **Laboratório**
   - `payment_confirmed`
   - `awaiting_dentist_forms`
   - `awaiting_lab_start`
   - `lab_processing`
   - `dentist_adjustment_required`
   - `ready_for_lab`
   - `lab_production`
6. **Adaptação e acompanhamento**
   - `product_received_by_clinic`
   - `awaiting_adaptation`
   - `follow_up`
   - `completed`
7. **Check-ups**
   - Etapa visual final exibida apos `completed`.
   - Check-up 01: liberado 15 dias apos a consulta de recebimento/adaptacao concluida.
   - Check-up 02: liberado 30 dias apos o Check-up 01 ter acontecido e estar concluido no sistema.

## Regra de avanço após pagamento

Assim que o pagamento é confirmado, a compra foi concluída do ponto de vista do cliente. Por isso, `payment_confirmed` deve aparecer na etapa **Laboratório**, mesmo que ainda exista uma ação operacional do dentista para revisar ou enviar os dados de produção.

O status `awaiting_dentist_forms` representa essa pendência operacional do dentista, mas continua pertencendo à etapa **Laboratório** na jornada visual do cliente.

## Seleção e cancelamento de clínica

Após a conclusão do pré-requisito, a ordem entra em `awaiting_scheduling` e o cliente escolhe uma clínica ou consultório licenciado para a consulta inicial. Quando a seleção é registrada, a ordem passa para `awaiting_dentist_acceptance` e a jornada do cliente deve exibir explicitamente a clínica selecionada.

Enquanto a ordem estiver em `awaiting_dentist_acceptance`, o cliente pode cancelar apenas o vínculo com a clínica escolhida. Esse cancelamento não cancela a compra, a conta nem a jornada Biteplaner; ele desfaz a escolha de clínica para permitir uma nova seleção.

Comportamento esperado do sistema:

- Exibir a clínica selecionada na jornada do cliente, com nome e aviso de que a ordem aguarda aceite do dentista.
- Disponibilizar a ação de cancelamento somente em `awaiting_dentist_acceptance`.
- Executar `POST /v1/orders/:orderId/practice-location-selection/cancel`.
- Limpar `practice_location_id`, `practice_location` e `dentistId`.
- Retornar a ordem para `awaiting_scheduling`, etapa `awaiting_initial_consultation`.
- Restaurar `nextActions` para `schedule-initial-consultation`.
- Registrar evento de timeline com a informação de que o cliente cancelou a clínica selecionada.

Regra de negócio:

- O cliente pode trocar a clínica antes do aceite do dentista.
- Depois do aceite do dentista, a troca não deve ocorrer por esse botão; mudanças devem seguir fluxo operacional de suporte, reagendamento ou intervenção administrativa.
- O cancelamento da clínica não gera ressarcimento automático e não altera elegibilidade clínica.

## Máquina de estados principal

Fluxo esperado:

1. `registration_started`
2. `awaiting_scheduling`
3. `awaiting_dentist_acceptance`
4. `in_progress`
5. `appointment_confirmed`
6. `awaiting_payment`
7. `payment_confirmed`
8. `awaiting_dentist_forms`
9. `awaiting_lab_start`
10. `lab_processing`
11. `awaiting_adaptation`
12. `follow_up`
13. `completed`

Depois de `completed`, a ordem principal nao volta para producao. O acompanhamento clinico passa a ser representado por consultas do tipo `follow_up`, com `purpose`/`metadata.followUpKind`:

- `return_15_days`: Check-up de 15 dias.
- `return_30_days`: Check-up de 30 dias.
- `on_demand`: retorno avulso iniciado por fluxos futuros.

O cliente agenda esses check-ups pela jornada. O sistema pode sugerir o mesmo dentista/clinica da ordem original, mas o cliente tambem pode escolher uma nova clinica licenciada quando o fluxo de selecao estiver disponivel.

## Lembretes de check-up

Os lembretes de check-up usam a fila genérica `platform_email_events`, documentada em `docs/biteplaner-checkup-email-reminders.md`.

Regra operacional:

- Quando o Check-up 01 fica disponível, o sistema cria uma notificação interna e agenda até 3 lembretes de e-mail para o cliente.
- Quando o Check-up 01 está concluído e se passam 30 dias da data em que ele aconteceu, o Check-up 02 fica disponível e recebe a mesma política.
- A notificação interna é criada somente na liberação do check-up.
- Os e-mails seguem a régua D0, D+7 e D+14 se o check-up ainda não foi agendado.
- Depois que o cliente agenda o check-up, e-mails futuros daquele retorno viram `skipped` com motivo `appointment_scheduled`.
- Se o agendamento for cancelado, lembretes `skipped` ainda válidos podem voltar para `scheduled`, sem ultrapassar o limite de 3 lembretes.
- Se o cliente desativar `system_flow_email_enabled`, eventos futuros ficam `skipped` com motivo `communication_preference_disabled`.
- O admin visualiza a agenda, cancela envios futuros com motivo, reenvia falhas e executa o job manualmente, mas não altera a preferência de comunicação do cliente.

Desenho do job:

1. Supabase Cron chama uma Edge Function diariamente às 08:00 em `America/Sao_Paulo`.
2. A Edge Function chama `POST /v1/internal/jobs/platform-emails/daily` no backend com `X-Internal-Job-Key`.
3. O backend reconcilia eventos futuros, aplica preferências de comunicação, pula eventos inelegíveis e processa eventos do dia.
4. O job respeita `PLATFORM_EMAIL_DAILY_SEND_LIMIT`.
5. Eventos atrasados por até 3 dias ainda podem ser enviados; após isso viram `skipped` por `missed_window`.
6. A execução usa lock em `platform_job_runs` por 30 minutos para evitar processamento simultâneo.
7. O Resend envia o e-mail e o sistema salva `provider_message_id` quando disponível.

## Remoção de conta

A remoção de conta impacta diretamente ordens ativas. Quando a Nexor aprova uma solicitação de remoção para um usuário vinculado a uma jornada, as ordens relacionadas devem ser interrompidas para preservar consistência operacional e evitar continuidade indevida do produto.

Comportamento esperado:

- O motivo operacional deve ser registrado como `account_deletion_approved`.
- Ordens vinculadas devem ir para `cancelled`.
- A jornada deve exibir uma mensagem de interrupção clara, explicando que a remoção de conta foi aprovada.
- Não deve haver ressarcimento automático implícito no cancelamento.
- A ordem cancelada não deve avançar para consulta, compra, laboratório ou adaptação.
- Perfis operacionais não devem continuar recebendo tarefas relacionadas a essa ordem.

Texto recomendado ao cliente:

> Esta jornada foi interrompida porque a remoção de conta de um usuário vinculado foi aprovada pela Nexor. As ordens foram canceladas sem gerar ressarcimento automático.

## Referências no código

- `src/pages/painel/Jornada/index.tsx`: jornada visual do cliente.
- `src/features/biteplaner/orders/orderPresenter.ts`: apresentação compartilhada de etapa e status.
- `src/mocks/demoState.ts`: estado demo e eventos usados nos fluxos locais.
- `src/pages/painel/admin/AdminAccountDeletions.tsx`: análise administrativa de solicitações de remoção de conta.
