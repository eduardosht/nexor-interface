import type { ChangeEvent } from 'react';
import { CheckboxField, Field, UploadField, type UploadFieldFile } from '@nexor/design-system';
import type { ProductionRequestDraft } from '../../../features/demo/biteplanerFlow';
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
  onChange: (patch: Partial<ProductionRequestDraft>) => void;
};

export function ProductionRequestFields({ draft, onChange }: ProductionRequestFieldsProps) {
  return (
    <>
      <FieldsGrid>
        <Field
          as="textarea"
          label="Solicitação de produção"
          maxLength={1200}
          placeholder="Descreva a prescrição, parâmetros clínicos estritamente necessários e o direcionamento da produção."
          value={draft.productionRequestSummary}
          onChange={(event: FieldChangeEvent) => onChange({ productionRequestSummary: event.target.value })}
        />
        <Field
          as="textarea"
          label="Observações para o laboratório"
          maxLength={500}
          placeholder="Inclua somente orientações técnicas necessárias ao laboratório. Evite dados clínicos não essenciais."
          value={draft.labNotes}
          onChange={(event: FieldChangeEvent) => onChange({ labNotes: event.target.value })}
        />
      </FieldsGrid>

      <S.AttachmentGrid>
        <UploadField
          label="Escaneamento 3D intraoral"
          accept=".stl,.obj,.ply,.zip"
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
          label="Prescrição médica assinada e carimbada"
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
            que o laboratório deve receber apenas <strong>dados operacionais indispensáveis</strong> para fabricação.
          </S.RetentionConsentLabel>
        }
      />
    </>
  );
}
