import type { Server } from 'miragejs';
import { Response } from 'miragejs';
import {
  DemoStateError,
  applyOrderAction,
  getAppointments,
  getOrderForms,
  getTimelineEvents,
  getWorkflowForm,
  getWorkflowForms,
  getWorkflowVersions,
  listOrders,
  parseClinicalDecisionPayload
} from '../demoState';

function parseBody(request: { requestBody: string }) {
  if (!request.requestBody) {
    return {};
  }

  try {
    return JSON.parse(request.requestBody) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof DemoStateError) {
    return new Response(error.status, {}, { error: { code: error.code, message: error.message } });
  }

  throw error;
}

function withDemoErrors(handler: (...args: any[]) => any) {
  return (...args: any[]) => {
    try {
      return handler(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function orderHandlers(server: Server) {
  server.get('/v1/orders', withDemoErrors((_schema, request) => {
    const rawMode = request.queryParams['as'];
    const mode = Array.isArray(rawMode) ? rawMode[0] : rawMode ?? null;
    return listOrders({ requestHeaders: request.requestHeaders }, mode);
  }));

  server.get('/v1/orders/:orderId/appointments', withDemoErrors((_schema, request) =>
    getAppointments(request.params.orderId, { requestHeaders: request.requestHeaders })
  ));

  server.post('/v1/orders/:orderId/appointments', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const type = body.type === 'initial' || body.type === 'adaptation' || body.type === 'follow_up'
      ? body.type
      : 'adaptation';

    return new Response(
      200,
      {},
      applyOrderAction(
        request.params.orderId,
        {
          type: 'create-appointment',
          appointmentType: type,
          scheduledAt: typeof body.scheduledAt === 'string' ? body.scheduledAt : new Date().toISOString()
        },
        { requestHeaders: request.requestHeaders }
      )
    );
  }));

  server.patch('/v1/orders/:orderId/appointments/:appointmentId', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const status = body.status === 'scheduled' || body.status === 'rescheduled' || body.status === 'cancelled'
      ? body.status
      : 'rescheduled';

    return new Response(
      200,
      {},
      applyOrderAction(
        request.params.orderId,
        {
          type: 'update-appointment',
          appointmentId: request.params.appointmentId,
          status,
          scheduledAt: typeof body.scheduledAt === 'string' ? body.scheduledAt : undefined,
          reason: typeof body.reason === 'string' ? body.reason : undefined
        },
        { requestHeaders: request.requestHeaders }
      )
    );
  }));

  server.get('/v1/orders/:orderId/timeline', withDemoErrors((_schema, request) =>
    getTimelineEvents(request.params.orderId, { requestHeaders: request.requestHeaders })
  ));

  server.get('/v1/orders/:orderId/forms', withDemoErrors((_schema, request) =>
    getOrderForms(request.params.orderId, { requestHeaders: request.requestHeaders })
  ));

  server.get('/v1/orders/:orderId/workflow-forms', withDemoErrors((_schema, request) =>
    getWorkflowForms(request.params.orderId, { requestHeaders: request.requestHeaders })
  ));

  server.get('/v1/orders/:orderId/workflow-forms/:workflowFormId', withDemoErrors((_schema, request) =>
    getWorkflowForm(request.params.orderId, request.params.workflowFormId, {
      requestHeaders: request.requestHeaders
    })
  ));

  server.get('/v1/orders/:orderId/workflow-forms/:workflowFormId/versions', withDemoErrors((_schema, request) =>
    getWorkflowVersions(request.params.orderId, request.params.workflowFormId, {
      requestHeaders: request.requestHeaders
    })
  ));

  server.post('/v1/orders/:orderId/product-received', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          { type: 'product-received' },
          { requestHeaders: request.requestHeaders }
        )
      }
    )
  ));

  server.post('/v1/orders/:orderId/adaptation-completed', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          { type: 'adaptation-completed' },
          { requestHeaders: request.requestHeaders }
        )
      }
    )
  ));

  server.post('/v1/orders/:orderId/initial-consultation-scheduled', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          {
            type: 'schedule-initial-consultation',
            practiceLocationId:
              typeof body.practiceLocationId === 'string' ? body.practiceLocationId : ''
          },
          { requestHeaders: request.requestHeaders }
        )
      }
    );
  }));

  server.post('/v1/orders/:orderId/practice-location-selection', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      applyOrderAction(
        request.params.orderId,
        {
          type: 'schedule-initial-consultation',
          practiceLocationId:
            typeof body.practiceLocationId === 'string' ? body.practiceLocationId : ''
        },
        { requestHeaders: request.requestHeaders }
      )
    );
  }));

  server.post('/v1/orders/:orderId/practice-location-selection/cancel', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      applyOrderAction(
        request.params.orderId,
        { type: 'cancel-practice-location-selection' },
        { requestHeaders: request.requestHeaders }
      )
    )
  ));

  server.post('/v1/orders/:orderId/initial-consultation-accepted', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          { type: 'accept-initial-consultation' },
          { requestHeaders: request.requestHeaders }
        )
      }
    )
  ));

  server.post('/v1/orders/:orderId/workflow-forms/:workflowFormId/submit', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      applyOrderAction(request.params.orderId, {
        type: 'submit-workflow-form',
        workflowFormId: request.params.workflowFormId,
        payload: (body.payload as Record<string, unknown> | undefined) ?? {}
      }, { requestHeaders: request.requestHeaders })
    );
  }));

  server.post('/v1/orders/:orderId/workflow-forms/training-report', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      applyOrderAction(request.params.orderId, {
        type: 'create-training-report'
      }, { requestHeaders: request.requestHeaders })
    )
  ));

  server.post('/v1/orders/:orderId/workflow-forms/:workflowFormId/revise', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      applyOrderAction(request.params.orderId, {
        type: 'revise-workflow-form',
        workflowFormId: request.params.workflowFormId,
        payload: (body.payload as Record<string, unknown> | undefined) ?? {},
        changeReason: typeof body.changeReason === 'string' ? body.changeReason : undefined
      }, { requestHeaders: request.requestHeaders })
    );
  }));

  server.post('/v1/orders/:orderId/appointments/:appointmentId/user-confirmation', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        appointment: applyOrderAction(request.params.orderId, {
          type: 'user-confirmation',
          appointmentId: request.params.appointmentId
        }, { requestHeaders: request.requestHeaders })
      }
    )
  ));

  server.post('/v1/orders/:orderId/appointments/:appointmentId/dentist-confirmation', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        appointment: applyOrderAction(request.params.orderId, {
          type: 'dentist-confirmation',
          appointmentId: request.params.appointmentId
        }, { requestHeaders: request.requestHeaders })
      }
    )
  ));

  server.post('/v1/orders/:orderId/appointments/:appointmentId/complete-match', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        appointment: applyOrderAction(request.params.orderId, {
          type: 'complete-match',
          appointmentId: request.params.appointmentId
        }, { requestHeaders: request.requestHeaders })
      }
    )
  ));

  server.post('/v1/orders/:orderId/appointments/:appointmentId/no-show', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      {
        appointment: applyOrderAction(request.params.orderId, {
          type: 'no-show',
          appointmentId: request.params.appointmentId,
          reason: typeof body.reason === 'string' ? body.reason : undefined
        }, { requestHeaders: request.requestHeaders })
      }
    );
  }));

  server.post('/v1/orders/:orderId/prerequisite-completed', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const eligibility = (body.eligibility as Record<string, unknown> | undefined) ?? {};
    const consents = (body.consents as Record<string, unknown> | undefined) ?? {};

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          {
            type: 'complete-prerequisite',
            documentType: typeof body.documentType === 'string' ? body.documentType : '',
            documentNumber: typeof body.documentNumber === 'string' ? body.documentNumber : '',
            sport: typeof body.sport === 'string' ? body.sport : '',
            isMinor: body.isMinor === true,
            guardianName: typeof body.guardianName === 'string' ? body.guardianName : undefined,
            guardianDocument:
              typeof body.guardianDocument === 'string' ? body.guardianDocument : undefined,
            eligibility: {
              orthodontic: eligibility.orthodontic === true,
              activeDentalTreatment: eligibility.activeDentalTreatment === true,
              relevantCondition: eligibility.relevantCondition === true,
            },
            consents: {
              service: consents.service === true,
              sensitiveHealth: consents.sensitiveHealth === true,
              research: consents.research === true,
              marketing: consents.marketing === true,
            }
          },
          { requestHeaders: request.requestHeaders }
        )
      }
    );
  }));

  server.post('/v1/orders/:orderId/payment-confirmed', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          { type: 'confirm-payment' },
          { requestHeaders: request.requestHeaders }
        )
      }
    )
  ));

  server.post('/v1/admin/orders/:orderId/payment-confirmation', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      applyOrderAction(
        request.params.orderId,
        { type: 'confirm-payment' },
        { requestHeaders: request.requestHeaders }
      )
    )
  ));

  server.post('/v1/orders/:orderId/production-request/draft', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          {
            type: 'save-production-request-draft',
            anamnesisSummary: typeof body.anamnesisSummary === 'string' ? body.anamnesisSummary : '',
            anamnesisDownloaded: body.anamnesisDownloaded === true,
            productionRequestSummary:
              typeof body.productionRequestSummary === 'string' ? body.productionRequestSummary : '',
            labNotes: typeof body.labNotes === 'string' ? body.labNotes : '',
            scan3dFileName: typeof body.scan3dFileName === 'string' ? body.scan3dFileName : '',
            scan3dFileRef:
              body.scan3dFileRef && typeof body.scan3dFileRef === 'object'
                ? body.scan3dFileRef as Record<string, unknown>
                : null,
            prescriptionFileName:
              typeof body.prescriptionFileName === 'string' ? body.prescriptionFileName : '',
            prescriptionFileRef:
              body.prescriptionFileRef && typeof body.prescriptionFileRef === 'object'
                ? body.prescriptionFileRef as Record<string, unknown>
                : null,
            lgpdConfirmed: body.lgpdConfirmed === true,
            selectedLabId: typeof body.selectedLabId === 'string' ? body.selectedLabId : null
          },
          { requestHeaders: request.requestHeaders }
        )
      }
    );
  }));

  server.post('/v1/orders/:orderId/production-request/complete', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          {
            type: 'complete-production-request',
            anamnesisSummary: typeof body.anamnesisSummary === 'string' ? body.anamnesisSummary : '',
            anamnesisDownloaded: body.anamnesisDownloaded === true,
            productionRequestSummary:
              typeof body.productionRequestSummary === 'string' ? body.productionRequestSummary : '',
            labNotes: typeof body.labNotes === 'string' ? body.labNotes : '',
            scan3dFileName: typeof body.scan3dFileName === 'string' ? body.scan3dFileName : '',
            scan3dFileRef:
              body.scan3dFileRef && typeof body.scan3dFileRef === 'object'
                ? body.scan3dFileRef as Record<string, unknown>
                : null,
            prescriptionFileName:
              typeof body.prescriptionFileName === 'string' ? body.prescriptionFileName : '',
            prescriptionFileRef:
              body.prescriptionFileRef && typeof body.prescriptionFileRef === 'object'
                ? body.prescriptionFileRef as Record<string, unknown>
                : null,
            lgpdConfirmed: body.lgpdConfirmed === true,
            selectedLabId: typeof body.selectedLabId === 'string' ? body.selectedLabId : null
          },
          { requestHeaders: request.requestHeaders }
        )
      }
    );
  }));

  server.post('/v1/orders/:orderId/forms/production-request', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const payload = body.payload && typeof body.payload === 'object'
      ? body.payload as Record<string, unknown>
      : {};

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          {
            type: 'complete-production-request',
            anamnesisSummary: typeof payload.anamnesisSummary === 'string' ? payload.anamnesisSummary : '',
            anamnesisDownloaded: payload.anamnesisDownloaded === true,
            productionRequestSummary:
              typeof payload.productionRequestSummary === 'string' ? payload.productionRequestSummary : '',
            labNotes: typeof payload.labNotes === 'string' ? payload.labNotes : '',
            scan3dFileName: typeof payload.scan3dFileName === 'string' ? payload.scan3dFileName : '',
            scan3dFileRef:
              payload.scan3dFileRef && typeof payload.scan3dFileRef === 'object'
                ? payload.scan3dFileRef as Record<string, unknown>
                : null,
            prescriptionFileName:
              typeof payload.prescriptionFileName === 'string' ? payload.prescriptionFileName : '',
            prescriptionFileRef:
              payload.prescriptionFileRef && typeof payload.prescriptionFileRef === 'object'
                ? payload.prescriptionFileRef as Record<string, unknown>
                : null,
            lgpdConfirmed: payload.lgpdConfirmed === true,
            selectedLabId: typeof payload.selectedLabId === 'string' ? payload.selectedLabId : null
          },
          { requestHeaders: request.requestHeaders }
        )
      }
    );
  }));

  server.post('/v1/orders/:orderId/pre-lab-checklist/draft', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          {
            type: 'save-pre-lab-checklist-draft',
            anamnesisSummary: typeof body.anamnesisSummary === 'string' ? body.anamnesisSummary : '',
            clinicalNotes: typeof body.clinicalNotes === 'string' ? body.clinicalNotes : undefined,
            dentalArchFileName:
              typeof body.dentalArchFileName === 'string' ? body.dentalArchFileName : '',
            retentionAcknowledged: body.retentionAcknowledged === true
          },
          { requestHeaders: request.requestHeaders }
        )
      }
    );
  }));

  server.post('/v1/orders/:orderId/pre-lab-checklist/complete', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          {
            type: 'complete-pre-lab-checklist',
            anamnesisSummary: typeof body.anamnesisSummary === 'string' ? body.anamnesisSummary : '',
            clinicalNotes: typeof body.clinicalNotes === 'string' ? body.clinicalNotes : undefined,
            dentalArchFileName:
              typeof body.dentalArchFileName === 'string' ? body.dentalArchFileName : '',
            retentionAcknowledged: body.retentionAcknowledged === true
          },
          { requestHeaders: request.requestHeaders }
        )
      }
    );
  }));

  server.post('/v1/orders/:orderId/select-practice-location', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          {
            type: 'select-practice-location',
            practiceLocationId:
              typeof body.practiceLocationId === 'string' ? body.practiceLocationId : ''
          },
          { requestHeaders: request.requestHeaders }
        )
      }
    );
  }));

  server.post('/v1/orders/:orderId/clinical-decision', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const action = parseClinicalDecisionPayload(body);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(request.params.orderId, action, {
          requestHeaders: request.requestHeaders
        })
      }
    );
  }));

  server.post('/v1/orders/:orderId/clinical-evaluation', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const outcome = body.outcome;
    const action = parseClinicalDecisionPayload({
      decision: outcome === 'eligible' || outcome === 'ineligible' ? outcome : undefined
    });

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(request.params.orderId, action, {
          requestHeaders: request.requestHeaders
        })
      }
    );
  }));

  server.post('/v1/orders/:orderId/send-to-lab', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          { type: 'send-to-lab' },
          { requestHeaders: request.requestHeaders }
        )
      }
    )
  ));

  server.post('/v1/orders/:orderId/lab-return-for-adjustment', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(request.params.orderId, {
          type: 'lab-return-for-adjustment',
          reason: typeof body.reason === 'string' ? body.reason : undefined
        }, { requestHeaders: request.requestHeaders })
      }
    );
  }));

  server.post('/v1/orders/:orderId/lab-production-started', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          { type: 'lab-production-started' },
          { requestHeaders: request.requestHeaders }
        )
      }
    )
  ));

  server.post('/v1/orders/:orderId/lab-production-completed', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          { type: 'lab-production-completed' },
          { requestHeaders: request.requestHeaders }
        )
      }
    )
  ));
}
