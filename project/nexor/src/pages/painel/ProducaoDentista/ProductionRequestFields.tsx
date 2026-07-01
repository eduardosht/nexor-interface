import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { CheckboxField, Field, UploadField, type UploadFieldFile } from '@nexor/design-system';
import type { BiteplanerPurchaseConfiguration, ProductionRequestDraft } from '../../../features/demo/biteplanerFlow';
import {
  confirmProductionScanUpload,
  createProductionScanUploadIntent,
} from '../../../features/biteplaner/orders/orders.api';
import {
  PRODUCTION_UPLOAD_POLICIES,
  uploadProductionRequestFile,
  validateProductionRequestFile,
  type ExternalUploadPurpose,
} from '../../../features/demo/externalUploadGateway';
import { FieldsGrid } from '../admin/styles';
import * as S from './styles';

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
const PRIVATE_STORAGE_RECEIPT = 'Arquivo recebido no armazenamento privado.';
const PRIVATE_STORAGE_PENDING = 'Enviando arquivo para o armazenamento privado.';
const DEFAULT_UPLOAD_ERROR = 'Não foi possível anexar o arquivo.';
const SESSION_UPLOAD_ERROR = 'Não foi possível anexar o arquivo. Atualize a sessão e tente novamente.';

function fileListFromName(fileName: string, fileId?: string | null, sizeLabel?: string): UploadFieldFile[] {
  if (!fileName.trim()) {
    return [];
  }

  return [
    {
      id: fileId ?? fileName,
      name: fileName,
      status: 'uploaded',
      sizeLabel,
    },
  ];
}

type ProductionRequestFieldsProps = {
  draft: ProductionRequestDraft;
  orderId?: string | undefined;
  token?: string | undefined;
  dentistRecommendedPurchaseConfiguration?: BiteplanerPurchaseConfiguration | null;
  onChange: (patch: Partial<ProductionRequestDraft>) => void;
  onUploadStateChange?: (uploading: boolean) => void;
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
  orderId,
  token,
  dentistRecommendedPurchaseConfiguration,
  onChange,
  onUploadStateChange,
}: ProductionRequestFieldsProps) {
  const [uploadErrors, setUploadErrors] = useState<Partial<Record<ExternalUploadPurpose, UploadFieldFile>>>({});
  const [uploadStatus, setUploadStatus] = useState<Partial<Record<ExternalUploadPurpose, 'uploading' | 'uploaded'>>>({});
  const uploadSequenceRef = useRef(0);
  const purchaseConfiguration = draft.purchaseConfiguration;
  const productionRequestSummaryField = useDebouncedDraftText(draft.productionRequestSummary, (value) =>
    onChange({ productionRequestSummary: value })
  );
  const labNotesField = useDebouncedDraftText(draft.labNotes, (value) => onChange({ labNotes: value }));
  const wasChangedByCustomer =
    purchaseConfiguration &&
    dentistRecommendedPurchaseConfiguration &&
    !isSamePurchaseConfiguration(purchaseConfiguration, dentistRecommendedPurchaseConfiguration);

  function invalidateCurrentUpload() {
    uploadSequenceRef.current += 1;
    return uploadSequenceRef.current;
  }

  function isCurrentUpload(uploadSequence: number) {
    return uploadSequenceRef.current === uploadSequence;
  }

  async function handleProductionFileChange(purpose: ExternalUploadPurpose, files: File[]) {
    const file = files[0];
    const nameKey = 'scan3dFileName';
    const refKey = 'scan3dFileRef';

    if (!file) {
      invalidateCurrentUpload();
      setUploadStatus((current) => ({ ...current, [purpose]: undefined }));
      setUploadErrors((current) => ({ ...current, [purpose]: undefined }));
      onChange({ [nameKey]: '', [refKey]: null });
      onUploadStateChange?.(false);
      return;
    }

    const validation = validateProductionRequestFile(file, purpose);

    if (!validation.valid) {
      invalidateCurrentUpload();
      setUploadStatus((current) => ({ ...current, [purpose]: undefined }));
      setUploadErrors((current) => ({
        ...current,
        [purpose]: {
          id: `error-${purpose}-${file.name}-${file.lastModified}`,
          name: file.name,
          status: 'error',
          errorMessage: validation.message,
        },
      }));
      onChange({ [nameKey]: '', [refKey]: null });
      onUploadStateChange?.(false);
      return;
    }

    if (!orderId || !token) {
      invalidateCurrentUpload();
      setUploadStatus((current) => ({ ...current, [purpose]: undefined }));
      setUploadErrors((current) => ({
        ...current,
        [purpose]: {
          id: `error-${purpose}-${file.name}-${file.lastModified}`,
          name: file.name,
          status: 'error',
          errorMessage: SESSION_UPLOAD_ERROR,
        },
      }));
      onChange({ [nameKey]: '', [refKey]: null });
      onUploadStateChange?.(false);
      return;
    }

    const uploadSequence = invalidateCurrentUpload();
    onUploadStateChange?.(true);
    setUploadStatus((current) => ({ ...current, [purpose]: 'uploading' }));
    setUploadErrors((current) => ({ ...current, [purpose]: undefined }));
    onChange({ [nameKey]: '', [refKey]: null });

    try {
      const fileRef = await uploadProductionRequestFile({
        file,
        purpose,
        orderId,
        token,
        createIntent: createProductionScanUploadIntent,
        confirmUpload: confirmProductionScanUpload,
      });
      if (!isCurrentUpload(uploadSequence)) {
        return;
      }
      setUploadStatus((current) => ({ ...current, [purpose]: 'uploaded' }));
      setUploadErrors((current) => ({ ...current, [purpose]: undefined }));
      onChange({ [nameKey]: file.name, [refKey]: fileRef });
    } catch (error) {
      if (!isCurrentUpload(uploadSequence)) {
        return;
      }
      setUploadStatus((current) => ({ ...current, [purpose]: undefined }));
      setUploadErrors((current) => ({
        ...current,
        [purpose]: {
          id: `error-${purpose}-${file.name}-${file.lastModified}`,
          name: file.name,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : DEFAULT_UPLOAD_ERROR,
        },
      }));
      onChange({ [nameKey]: '', [refKey]: null });
    } finally {
      if (isCurrentUpload(uploadSequence)) {
        onUploadStateChange?.(false);
      }
    }
  }

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
          placeholder="Descreva somente instruções operacionais necessárias à fabricação do Biteplaner."
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
          accept={PRODUCTION_UPLOAD_POLICIES.scan3d.accept}
          hint="Obrigatório anexar 1 arquivo de escaneamento 3D intraoral. Formatos aceitos: STL, PLY, OBJ, DICOM, ZIP ou PDF, até 100 MB."
          files={
            uploadErrors.scan3d
              ? [uploadErrors.scan3d]
              : draft.scan3dFileName.trim()
                ? fileListFromName(draft.scan3dFileName, draft.scan3dFileRef?.id, PRIVATE_STORAGE_RECEIPT)
                : []
          }
          onFilesChange={(files) => {
            void handleProductionFileChange('scan3d', files);
          }}
          onRemoveFile={() => {
            invalidateCurrentUpload();
            setUploadStatus((current) => ({ ...current, scan3d: undefined }));
            setUploadErrors((current) => ({ ...current, scan3d: undefined }));
            onChange({ scan3dFileName: '', scan3dFileRef: null });
            onUploadStateChange?.(false);
          }}
        />
        {uploadStatus.scan3d === 'uploading' ? (
          <S.AttachmentStatusMessage role="status">{PRIVATE_STORAGE_PENDING}</S.AttachmentStatusMessage>
        ) : null}
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
