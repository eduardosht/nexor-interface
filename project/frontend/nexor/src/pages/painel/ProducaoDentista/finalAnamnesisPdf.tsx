import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import type { DemoOrderSummary, DemoWorkflowForm, ProductionRequestDraft } from '../../../features/demo/biteplanerFlow';

const missingValue = 'Não informado';
const navy = '#0b3566';
const border = '#9fb2cc';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getPayloadSection(form: DemoWorkflowForm | undefined, key: 'customer' | 'dentist') {
  const payload = isRecord(form?.payload) ? form.payload : {};
  const section = payload[key];
  return isRecord(section) ? section : {};
}

function value(rawValue: unknown): string {
  if (Array.isArray(rawValue)) {
    return rawValue.length > 0 ? rawValue.map(value).join(', ') : missingValue;
  }

  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return missingValue;
  }

  if (rawValue === 'yes') return 'Sim';
  if (rawValue === 'no') return 'Não';

  return String(rawValue);
}

function checkText(raw: unknown) {
  return value(raw) === 'Sim' ? '(x) Sim   ( ) Não' : value(raw) === 'Não' ? '( ) Sim   (x) Não' : '( ) Sim   ( ) Não';
}

const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 160,
  },
  toothMark: {
    width: 42,
    height: 42,
    borderWidth: 2,
    borderColor: navy,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  toothMarkText: {
    color: navy,
    fontSize: 18,
    fontWeight: 700,
  },
  clinicName: {
    color: navy,
    fontSize: 16,
    fontWeight: 700,
  },
  clinicSub: {
    color: navy,
    fontSize: 7,
    letterSpacing: 3,
  },
  titleBlock: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: navy,
    fontSize: 24,
    fontWeight: 700,
  },
  subtitle: {
    color: navy,
    fontSize: 14,
    fontWeight: 700,
  },
  dateBox: {
    width: 110,
    height: 42,
    borderWidth: 1,
    borderColor: '#6b7280',
    borderRadius: 6,
    padding: 8,
  },
  dateLabel: {
    fontSize: 8,
    marginBottom: 10,
  },
  columns: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 7,
  },
  section: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: 7,
    overflow: 'hidden',
  },
  sectionHeader: {
    minHeight: 20,
    backgroundColor: navy,
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: 700,
  },
  sectionBody: {
    padding: 8,
    gap: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 8.5,
  },
  line: {
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#a8b3c4',
    minHeight: 12,
    paddingLeft: 3,
  },
  lineText: {
    fontSize: 8.5,
  },
  paragraphLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#a8b3c4',
    minHeight: 16,
    paddingTop: 3,
  },
  bullet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.4,
  },
  check: {
    width: 96,
    fontSize: 8.4,
  },
  subHeading: {
    color: navy,
    fontSize: 8.7,
    fontWeight: 700,
    marginTop: 2,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  checkboxItem: {
    width: '31%',
    fontSize: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: '#a8b3c4',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 16,
  },
  tableHeader: {
    backgroundColor: '#e9edf4',
  },
  tableCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#a8b3c4',
    borderBottomWidth: 1,
    borderBottomColor: '#a8b3c4',
    padding: 3,
    fontSize: 7.5,
  },
  tableLastCell: {
    borderRightWidth: 0,
  },
  consent: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 7,
    overflow: 'hidden',
  },
  consentText: {
    fontSize: 8,
    lineHeight: 1.4,
    marginBottom: 16,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  signature: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 4,
    textAlign: 'center',
    fontSize: 7.5,
  },
  footer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#edf2f8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerText: {
    flex: 1,
    color: navy,
    fontSize: 7.5,
    lineHeight: 1.35,
  },
});

function FillLine({ label, children }: { label: string; children: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line}>
        <Text style={styles.lineText}>{children}</Text>
      </View>
    </View>
  );
}

function BulletCheck({ label, raw }: { label: string; raw: unknown }) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.bulletText}>• {label}</Text>
      <Text style={styles.check}>{checkText(raw)}</Text>
    </View>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{number}. {title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function MedicationTable({ customer }: { customer: Record<string, unknown> }) {
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={styles.tableCell}>Medicamento</Text>
        <Text style={styles.tableCell}>Dosagem</Text>
        <Text style={[styles.tableCell, styles.tableLastCell]}>Frequencia</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>{value(customer.currentMedicationName)}</Text>
        <Text style={styles.tableCell}>{value(customer.currentMedicationDosage)}</Text>
        <Text style={[styles.tableCell, styles.tableLastCell]}>{value(customer.currentMedicationFrequency)}</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.tableCell}> </Text>
        <Text style={styles.tableCell}> </Text>
        <Text style={[styles.tableCell, styles.tableLastCell]}> </Text>
      </View>
    </View>
  );
}

function ClinicalTable({ dentist }: { dentist: Record<string, unknown> }) {
  const rows: Array<[string, unknown]> = [
    ['Oclusão', dentist.occlusion],
    ['Abertura sem dor', dentist.painlessMaxOpeningMm],
    ['Abertura com dor', dentist.painfulMaxOpeningMm],
    ['ATM', dentist.hasTmdDiagnosis],
    ['Observações clínicas', dentist.clinicalSectionNotes],
    ['Pontos de atenção', dentist.clinicalDecisionAttentionPoints],
  ];

  return (
    <View style={styles.table}>
      {rows.map(([label, raw]) => (
        <View style={styles.tableRow} key={String(label)}>
          <Text style={[styles.tableCell, { flex: 0.42 }]}>{label}</Text>
          <Text style={[styles.tableCell, styles.tableLastCell]}>{value(raw)}</Text>
        </View>
      ))}
    </View>
  );
}

function FinalAnamnesisDocument({
  order,
  intakeForm,
  draft,
}: {
  order: DemoOrderSummary;
  intakeForm: DemoWorkflowForm | undefined;
  draft: ProductionRequestDraft;
}) {
  const customer = getPayloadSection(intakeForm, 'customer');
  const dentist = getPayloadSection(intakeForm, 'dentist');
  const generatedAt = new Date().toLocaleDateString('pt-BR');
  const patientName = value(customer.fullName ?? order.customer?.full_name);

  return (
    <Document author="Nexor Biteplaner" title={`Ficha de Anamnese ${order.id}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.toothMark}>
              <Text style={styles.toothMarkText}>BP</Text>
            </View>
            <View>
              <Text style={styles.clinicName}>{value(order.practice_location?.name)}</Text>
              <Text style={styles.clinicSub}>BITEPLANER</Text>
            </View>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>FICHA DE ANAMNESE</Text>
            <Text style={styles.subtitle}>ODONTOLOGICA</Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>DATA:</Text>
            <Text>{generatedAt}</Text>
          </View>
        </View>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Section number={1} title="IDENTIFICACAO DO PACIENTE">
              <FillLine label="Nome completo:">{patientName}</FillLine>
              <FillLine label="Telefone:">{value(order.customer?.phone ?? customer.phone)}</FillLine>
              <FillLine label="E-mail:">{value(order.customer?.email)}</FillLine>
              <FillLine label="Modalidade principal:">{value(customer.sportRoutine)}</FillLine>
              <FillLine label="Convenio:">{missingValue}</FillLine>
            </Section>

            <Section number={2} title="QUEIXA PRINCIPAL">
              <Text>Descreva o motivo principal da consulta:</Text>
              <Text style={styles.paragraphLine}>{value(customer.initialMotivation)}</Text>
              <Text style={styles.paragraphLine}>{value(customer.relevantMedicalDiagnosisDetails)}</Text>
            </Section>

            <Section number={3} title="HISTORICO DA CONDICAO ATUAL">
              <FillLine label="Quando começou?">{missingValue}</FillLine>
              <FillLine label="Dor média última semana:">{value(customer.averagePainLastWeek)}</FillLine>
              <BulletCheck label="O problema piora durante atividade?" raw={customer.trainingJawTensionMoment ? 'yes' : undefined} />
              <BulletCheck label="Ja realizou tratamento anterior?" raw={customer.tratamentoAnterior} />
              <BulletCheck label="Usa medicacao para isso?" raw={customer.currentMedicationUse} />
            </Section>

            <Section number={4} title="HISTORICO MEDICO">
              <Text style={styles.subHeading}>4.1 Doencas pre-existentes</Text>
              <View style={styles.checkboxGrid}>
                <Text style={styles.checkboxItem}>( ) Diabetes</Text>
                <Text style={styles.checkboxItem}>( ) Hipertensão</Text>
                <Text style={styles.checkboxItem}>( ) Cardiopatias</Text>
                <Text style={styles.checkboxItem}>( ) Ansiedade</Text>
                <Text style={styles.checkboxItem}>( ) Epilepsia</Text>
                <Text style={styles.checkboxItem}>( ) Outras</Text>
              </View>
              <FillLine label="Condicoes relatadas:">{value(customer.relevantMedicalDiagnosisDetails)}</FillLine>
              <Text style={styles.subHeading}>4.2 Medicamentos em uso</Text>
              <MedicationTable customer={customer} />
              <Text style={styles.subHeading}>4.3 Alergias</Text>
              <FillLine label="Alergias:">{value(customer.alergias)}</FillLine>
              <Text style={styles.subHeading}>4.4 Cirurgias anteriores</Text>
              <FillLine label="Qual?">{value(customer.cirurgiasAnteriores)}</FillLine>
            </Section>
          </View>

          <View style={styles.column}>
            <Section number={5} title="HISTORICO ODONTOLOGICO">
              <BulletCheck label="Usa aparelho no momento?" raw={customer.usesOrthodonticAppliance} />
              <BulletCheck label="Ja realizou tratamento de canal?" raw={customer.canal} />
              <BulletCheck label="Possui implantes?" raw={customer.implantes} />
              <BulletCheck label="Range ou aperta os dentes?" raw={customer.relevantMedicalDiagnosisDetails} />
              <BulletCheck label="Tem dores na ATM?" raw={customer.hasTmdDiagnosis} />
              <BulletCheck label="Ja sofreu trauma facial?" raw={customer.traumaFacial} />
              <BulletCheck label="Usa protetor bucal?" raw={customer.usaProtetorBucal} />
            </Section>

            <Section number={6} title="HABITOS E ROTINA">
              <BulletCheck label="Fuma" raw={customer.nicotineUse && customer.nicotineUse !== 'none' ? 'yes' : 'no'} />
              <BulletCheck label="Consome bebidas alcoolicas" raw={customer.alcool} />
              <BulletCheck label="Consome cafeina em excesso" raw={customer.cafeina} />
              <FillLine label="Sono:">{value(customer.sleepQualityScore)}</FillLine>
              <FillLine label="Modalidade esportiva:">{value(customer.sportRoutine)}</FillLine>
              <FillLine label="Frequencia treino:">{value(customer.frequenciaTreino)}</FillLine>
              <FillLine label="Intensidade/estresse:">{value(customer.stressLevel)}</FillLine>
            </Section>

            <Section number={7} title="AVALIACAO CLINICA (PROFISSIONAL)">
              <ClinicalTable dentist={dentist} />
            </Section>

            <Section number={8} title="PLANO DE TRATAMENTO / CONDUTA">
              <Text style={styles.paragraphLine}>{value(dentist.initialEvaluationSummary)}</Text>
              <Text style={styles.paragraphLine}>{value(draft.productionRequestSummary)}</Text>
              <Text style={styles.paragraphLine}>{value(draft.labNotes)}</Text>
            </Section>

            <Section number={9} title="OBSERVACOES PROFISSIONAIS">
              <Text style={styles.paragraphLine}>{value(draft.anamnesisSummary)}</Text>
              <Text style={styles.paragraphLine}>Escaneamento 3D: {value(draft.scan3dFileName)}</Text>
              <Text style={styles.paragraphLine}>Prescrição assinada: {value(draft.prescriptionFileName)}</Text>
            </Section>
          </View>
        </View>

        <View style={styles.consent}>
          <Text style={styles.sectionHeader}>10. TERMO DE CONSENTIMENTO</Text>
          <View style={styles.sectionBody}>
            <Text style={styles.consentText}>
              Declaro que as informações fornecidas são verdadeiras e autorizo o uso dos dados para fins de tratamento,
              acompanhamento odontológico e rastreabilidade operacional, conforme a Lei Geral de Protecao de Dados (LGPD).
              É responsabilidade do dentista manter este registro, pois a plataforma não mantém estes dados em banco de
              dados alem do periodo operacional necessário para entrega do produto.
            </Text>
            <View style={styles.signatures}>
              <Text style={styles.signature}>Assinatura do paciente ou responsável</Text>
              <Text style={styles.signature}>Assinatura do cirurgiao-dentista</Text>
              <Text style={styles.signature}>Data: {generatedAt}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Suas informações estão protegidas. Está ficha segue diretrizes de privacidade e segurança clínica da jornada Biteplaner.
          </Text>
          <Text style={styles.footerText}>
            Ordem {order.id} | Laboratório: {value(draft.selectedLabId)} | LGPD: {draft.lgpdConfirmed ? 'Ciente' : 'Pendente'}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function createFinalAnamnesisPdfBlob(
  order: DemoOrderSummary,
  intakeForm: DemoWorkflowForm | undefined,
  draft: ProductionRequestDraft
) {
  return pdf(<FinalAnamnesisDocument order={order} intakeForm={intakeForm} draft={draft} />).toBlob();
}
