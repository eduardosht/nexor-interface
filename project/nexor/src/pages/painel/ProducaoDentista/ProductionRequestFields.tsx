import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { CheckboxField, Field, UploadField, type UploadFieldFile } from '@nexor/design-system';
import type { BiteplanerPurchaseConfiguration, ProductionRequestDraft } from '../../../features/demo/biteplanerFlow';
import { uploadProductionRequestFile } from '../../../features/demo/externalUploadGateway';
import { FieldsGrid } from '../admin/styles';
import * as S from './styles';

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

function fileListFromName(fileName: string, fileId?: string | null): UploadFieldFile[] {
  if (!fileName.trim()) {
    return [];
  }

  return [
    {
      id: fileId ?? fileName,
      name: fileName,
      status: 'uploaded',
    },
  ];
}

type ProductionRequestFieldsProps = {
  draft: ProductionRequestDraft;
  dentistRecommendedPurchaseConfiguration?: BiteplanerPurchaseConfiguration | null;
  onChange: (patch: Partial<ProductionRequestDraft>) => void;
};

function useDebouncedDraftText(value: string, onCommit: (value: string) => void, delayMs = 300) {
  const [localValue, setLocalValue] = useState(value);
  const localValueRef = useRef(localValue);
  const committedValueRef = useRef(value);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    localValueRef.current = localValue;
  }, [localValue]);

  useEffect(() => {
    if (value === committedValueRef.current) {
      return;
    }

    committedValueRef.current = value;
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (localValue === committedValueRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      committedValueRef.current = localValue;
      onCommitRef.current(localValue);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, localValue]);

  useEffect(
    () => () => {
      if (localValueRef.current !== committedValueRef.current) {
        committedValueRef.current = localValueRef.current;
        onCommitRef.current(localValueRef.current);
      }
    },
    []
  );

  function commitLocalValue() {
    if (localValue === committedValueRef.current) {
      return;
    }

    committedValueRef.current = localValue;
    onCommitRef.current(localValue);
  }

  return {
    value: localValue,
    onBlur: commitLocalValue,
    onChange: (event: FieldChangeEvent) => setLocalValue(event.target.value),
  };
}

const formatPurchaseConfiguration = (configuration: BiteplanerPurchaseConfiguration) =>
  `${configuration.model} / ${configuration.color} / ${configuration.quantity}`;

const isSamePurchaseConfiguration = (
  left: BiteplanerPurchaseConfiguration | null | undefined,
  right: BiteplanerPurchaseConfiguration | null | undefined
) =>
  Boolean(
    left &&
    right &&
    left.model === right.model &&
    left.color === right.color &&
    left.quantity === right.quantity
  );

export function ProductionRequestFields({
  draft,
  dentistRecommendedPurchaseConfiguration,
  onChange,
}: ProductionRequestFieldsProps) {
  const purchaseConfiguration = draft.purchaseConfiguration;
  const productionRequestSummaryField = useDebouncedDraftText(draft.productionRequestSummary, (value) =>
    onChange({ productionRequestSummary: value })
  );
  const labNotesField = useDebouncedDraftText(draft.labNotes, (value) => onChange({ labNotes: value }));
  const wasChangedByCustomer =
    purchaseConfiguration &&
    dentistRecommendedPurchaseConfiguration &&
    !isSamePurchaseConfiguration(purchaseConfiguration, dentistRecommendedPurchaseConfiguration);

  return (
    <>
      {purchaseConfiguration ? (
        <S.PurchaseConfigurationBox>
          <S.PurchaseConfigurationTitle>Pedido biteplaner confirmado pelo cliente</S.PurchaseConfigurationTitle>
          <S.PurchaseConfigurationList>
            <span><strong>Modelo:</strong> {purchaseConfiguration.model}</span>
            <span><strong>Cor:</strong> {purchaseConfiguration.color}</span>
            <span><strong>Quantidade:</strong> {purchaseConfiguration.quantity}</span>
          </S.PurchaseConfigurationList>
          {dentistRecommendedPurchaseConfiguration ? (
            <S.PurchaseConfigurationHint>
              <strong>Recomendado na consulta:</strong> {formatPurchaseConfiguration(dentistRecommendedPurchaseConfiguration)}.
              {wasChangedByCustomer
                ? ' O cliente alterou o pedido antes do pagamento. Entre em contato com o cliente para alinhar a alteração antes de prosseguir.'
                : ' O cliente manteve o pedido acordado.'}
            </S.PurchaseConfigurationHint>
          ) : null}
          {wasChangedByCustomer ? (
            <CheckboxField
              checked={Boolean(draft.purchaseDivergenceConfirmed)}
              onChange={(checked) => onChange({ purchaseDivergenceConfirmed: checked })}
              label="Confirmo que revisei a divergência entre recomendação clínica e compra do cliente e autorizo o envio para produção. (*)"
            />
          ) : null}
        </S.PurchaseConfigurationBox>
      ) : null}

      <FieldsGrid>
        <Field
          as="textarea"
          label="Solicitação de produção"
          required
          maxLength={1200}
          placeholder="Descreva a prescrição, parâmetros clínicos estritamente necessários e o direcionamento da produção."
          value={productionRequestSummaryField.value}
          onBlur={productionRequestSummaryField.onBlur}
          onChange={productionRequestSummaryField.onChange}
        />
        <Field
          as="textarea"
          label="Observações para o laboratório"
          maxLength={500}
          placeholder="Inclua somente orientações técnicas necessárias ao laboratório. Evite dados clínicos não essenciais."
          value={labNotesField.value}
          onBlur={labNotesField.onBlur}
          onChange={labNotesField.onChange}
        />
      </FieldsGrid>

      <S.AttachmentGrid>
        <UploadField
          label="Escaneamento 3D intraoral (*)"
          hint="Obrigatório anexar 1 arquivo de escaneamento 3D intraoral."
          files={fileListFromName(draft.scan3dFileName, draft.scan3dFileRef?.id)}
          onFilesChange={(files) => {
            const file = files[0];

            if (!file) {
              onChange({ scan3dFileName: '', scan3dFileRef: null });
              return;
            }

            const fileRef = uploadProductionRequestFile(file, 'scan3d');
            onChange({ scan3dFileName: file.name, scan3dFileRef: fileRef });
          }}
          onRemoveFile={() => onChange({ scan3dFileName: '', scan3dFileRef: null })}
        />

        <UploadField
          label="Prescrição médica assinada e carimbada (*)"
          accept=".pdf,.png,.jpg,.jpeg"
          hint="Obrigatório anexar 1 arquivo de prescrição médica do dentista para o Biteplaner."
          files={fileListFromName(draft.prescriptionFileName, draft.prescriptionFileRef?.id)}
          onFilesChange={(files) => {
            const file = files[0];

            if (!file) {
              onChange({ prescriptionFileName: '', prescriptionFileRef: null });
              return;
            }

            const fileRef = uploadProductionRequestFile(file, 'prescription');
            onChange({ prescriptionFileName: file.name, prescriptionFileRef: fileRef });
          }}
          onRemoveFile={() => onChange({ prescriptionFileName: '', prescriptionFileRef: null })}
        />
      </S.AttachmentGrid>

      <CheckboxField
        checked={draft.lgpdConfirmed}
        onChange={(checked) => onChange({ lgpdConfirmed: checked })}
        label={
          <S.RetentionConsentLabel data-testid="dentist-retention-consent-label">
            Estou ciente de que a plataforma reterá estes dados apenas pelo{' '}
            <strong>tempo necessário para entrega, rastreabilidade e auditoria</strong>, que a{' '}
            <strong>guarda principal do registro clínico</strong> permanece sob minha responsabilidade e
            que o laboratório deve receber apenas <strong>dados operacionais indispensáveis</strong> para fabricação. (*)
          </S.RetentionConsentLabel>
        }
      />
    </>
  );
}
