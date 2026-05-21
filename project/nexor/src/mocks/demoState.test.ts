import { beforeEach, describe, expect, it } from 'vitest';
import {
  ACTIVE_DEMO_PERSONA_STORAGE_KEY,
  DemoStateError,
  applyOrderAction,
  getAccessOptions,
  getAppointments,
  getAuthPayload,
  getDemoStateSnapshot,
  getPartnerInviteLinks,
  getTimelineEvents,
  getWorkflowForm,
  getWorkflowForms,
  listAccountNotifications,
  listOrders,
  markAccountNotificationRead,
  parseClinicalDecisionPayload,
  resetDemoState,
  resolveActiveDemoPersona
} from './demoState';

describe('shared Biteplaner demo state', () => {
  beforeEach(() => {
    localStorage.clear();
    resetDemoState();
  });

  it('resolves the active demo persona from local storage and request headers', () => {
    expect(resolveActiveDemoPersona()).toBe('athlete');

    localStorage.setItem(ACTIVE_DEMO_PERSONA_STORAGE_KEY, 'partner');
    expect(resolveActiveDemoPersona()).toBe('partner');

    expect(resolveActiveDemoPersona({ requestHeaders: { 'x-demo-persona': 'dentist' } })).toBe(
      'dentist'
    );

    expect(
      resolveActiveDemoPersona({
        requestHeaders: { authorization: 'Bearer demo-dentistLicensed-token' }
      })
    ).toBe('dentistLicensed');
  });

  it('allows operational demo personas to load the user order workspace used by the home page', () => {
    const result = listOrders(
      { requestHeaders: { authorization: 'Bearer demo-dentistLicensed-token' } },
      'user'
    );

    expect(result.orders.length).toBeGreaterThan(0);
  });

  it('returns a valid auth payload for the active persona and fixes the partner role', () => {
    const partnerAuth = getAuthPayload({ requestHeaders: { 'x-demo-persona': 'partner' } });

    expect(partnerAuth.user.email).toBe('parceiro.demo@nexor.dev');
    expect(partnerAuth.user.roles).toContain('partner');
    expect(partnerAuth.user.roles).not.toContain('parner');
    expect(partnerAuth.user.partnerId).toBeTruthy();
  });

  it('lists mock notifications and persists read state per active user', () => {
    const athleteContext = { requestHeaders: { 'x-demo-persona': 'athlete' } };
    const dentistContext = { requestHeaders: { 'x-demo-persona': 'dentistApproved' } };

    const athleteBefore = listAccountNotifications(athleteContext);
    expect(athleteBefore.notifications.map((notification) => notification.id)).toContain(
      'demo-notification-global-welcome'
    );
    expect(
      athleteBefore.notifications.find((notification) => notification.id === 'demo-notification-global-welcome')?.read
    ).toBe(false);

    markAccountNotificationRead('demo-notification-global-welcome', athleteContext);

    const athleteAfter = listAccountNotifications(athleteContext);
    const dentistAfter = listAccountNotifications(dentistContext);

    expect(
      athleteAfter.notifications.find((notification) => notification.id === 'demo-notification-global-welcome')?.read
    ).toBe(true);
    expect(
      dentistAfter.notifications.find((notification) => notification.id === 'demo-notification-global-welcome')?.read
    ).toBe(false);
    expect(dentistAfter.notifications.map((notification) => notification.id)).toContain(
      'demo-notification-dentist-approved'
    );
  });

  it('seeds shared demo cases with friendly ids and mapped statuses', () => {
    const snapshot = getDemoStateSnapshot();
    const orderIds = snapshot.orders.map((order) => order.id);

    expect(orderIds.slice(0, 6)).toEqual([
      'BP-DEMO-001',
      'BP-DEMO-002',
      'BP-DEMO-003',
      'BP-DEMO-004',
      'BP-DEMO-005',
      'BP-DEMO-006'
    ]);
    expect(snapshot.orders.slice(0, 6).map((order) => order.status)).toEqual([
      'registration_started',
      'awaiting_scheduling',
      'in_progress',
      'awaiting_dentist_forms',
      'awaiting_payment',
      'treatment_required'
    ]);
  });

  it('reflects persona-specific access modes without losing the user path for enrolled personas', () => {
    const athleteAccess = getAccessOptions();
    const partnerAccess = getAccessOptions({ requestHeaders: { 'x-demo-persona': 'partner' } });
    const adminAccess = getAccessOptions({ requestHeaders: { 'x-demo-persona': 'admin' } });

    expect(athleteAccess.defaultMode).toBe('user');
    expect(athleteAccess.modes.find((mode) => mode.key === 'user')?.allowed).toBe(true);
    expect(athleteAccess.modes.find((mode) => mode.key === 'partner')?.allowed).toBe(false);

    expect(partnerAccess.defaultMode).toBe('partner');
    expect(partnerAccess.modes.find((mode) => mode.key === 'user')?.allowed).toBe(true);
    expect(partnerAccess.modes.find((mode) => mode.key === 'partner')?.allowed).toBe(true);
    expect(partnerAccess.modes.find((mode) => mode.key === 'dentist')?.allowed).toBe(false);

    expect(adminAccess.defaultMode).toBe('admin');
    expect(adminAccess.modes.find((mode) => mode.key === 'admin')?.allowed).toBe(true);
    expect(adminAccess.modes.find((mode) => mode.key === 'user')?.allowed).toBe(true);
    expect(
      adminAccess.modes
        .filter((mode) => !['admin', 'user'].includes(mode.key))
        .every((mode) => mode.allowed === false)
    ).toBe(true);
  });

  it('filters the same shared dataset by persona and protects operational views', () => {
    const athleteOrders = listOrders();
    const partnerOrders = listOrders({ requestHeaders: { 'x-demo-persona': 'partner' } }, 'partner');
    const dentistOrders = listOrders({ requestHeaders: { 'x-demo-persona': 'dentist' } }, 'dentist');
    const labOrders = listOrders({ requestHeaders: { 'x-demo-persona': 'lab' } }, 'lab');
    const adminOrders = listOrders({ requestHeaders: { 'x-demo-persona': 'admin' } }, 'admin');

    expect(athleteOrders.orders.map((order) => order.id)).toEqual(expect.arrayContaining([
      'BP-DEMO-001',
      'BP-DEMO-002',
      'BP-DEMO-003',
      'BP-DEMO-006'
    ]));
    expect(partnerOrders.orders.map((order) => order.id)).toEqual(expect.arrayContaining([
      'BP-DEMO-001',
      'BP-DEMO-002',
      'BP-DEMO-004'
    ]));
    expect(dentistOrders.orders.map((order) => order.id)).toEqual(expect.arrayContaining([
      'BP-DEMO-003',
      'BP-DEMO-004',
      'BP-DEMO-005',
      'BP-DEMO-006'
    ]));
    expect(
      labOrders.orders.filter((order) => order.productionRequestDraft !== null).map((order) => order.id)
    ).toEqual(['BP-DEMO-007', 'BP-DEMO-016']);
    expect(labOrders.orders.find((order) => order.id === 'BP-DEMO-007')?.dentist?.full_name).toBe('Dr. Rafael Demo');
    expect(labOrders.orders.every((order) => order.preLabChecklistDraft === null)).toBe(true);
    expect(adminOrders.orders.length).toBe(getDemoStateSnapshot().orders.length);
  });

  it('exposes one customer order per stage-specific demo persona', () => {
    const scenarios = [
      ['athletePrerequisite', 'BP-DEMO-001'],
      ['athleteScheduling', 'BP-DEMO-002'],
      ['athleteClinicalDecision', 'BP-DEMO-003'],
      ['athleteDentistForms', 'BP-DEMO-004'],
      ['athletePayment', 'BP-DEMO-005'],
      ['athleteTreatmentRequired', 'BP-DEMO-006'],
      ['athleteLabProduction', 'BP-DEMO-007'],
      ['athleteAdaptation', 'BP-DEMO-008'],
      ['athleteFollowUp', 'BP-DEMO-009'],
      ['athleteIneligible', 'BP-DEMO-010'],
      ['athleteCancelled', 'BP-DEMO-011']
    ] as const;

    scenarios.forEach(([persona, expectedOrderId]) => {
      const response = listOrders({ requestHeaders: { 'x-demo-persona': persona } }, 'user');

      expect(response.orders.map((order) => order.id)).toEqual([expectedOrderId]);
    });
  });

  it('exposes operational client order scenarios to the licensed dentist demo persona', () => {
    const licensedDentistOrders = listOrders(
      { requestHeaders: { 'x-demo-persona': 'dentistLicensed' } },
      'dentist'
    );
    const licensedOrderIds = licensedDentistOrders.orders.map((order) => order.id);

    expect(licensedOrderIds).toEqual(expect.arrayContaining([
      'BP-DEMO-012',
      'BP-DEMO-013',
      'BP-DEMO-014',
      'BP-DEMO-015',
      'BP-DEMO-016'
    ]));
    expect(licensedDentistOrders.orders.map((order) => order.status)).toEqual(expect.arrayContaining([
      'awaiting_dentist_acceptance',
      'in_progress',
      'appointment_confirmed',
      'awaiting_dentist_forms',
      'awaiting_lab_start'
    ]));
    expect(licensedDentistOrders.orders.find((order) => order.id === 'BP-DEMO-013')?.statusLabel).toBe(
      'Aguardando confirmação de consulta'
    );
    expect(licensedDentistOrders.orders.find((order) => order.id === 'BP-DEMO-014')?.statusLabel).toBe(
      'Aguardando decisão clínica'
    );
    expect(
      licensedDentistOrders.orders.find((order) => order.id === 'BP-DEMO-016')?.productionRequestDraft
    ).toEqual(expect.objectContaining({
      scan3dFileName: 'camila-boxe-arcada-superior.stl',
      prescriptionFileName: 'prescricao-camila-boxe.pdf'
    }));

    const acceptedOrder = applyOrderAction('BP-DEMO-012', {
      type: 'accept-initial-consultation'
    }, { requestHeaders: { 'x-demo-persona': 'dentistLicensed' } });

    expect('statusLabel' in acceptedOrder).toBe(true);
    if (!('statusLabel' in acceptedOrder)) {
      throw new Error('Licensed dentist acceptance did not return an order summary.');
    }
    expect(acceptedOrder.status).toBe('in_progress');
    expect(acceptedOrder.statusLabel).toBe('Aguardando confirmação de consulta');
    expect(getTimelineEvents('BP-DEMO-012', {
      requestHeaders: { 'x-demo-persona': 'dentistLicensed' }
    }).events.at(-1)?.toStatus).toBe('in_progress');
  });

  it('persists appointment and status transitions in memory for later reads', () => {
    const before = getAppointments('BP-DEMO-003');
    expect(before.appointments[0]?.user_confirmed_at).toBeNull();
    expect(before.appointments[0]?.dentist_confirmed_at).toBeNull();

    applyOrderAction('BP-DEMO-003', {
      type: 'user-confirmation',
      appointmentId: 'BP-APT-003'
    }, { requestHeaders: { 'x-demo-persona': 'athlete' } });
    applyOrderAction('BP-DEMO-003', {
      type: 'dentist-confirmation',
      appointmentId: 'BP-APT-003'
    }, { requestHeaders: { 'x-demo-persona': 'dentist' } });
    applyOrderAction('BP-DEMO-003', {
      type: 'complete-match',
      appointmentId: 'BP-APT-003'
    }, { requestHeaders: { 'x-demo-persona': 'dentist' } });

    const after = getAppointments('BP-DEMO-003');
    const events = getTimelineEvents('BP-DEMO-003');

    expect(after.appointments[0]?.user_confirmed_at).toBeTruthy();
    expect(after.appointments[0]?.dentist_confirmed_at).toBeTruthy();
    expect(
      listOrders({ requestHeaders: { 'x-demo-persona': 'dentist' } }, 'dentist').orders.find(
        (order) => order.id === 'BP-DEMO-003'
      )?.status
    ).toBe('appointment_confirmed');
    expect(
      listOrders({ requestHeaders: { 'x-demo-persona': 'dentist' } }, 'dentist').orders.find(
        (order) => order.id === 'BP-DEMO-003'
      )?.statusLabel
    ).toBe('Aguardando decisão clínica');
    expect(events.events.at(-1)?.toStatus).toBe('appointment_confirmed');
  });

  it('stores workflow form submissions and revisions in the shared state', () => {
    const before = getWorkflowForms('BP-DEMO-007', { requestHeaders: { 'x-demo-persona': 'lab' } });
    expect(before.forms[0]?.status).toBe('pending');

    const submitted = applyOrderAction('BP-DEMO-007', {
      type: 'submit-workflow-form',
      workflowFormId: 'BP-WF-005-LAB',
      payload: { scanFileQuality: 4 }
    }, { requestHeaders: { 'x-demo-persona': 'lab' } });

    expect('status' in submitted).toBe(true);
    if (!('status' in submitted)) {
      throw new Error('Workflow form submission did not return a workflow status.');
    }
    expect(submitted.status).toBe('submitted');

    const revised = applyOrderAction('BP-DEMO-007', {
      type: 'revise-workflow-form',
      workflowFormId: 'BP-WF-005-LAB',
      payload: { scanFileQuality: 5, comment: 'Revisão operacional final.'.repeat(30) },
      changeReason: 'Atualizacao operacional do laboratório.'
    }, { requestHeaders: { 'x-demo-persona': 'lab' } });

    expect('status' in revised).toBe(true);
    if (!('status' in revised)) {
      throw new Error('Workflow form revision did not return a workflow status.');
    }
    expect(revised.status).toBe('submitted');

    const stored = getWorkflowForm('BP-DEMO-007', 'BP-WF-005-LAB', {
      requestHeaders: { 'x-demo-persona': 'lab' }
    });
    expect(stored.payload).toEqual({
      scanFileQuality: 5,
      comment: expect.stringMatching(/^Revisão operacional final\./)
    });
    expect((stored.payload?.comment as string).length).toBeLessThanOrEqual(500);
    expect(stored.summary?.scoreAverage).toBe(5);
    expect(stored.summary?.hasComment).toBe(true);
  });

  it('releases the shared initial evaluation intake during the prerequisite step', () => {
    const forms = getWorkflowForms('BP-DEMO-001', { requestHeaders: { 'x-demo-persona': 'athlete' } });

    expect(forms.forms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'BP-WF-001-INTAKE',
          orderId: 'BP-DEMO-001',
          templateKey: 'customer_pre_consultation_intake',
          stepKey: 'pre_requisite_pending',
          status: 'pending',
          roleState: { customer: 'pending', dentist: 'locked' },
        }),
      ])
    );
  });

  it('requires dentist acceptance after the athlete marks the initial consultation as scheduled', () => {
    const scheduledOrder = applyOrderAction('BP-DEMO-002', {
      type: 'schedule-initial-consultation',
      practiceLocationId: 'practice-demo-001'
    }, { requestHeaders: { 'x-demo-persona': 'athlete' } });

    expect('statusLabel' in scheduledOrder).toBe(true);
    if (!('statusLabel' in scheduledOrder)) {
      throw new Error('Scheduling did not return an order summary.');
    }
    expect(scheduledOrder.status).toBe('awaiting_dentist_acceptance');
    expect(scheduledOrder.statusLabel).toBe('Aguardando aceite do dentista');
    expect(scheduledOrder.stage).toBe('dentist_acceptance_pending');

    const dentistOrders = listOrders({ requestHeaders: { 'x-demo-persona': 'dentist' } }, 'dentist');
    expect(dentistOrders.orders.map((order) => order.id)).toContain('BP-DEMO-002');
    expect(dentistOrders.orders.find((order) => order.id === 'BP-DEMO-002')?.practice_location?.id).toBe(
      'practice-demo-001'
    );

    const acceptedOrder = applyOrderAction('BP-DEMO-002', {
      type: 'accept-initial-consultation'
    }, { requestHeaders: { 'x-demo-persona': 'dentist' } });

    expect('statusLabel' in acceptedOrder).toBe(true);
    if (!('statusLabel' in acceptedOrder)) {
      throw new Error('Dentist acceptance did not return an order summary.');
    }
    expect(acceptedOrder.status).toBe('in_progress');
    expect(acceptedOrder.statusLabel).toBe('Aguardando confirmação de consulta');
    expect(acceptedOrder.stage).toBe('consultation_linked');
  });

  it('stores shared intake customer and dentist payloads separately and locks customer edits after dentist review starts', () => {
    const customerSubmission = applyOrderAction('BP-DEMO-002', {
      type: 'submit-workflow-form',
      workflowFormId: 'BP-WF-002-INTAKE',
      payload: {
        customer: {
          fullName: 'Joao Demo',
          hasRelevantMedicalDiagnosis: 'no',
          sportRoutine: 'Crossfit'
        },
        dentist: {
          initialEvaluationSummary: 'Tentativa indevida do cliente.'
        }
      }
    }, { requestHeaders: { 'x-demo-persona': 'athlete' } });

    expect('roleState' in customerSubmission).toBe(true);
    if (!('roleState' in customerSubmission)) {
      throw new Error('Shared intake did not return role state.');
    }
    expect(customerSubmission.roleState?.customer).toBe('submitted');
    expect(customerSubmission.roleState?.dentist).toBe('locked');
    expect(customerSubmission.payload).toEqual({
      customer: {
        fullName: 'Joao Demo',
        hasRelevantMedicalDiagnosis: 'no',
        sportRoutine: 'Crossfit'
      }
    });

    const dentistSubmission = applyOrderAction('BP-DEMO-002', {
      type: 'submit-workflow-form',
      workflowFormId: 'BP-WF-002-INTAKE',
      payload: {
        customer: {
          fullName: 'Alterádo pelo dentista'
        },
        dentist: {
          painlessMaxOpeningMm: 42,
          initialEvaluationSummary: 'Sem sinais impeditivos.'
        }
      }
    }, { requestHeaders: { 'x-demo-persona': 'dentist' } });

    expect('roleState' in dentistSubmission).toBe(true);
    if (!('roleState' in dentistSubmission)) {
      throw new Error('Shared intake did not return role state after dentist submission.');
    }
    expect(dentistSubmission.roleState?.customer).toBe('locked');
    expect(dentistSubmission.roleState?.dentist).toBe('submitted');
    expect(dentistSubmission.dentistReviewStartedAt).toBeTruthy();
    expect(dentistSubmission.payload).toEqual({
      customer: {
        fullName: 'Joao Demo',
        hasRelevantMedicalDiagnosis: 'no',
        sportRoutine: 'Crossfit'
      },
      dentist: {
        painlessMaxOpeningMm: 42,
        initialEvaluationSummary: 'Sem sinais impeditivos.'
      }
    });

    try {
      applyOrderAction('BP-DEMO-002', {
        type: 'submit-workflow-form',
        workflowFormId: 'BP-WF-002-INTAKE',
        payload: { customer: { fullName: 'Tentativa bloqueada' } }
      }, { requestHeaders: { 'x-demo-persona': 'athlete' } });
      throw new Error('Expected shared intake customer edit to be blocked after dentist review starts.');
    } catch (error) {
      expect(error).toBeInstanceOf(DemoStateError);
      expect((error as DemoStateError).status).toBe(409);
    }
  });

  it('denies order-scoped reads when the active persona cannot access that demo case', () => {
    try {
      getAppointments('BP-DEMO-007', { requestHeaders: { 'x-demo-persona': 'athlete' } });
      throw new Error('Expected demo access denial for athlete on BP-DEMO-007.');
    } catch (error) {
      expect(error).toBeInstanceOf(DemoStateError);
      expect((error as DemoStateError).status).toBe(404);
    }
  });

  it('denies forbidden mutations even when the persona can see the order', () => {
    try {
      applyOrderAction(
        'BP-DEMO-002',
        {
          type: 'schedule-initial-consultation',
          practiceLocationId: 'practice-demo-001'
        },
        { requestHeaders: { 'x-demo-persona': 'partner' } }
      );
      throw new Error('Expected partner mutation to be forbidden.');
    } catch (error) {
      expect(error).toBeInstanceOf(DemoStateError);
      expect((error as DemoStateError).status).toBe(403);
    }
  });

  it('does not leak partner invite data to non-partner personas', () => {
    try {
      getPartnerInviteLinks({ requestHeaders: { 'x-demo-persona': 'admin' } });
      throw new Error('Expected partner invite endpoint to deny admin persona.');
    } catch (error) {
      expect(error).toBeInstanceOf(DemoStateError);
      expect((error as DemoStateError).status).toBe(403);
    }
  });

  it('rejects malformed clinical decision payloads without mutating order state', () => {
    const beforeStatus = getDemoStateSnapshot().orders.find((order) => order.id === 'BP-DEMO-003')?.status;

    try {
      parseClinicalDecisionPayload({});
      throw new Error('Expected malformed clinical decision payload to be rejected.');
    } catch (error) {
      expect(error).toBeInstanceOf(DemoStateError);
      expect((error as DemoStateError).status).toBe(422);
    }

    const afterStatus = getDemoStateSnapshot().orders.find((order) => order.id === 'BP-DEMO-003')?.status;
    expect(afterStatus).toBe(beforeStatus);
  });
});
