import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartPulse,
  History,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  UserRound,
} from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import { formatDate, type DemoOrderSummary, type DemoWorkflowForm, type ProductionRequestDraft } from '../../../features/demo/biteplanerFlow';
import * as S from './DentalAnamnesisRecord.styles';

type DentalAnamnesisRecordProps = {
  order: DemoOrderSummary;
  intakeForm?: DemoWorkflowForm;
  draft: ProductionRequestDraft;
  onSummaryChange: (value: string) => void;
};

type SectionConfig = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  status?: string;
  content: ReactNode;
};

const missingValue = 'Não informado no fluxo atual';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getPayloadSection(form: DemoWorkflowForm | undefined, key: 'customer' | 'dentist') {
  const payload = isRecord(form?.payload) ? form.payload : {};
  const section = payload[key];
  return isRecord(section) ? section : {};
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : missingValue;
  }

  if (value === null || value === undefined || value === '') {
    return missingValue;
  }

  if (value === 'yes') {
    return 'Sim';
  }

  if (value === 'no') {
    return 'Não';
  }

  return String(value);
}

function valueTone(value: unknown): 'success' | 'warning' | 'neutral' {
  if (value === 'yes' || value === true) {
    return 'warning';
  }

  if (value === 'no' || value === false) {
    return 'success';
  }

  return 'neutral';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function calculateCompletion(values: unknown[]) {
  const filled = values.filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null && value !== undefined && value !== '';
  }).length;

  return Math.round((filled / values.length) * 100);
}

function FieldItem({ label, value, important = false }: { label: string; value: unknown; important?: boolean }) {
  const formatted = formatValue(value);

  return (
    <S.DataField $important={important}>
      <S.DataLabel>{label}</S.DataLabel>
      {formatted === missingValue ? <S.EmptyValue>{formatted}</S.EmptyValue> : <S.DataValue>{formatted}</S.DataValue>}
    </S.DataField>
  );
}

function YesNoItem({ label, value }: { label: string; value: unknown }) {
  return (
    <S.Tag $tone={valueTone(value) === 'success' ? 'green' : valueTone(value) === 'warning' ? 'amber' : 'gray'}>
      {label}: {formatValue(value)}
    </S.Tag>
  );
}

export function DentalAnamnesisRecord({ order, intakeForm, draft, onSummaryChange }: DentalAnamnesisRecordProps) {
  const customer = getPayloadSection(intakeForm, 'customer');
  const dentist = getPayloadSection(intakeForm, 'dentist');
  const patientName = formatValue(customer.fullName) !== missingValue
    ? formatValue(customer.fullName)
    : order.customer?.full_name ?? 'Paciente não identificado';
  const appointmentDate = intakeForm?.dentistSubmittedAt ?? intakeForm?.submittedAt ?? order.created_at;
  const painScore = Number(customer.averagePainLastWeek ?? 0);
  const stressScore = Number(customer.stressLevel ?? 0);
  const sleepScore = Number(customer.sleepQualityScore ?? 0);
  const completion = calculateCompletion([
    customer.fullName,
    order.customer?.phone,
    order.customer?.email,
    customer.hasRelevantMedicalDiagnosis,
    customer.hasCurrentPain,
    customer.averagePainLastWeek,
    customer.sportRoutine,
    customer.sleepQualityScore,
    dentist.painlessMaxOpeningMm,
    dentist.initialEvaluationSummary,
    draft.anamnesisSummary,
    draft.lgpdConfirmed,
  ]);

  const sections: SectionConfig[] = [
    {
      id: 'identificacao',
      title: 'Identificacao do paciente',
      description: 'Dados de cadastro e contexto básico do paciente vindos do pedido e do intake.',
      icon: <UserRound size={18} />,
      status: 'Paciente',
      content: (
        <S.Grid>
          <FieldItem label="Nome" value={patientName} important />
          <FieldItem label="Data de nascimento" value={customer.dataNascimento} />
          <FieldItem label="CPF" value={customer.cpf} />
          <FieldItem label="RG" value={customer.rg} />
          <FieldItem label="Telefone" value={order.customer?.phone ?? customer.phone} />
          <FieldItem label="Email" value={order.customer?.email} />
          <FieldItem label="Endereço" value={customer.endereco} />
          <FieldItem label="Convenio" value={customer.convenio} />
          <FieldItem label="Profissão" value={customer.profissão} />
          <FieldItem label="Contato de emergencia" value={customer.contatoEmergencia} />
          <FieldItem label="Idade calculada" value={customer.idadeCalculada} />
          <FieldItem label="Status clínico" value={dentist.initialEvaluationSummary ? 'Revisado pelo dentista' : 'Em revisão'} />
        </S.Grid>
      ),
    },
    {
      id: 'queixa',
      title: 'Queixa principal',
      description: 'Motivacao principal, sintomas e tags automaticas derivadas das respostas do paciente.',
      icon: <AlertTriangle size={18} />,
      status: 'Paciente',
      content: (
        <>
          <FieldItem label="Texto livre da queixa" value={customer.initialMotivation} important />
          <FieldItem label="Observações" value={customer.relevantMedicalDiagnosisDetails} />
          <S.TagRow>
            <YesNoItem label="Dor atual" value={customer.hasCurrentPain} />
            <YesNoItem label="Dificuldade de abertura" value={customer.hasMouthOpeningDifficulty} />
            <S.Tag $tone="blue">Sintomas: {formatValue(customer.painLocations)}</S.Tag>
          </S.TagRow>
        </>
      ),
    },
    {
      id: 'condicao',
      title: 'Historico da condicao atual',
      description: 'Evolucao da dor, intensidade e impacto sobre treino e rotina.',
      icon: <History size={18} />,
      status: 'Paciente',
      content: (
        <S.Grid>
          <FieldItem label="Inicio dos sintomas" value={customer.inicioSintomas} />
          <FieldItem label="Frequencia" value={customer.jointClickFrequency} />
          <S.DataField>
            <S.DataLabel>Intensidade de dor</S.DataLabel>
            <S.Intensity>
              <S.DataValue>{Number.isFinite(painScore) ? `${painScore}/10` : missingValue}</S.DataValue>
              <S.Slider $value={Math.max(0, Math.min(100, painScore * 10))} />
            </S.Intensity>
          </S.DataField>
          <FieldItem label="Piora durante atividade" value={customer.trainingJawTensionMoment} />
          <FieldItem label="Tratamento anterior" value={customer.tratamentoAnterior} />
          <FieldItem label="Medicacoes relacionadas" value={customer.currentMedicationUse} />
        </S.Grid>
      ),
    },
    {
      id: 'medico',
      title: 'Histórico médico',
      description: 'Condicoes sistemicas, alergias, medicamentos e cirurgias relevantes.',
      icon: <HeartPulse size={18} />,
      status: 'Paciente',
      content: (
        <>
          <S.TagRow>
            <YesNoItem label="Diabetes" value={customer.diabetes} />
            <YesNoItem label="Hipertensão" value={customer.hipertensão} />
            <YesNoItem label="Cardiopatias" value={customer.cardiopatias} />
            <YesNoItem label="Ansiedade" value={customer.ansiedade} />
            <YesNoItem label="Epilepsia" value={customer.epilepsia} />
            <YesNoItem label="Diagnóstico médico relevante" value={customer.hasRelevantMedicalDiagnosis} />
          </S.TagRow>
          <S.ModernTable>
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Dosagem</th>
                <th>Frequencia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formatValue(customer.currentMedicationName)}</td>
                <td>{formatValue(customer.currentMedicationDosage)}</td>
                <td>{formatValue(customer.currentMedicationFrequency)}</td>
              </tr>
            </tbody>
          </S.ModernTable>
          <S.TagRow>
            <S.Tag $tone="amber">Alergias: {formatValue(customer.alergias)}</S.Tag>
            <S.Tag $tone="gray">Cirurgias: {formatValue(customer.cirurgiasAnteriores)}</S.Tag>
          </S.TagRow>
        </>
      ),
    },
    {
      id: 'odontológico',
      title: 'Historico odontológico',
      description: 'Uso de aparelho, bruxismo, ATM, protetores e histórico oral.',
      icon: <ClipboardCheck size={18} />,
      status: 'Paciente',
      content: (
        <S.TagRow>
          <YesNoItem label="Usa aparelho" value={customer.usesOrthodonticAppliance} />
          <YesNoItem label="Implantes" value={customer.implantes} />
          <YesNoItem label="Canal" value={customer.canal} />
          <YesNoItem label="Bruxismo" value={customer.relevantMedicalDiagnosisDetails} />
          <YesNoItem label="Dores ATM" value={customer.hasTmdDiagnosis} />
          <YesNoItem label="Trauma facial" value={customer.traumaFacial} />
          <YesNoItem label="Usa protetor bucal" value={customer.usaProtetorBucal} />
          <YesNoItem label="Protese dental" value={customer.hasDentalProsthesis} />
        </S.TagRow>
      ),
    },
    {
      id: 'hábitos',
      title: 'Habitos e rotina',
      description: 'Rotina esportiva, sono, nicotina e fatores de estilo de vida.',
      icon: <Activity size={18} />,
      status: 'Paciente',
      content: (
        <S.Grid>
          <FieldItem label="Fuma" value={customer.nicotineUse} />
          <FieldItem label="Alcool" value={customer.alcool} />
          <FieldItem label="Cafeina" value={customer.cafeina} />
          <S.DataField>
            <S.DataLabel>Sono</S.DataLabel>
            <S.Intensity>
              <S.DataValue>{Number.isFinite(sleepScore) ? `${sleepScore}/10` : missingValue}</S.DataValue>
              <S.Slider $value={Math.max(0, Math.min(100, sleepScore * 10))} />
            </S.Intensity>
          </S.DataField>
          <FieldItem label="Atividade fisica" value={customer.sportRoutine} />
          <FieldItem label="Modalidade esportiva" value={customer.sportRoutine} />
          <FieldItem label="Frequencia treino" value={customer.frequenciaTreino} />
          <S.DataField>
            <S.DataLabel>Estresse percebido</S.DataLabel>
            <S.Intensity>
              <S.DataValue>{Number.isFinite(stressScore) ? `${stressScore}/10` : missingValue}</S.DataValue>
              <S.Slider $value={Math.max(0, Math.min(100, stressScore * 10))} />
            </S.Intensity>
          </S.DataField>
        </S.Grid>
      ),
    },
    {
      id: 'clínica',
      title: 'Avaliação clínica',
      description: 'Area profissional para achados clínicos e indicadores de prioridade.',
      icon: <Stethoscope size={18} />,
      status: 'Profissional',
      content: (
        <>
          <S.ModernTable>
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Registro</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Oclusão</td>
                <td>{formatValue(dentist.occlusion)}</td>
                <td>{formatValue(dentist.riskStatus ?? 'A revisar')}</td>
              </tr>
              <tr>
                <td>Abertura sem dor</td>
                <td>{formatValue(dentist.painlessMaxOpeningMm)} mm</td>
                <td>Mensuracao clínica</td>
              </tr>
              <tr>
                <td>Abertura com dor</td>
                <td>{formatValue(dentist.painfulMaxOpeningMm)} mm</td>
                <td>Mensuracao clínica</td>
              </tr>
              <tr>
                <td>Observações</td>
                <td>{formatValue(dentist.clinicalSectionNotes)}</td>
                <td>{formatValue(dentist.priority ?? 'Normal')}</td>
              </tr>
            </tbody>
          </S.ModernTable>
          <FieldItem label="Pontos de atenção" value={dentist.clinicalDecisionAttentionPoints} important />
        </>
      ),
    },
    {
      id: 'plano',
      title: 'Plano de tratamento',
      description: 'Conduta sugerida e etapas operacionais para continuidade do cuidado.',
      icon: <ClipboardCheck size={18} />,
      status: 'Profissional',
      content: (
        <S.Timeline>
          <S.TimelineItem>
            <S.TimelineDot />
            <div>
              <S.DataValue>Revisão e complemento da avaliação inicial</S.DataValue>
              <S.PatientHint>{dentist.initialEvaluationSummary ? 'Concluído' : 'Pendente'}</S.PatientHint>
            </div>
          </S.TimelineItem>
          <S.TimelineItem>
            <S.TimelineDot />
            <div>
              <S.DataValue>Solicitação de produção e anexos obrigatórios</S.DataValue>
              <S.PatientHint>{draft.productionRequestSummary ? 'Em preenchimento' : 'Aguardando preenchimento'}</S.PatientHint>
            </div>
          </S.TimelineItem>
          <S.TimelineItem>
            <S.TimelineDot />
            <div>
              <S.DataValue>Envio ao laboratório licenciado</S.DataValue>
              <S.PatientHint>{draft.selectedLabId ? 'Laboratório selecionado' : 'Aguardando seleção'}</S.PatientHint>
            </div>
          </S.TimelineItem>
        </S.Timeline>
      ),
    },
    {
      id: 'observacoes',
      title: 'Observações profissionais',
      description: 'Campo amplo para registrar anamnese final e notas essenciais ao prontuario.',
      icon: <FileText size={18} />,
      status: 'Profissional',
      content: (
        <>
          <S.TextArea
            aria-label="Resumo da avaliação inicial / anamnese"
            maxLength={1200}
            placeholder="Registre apenas achados clínicos necessários para avaliação, aptidão e produção. Não inclua dados de terceiros."
            value={draft.anamnesisSummary}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onSummaryChange(event.target.value)}
          />
          <S.UploadBox>
            <span>Anexos e imagens clínicas poderao ser vinculados aqui em uma etapa futura.</span>
            <Upload size={18} />
          </S.UploadBox>
        </>
      ),
    },
    {
      id: 'consentimento',
      title: 'Consentimento',
      description: 'Aceites, responsabilidade profissional e rastreabilidade da ficha.',
      icon: <ShieldCheck size={18} />,
      status: 'Governanca',
      content: (
        <S.Grid>
          <FieldItem label="LGPD operacional" value={draft.lgpdConfirmed ? 'Ciente' : 'Pendente'} />
          <FieldItem label="Aceite digital" value={draft.lgpdConfirmed ? 'Registrado no fluxo' : missingValue} />
          <FieldItem label="Assinatura" value={missingValue} />
          <FieldItem label="Data" value={formatDate(appointmentDate)} />
          <FieldItem label="Profissional responsável" value="Dentista licenciado Biteplaner" />
          <FieldItem label="Guarda do registro" value="Responsabilidade do dentista" />
        </S.Grid>
      ),
    },
  ];

  return (
    <S.Shell data-testid="dental-anamnesis-record">
      <S.Header>
        <S.HeaderTop>
          <S.Brand>
            <S.BrandMark>
              <Stethoscope size={24} />
            </S.BrandMark>
            <S.TitleGroup>
              <S.ClinicName>{order.practice_location?.name ?? 'Clínica Biteplaner'}</S.ClinicName>
              <S.Title>Ficha de anamnese odontológica</S.Title>
              <S.Subtitle>
                Documento clínico digital para revisão, complemento profissional e geração do registro final da ordem
                {` ${order.id}`}.
              </S.Subtitle>
            </S.TitleGroup>
          </S.Brand>
          <S.HeaderMeta>
            <S.Badge $tone={completion >= 80 ? 'success' : 'warning'}>
              <CheckCircle2 size={14} />
              {completion >= 80 ? 'Completa' : 'Em andamento'}
            </S.Badge>
            <S.Badge>
              <CalendarDays size={14} />
              {formatDate(appointmentDate)}
            </S.Badge>
            <S.Badge $tone="neutral">Auto-save visual</S.Badge>
          </S.HeaderMeta>
        </S.HeaderTop>

        <S.StickySummary data-testid="dental-anamnesis-sticky-summary">
          <S.ProgressPanel>
            <S.ProgressHeader>
              <span>Progresso da ficha</span>
              <span>{completion}%</span>
            </S.ProgressHeader>
            <S.ProgressTrack>
              <S.ProgressFill $value={completion} />
            </S.ProgressTrack>
          </S.ProgressPanel>

          <S.PatientStrip>
            <S.Avatar>{getInitials(patientName) || 'P'}</S.Avatar>
            <div>
              <S.PatientName>{patientName}</S.PatientName>
              <S.PatientHint>{order.customer?.email ?? 'Email não informado'} · {order.customer?.phone ?? 'Telefone não informado'}</S.PatientHint>
            </div>
            <S.QuickItem>
              <S.QuickLabel>Tipo</S.QuickLabel>
              <S.QuickValue>Paciente Biteplaner</S.QuickValue>
            </S.QuickItem>
            <S.QuickItem>
              <S.QuickLabel>Status clínico</S.QuickLabel>
              <S.QuickValue>{dentist.initialEvaluationSummary ? 'Revisado' : 'Aguardando revisão'}</S.QuickValue>
            </S.QuickItem>
            <S.QuickItem>
              <S.QuickLabel>Ordem</S.QuickLabel>
              <S.QuickValue>{order.id}</S.QuickValue>
            </S.QuickItem>
          </S.PatientStrip>
        </S.StickySummary>
      </S.Header>

      <S.Body>
        <S.SideNav aria-label="Navegacao da ficha de anamnese">
          {sections.map((section) => (
            <S.NavItem key={section.id} href={`#anamnese-${section.id}`}>
              <Sparkles size={13} />
              {section.title}
            </S.NavItem>
          ))}
        </S.SideNav>

        <S.Sections>
          {sections.map((section, index) => (
            <S.Card key={section.id} id={`anamnese-${section.id}`} open>
              <S.CardSummary>
                <S.SectionIcon>{section.icon}</S.SectionIcon>
                <div>
                  <S.SectionTitle>{index + 1}. {section.title}</S.SectionTitle>
                  <S.SectionDescription>{section.description}</S.SectionDescription>
                </div>
                <S.Badge>{section.status}</S.Badge>
              </S.CardSummary>
              <S.CardContent>{section.content}</S.CardContent>
            </S.Card>
          ))}
        </S.Sections>
      </S.Body>
    </S.Shell>
  );
}
