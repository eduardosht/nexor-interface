import type { Server } from 'miragejs';
import { Response } from 'miragejs';
import {
  DemoStateError,
  applyOrderAction,
  getAppointments,
  getClinicalFollowUps,
  getOrderForms,
  getTimelineEvents,
  getWorkflowForm,
  getWorkflowForms,
  getWorkflowVersions,
  listOrders,
  parseClinicalDecisionPayload,
  scheduleClinicalFollowUp,
  type ClinicalFollowUpKind
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
    const rawStatus = request.queryParams.status;
    const rawLimit = request.queryParams.limit;
    const rawCreatedBefore = request.queryParams.createdBefore;
    const rawInitDate = request.queryParams.initDate;
    const rawFinalDate = request.queryParams.finalDate;
    const status = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
    const limitValue = Array.isArray(rawLimit) ? rawLimit[0] : rawLimit;
    const createdBefore = Array.isArray(rawCreatedBefore) ? rawCreatedBefore[0] : rawCreatedBefore;
    const initDate = Array.isArray(rawInitDate) ? rawInitDate[0] : rawInitDate;
    const finalDate = Array.isArray(rawFinalDate) ? rawFinalDate[0] : rawFinalDate;
    return listOrders(
      { requestHeaders: request.requestHeaders },
      mode,
      {
        status: typeof status === 'string' ? status : undefined,
        limit: typeof limitValue === 'string' ? Number(limitValue) : undefined,
        createdBefore: typeof createdBefore === 'string' ? createdBefore : undefined,
        initDate: typeof initDate === 'string' ? initDate : undefined,
        finalDate: typeof finalDate === 'string' ? finalDate : undefined
      }
    );
  }));

  server.get('/v1/orders/:orderId/appointments', withDemoErrors((_schema, request) =>
    getAppointments(request.params.orderId, { requestHeaders: request.requestHeaders })
  ));

  server.get('/v1/orders/:orderId/clinical-follow-ups', withDemoErrors((_schema, request) =>
    getClinicalFollowUps(request.params.orderId, { requestHeaders: request.requestHeaders })
  ));

  server.post('/v1/orders/:orderId/clinical-follow-ups/:kind/schedule', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const rawKind = request.params.kind;
    if (rawKind !== 'return_15_days' && rawKind !== 'return_30_days' && rawKind !== 'on_demand') {
      throw new DemoStateError(422, 'invalid_follow_up_kind', 'Tipo de retorno clínico inválido.');
    }

    const kind: ClinicalFollowUpKind = rawKind;

    return new Response(
      200,
      {},
      scheduleClinicalFollowUp(
        request.params.orderId,
        kind,
        {
          practiceLocationId: typeof body.practiceLocationId === 'string' ? body.practiceLocationId : undefined,
          scheduledAt: typeof body.scheduledAt === 'string' ? body.scheduledAt : undefined
        },
        { requestHeaders: request.requestHeaders }
      )
    );
  }));

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

  server.post('/v1/orders/:orderId/payment-link', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const model = typeof body.model === 'string' ? body.model : 'impacto';
    const color = typeof body.color === 'string' ? body.color : 'preto';
    const quantity = typeof body.quantity === 'number' ? body.quantity : Number(body.quantity);

    applyOrderAction(
      request.params.orderId,
      {
        type: 'create-payment-link',
        model,
        color,
        quantity,
      },
      { requestHeaders: request.requestHeaders }
    );

    return new Response(
      200,
      {},
      {
      url: 'https://sandbox.asaas.com/checkout/test-link'
      }
    );
  }));

  server.post('/v1/orders/:orderId/purchase-confirmation', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const model = typeof body.model === 'string' ? body.model : 'impacto';
    const color = typeof body.color === 'string' ? body.color : 'preto';
    const quantity = typeof body.quantity === 'number' ? body.quantity : Number(body.quantity);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          {
            type: 'confirm-purchase-request',
            model,
            color,
            quantity,
          },
          { requestHeaders: request.requestHeaders }
        ),
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

  server.post('/v1/admin/orders/:orderId/payment-message-sent', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          { type: 'mark-payment-message-sent' },
          { requestHeaders: request.requestHeaders }
        ),
      }
    )
  ));

  server.post('/v1/orders/:orderId/attachments/production-scan3d/upload-intent', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const fileName = typeof body.fileName === 'string' ? body.fileName : 'scan.stl';
    const uploadId = `upload_demo_${Date.now()}`;

    return new Response(200, {}, {
      uploadId,
      objectKey: `biteplaner/production-scans/tmp/${request.params.orderId}/${uploadId}/${fileName}`,
      uploadUrl: `https://s3.demo.local/${uploadId}`,
      requiredHeaders: {
        'Content-Type': typeof body.mimeType === 'string' ? body.mimeType : 'application/octet-stream'
      },
      expiresAt: new Date(Date.now() + 600000).toISOString()
    });
  }));

  server.post('/v1/orders/:orderId/attachments/production-scan3d/confirm', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(200, {}, {
      fileRef: {
        id: typeof body.uploadId === 'string' ? body.uploadId : 'upload_demo',
        provider: 'amazon-s3',
        purpose: 'production_scan3d',
        objectKey:
          typeof body.objectKey === 'string'
            ? body.objectKey.replace('/tmp/', '/confirmed/')
            : `biteplaner/production-scans/confirmed/${request.params.orderId}/upload_demo/scan.stl`,
        fileName: typeof body.fileName === 'string' ? body.fileName : 'scan.stl',
        mimeType: typeof body.mimeType === 'string' ? body.mimeType : 'application/octet-stream',
        sizeBytes: typeof body.sizeBytes === 'number' ? body.sizeBytes : 1,
        scanStatus: 'not_scanned',
        uploadedAt: new Date().toISOString()
      }
    });
  }));

  server.post('/v1/orders/:orderId/attachments/production-scan3d/download-url', withDemoErrors((_schema, _request) =>
    new Response(200, {}, {
      downloadUrl: 'https://s3.demo.local/download/scan.stl',
      expiresAt: new Date(Date.now() + 300000).toISOString()
    })
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
            opsNotes: typeof body.opsNotes === 'string' ? body.opsNotes : '',
            scan3dFileName: typeof body.scan3dFileName === 'string' ? body.scan3dFileName : '',
            scan3dFileRef:
              body.scan3dFileRef && typeof body.scan3dFileRef === 'object'
                ? body.scan3dFileRef as Record<string, unknown>
                : null,
            lgpdConfirmed: body.lgpdConfirmed === true,
            externalProductionProviderId: typeof body.externalProductionProviderId === 'string' ? body.externalProductionProviderId : null,
            purchaseConfiguration:
              body.purchaseConfiguration && typeof body.purchaseConfiguration === 'object'
                ? body.purchaseConfiguration as { productKey: 'biteplaner'; quantity: number; model: string; color: string }
                : null
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
            opsNotes: typeof body.opsNotes === 'string' ? body.opsNotes : '',
            scan3dFileName: typeof body.scan3dFileName === 'string' ? body.scan3dFileName : '',
            scan3dFileRef:
              body.scan3dFileRef && typeof body.scan3dFileRef === 'object'
                ? body.scan3dFileRef as Record<string, unknown>
                : null,
            lgpdConfirmed: body.lgpdConfirmed === true,
            externalProductionProviderId: typeof body.externalProductionProviderId === 'string' ? body.externalProductionProviderId : null,
            purchaseConfiguration:
              body.purchaseConfiguration && typeof body.purchaseConfiguration === 'object'
                ? body.purchaseConfiguration as { productKey: 'biteplaner'; quantity: number; model: string; color: string }
                : null
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
            opsNotes: typeof payload.opsNotes === 'string' ? payload.opsNotes : '',
            scan3dFileName: typeof payload.scan3dFileName === 'string' ? payload.scan3dFileName : '',
            scan3dFileRef:
              payload.scan3dFileRef && typeof payload.scan3dFileRef === 'object'
                ? payload.scan3dFileRef as Record<string, unknown>
                : null,
            lgpdConfirmed: payload.lgpdConfirmed === true,
            externalProductionProviderId: typeof payload.externalProductionProviderId === 'string' ? payload.externalProductionProviderId : null,
            purchaseConfiguration:
              payload.purchaseConfiguration && typeof payload.purchaseConfiguration === 'object'
                ? payload.purchaseConfiguration as { productKey: 'biteplaner'; quantity: number; model: string; color: string }
                : null
          },
          { requestHeaders: request.requestHeaders }
        )
      }
    );
  }));

  const handleOpsProductionReviewChecklistDraft = withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          {
            type: 'save-ops-production-review-checklist-draft',
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
  });

  const handleOpsProductionReviewChecklistComplete = withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          {
            type: 'complete-ops-production-review-checklist',
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
  });

  server.post('/v1/orders/:orderId/ops-production-review-checklist/draft', handleOpsProductionReviewChecklistDraft);
  server.post('/v1/orders/:orderId/ops-production-review-checklist/complete', handleOpsProductionReviewChecklistComplete);
  server.post('/v1/orders/:orderId/ops-production-review-checklist/draft', handleOpsProductionReviewChecklistDraft);
  server.post('/v1/orders/:orderId/ops-production-review-checklist/complete', handleOpsProductionReviewChecklistComplete);

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

  server.post('/v1/orders/:orderId/ops-production-review', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          { type: 'request-ops-production-review' },
          { requestHeaders: request.requestHeaders }
        )
      }
    )
  ));

  server.post('/v1/orders/:orderId/external-production-adjustment-requested', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(
      200,
      {},
      {
        order: applyOrderAction(request.params.orderId, {
          type: 'external-production-adjustment-requested',
          reason: typeof body.reason === 'string' ? body.reason : undefined
        }, { requestHeaders: request.requestHeaders })
      }
    );
  }));

  server.post('/v1/orders/:orderId/external-production-started', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          { type: 'external-production-started' },
          { requestHeaders: request.requestHeaders }
        )
      }
    )
  ));

  server.post('/v1/orders/:orderId/external-production-completed', withDemoErrors((_schema, request) =>
    new Response(
      200,
      {},
      {
        order: applyOrderAction(
          request.params.orderId,
          { type: 'external-production-completed' },
          { requestHeaders: request.requestHeaders }
        )
      }
    )
  ));
}
