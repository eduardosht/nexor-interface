import {
  Button,
  Field,
  MobileStepFlow,
  Select,
  StickyActionBar,
  Tab,
  TabList,
  Tabs,
  type MobileStepDefinition,
} from '@nexor/design-system';
import { useMemo, useState } from 'react';
import { useAdminPortal } from '../../../features/admin/portal';
import { BUSINESS_SETTINGS_CONTENT } from './data';
import * as S from './AdminBusinessSettings.styles';
import { AdminProductGate } from './AdminProductGate';
import {
  CompactFieldsGrid,
  ContractCard,
  ContractDescription,
  ContractTitle,
  FormActionsRow,
  FormSection,
  PageHeader,
  PageStack,
  PageSubtitle,
  PageTitle,
  SectionCardGrid,
  SectionDescription,
  SectionTitle,
} from './styles';


type BusinessTab = 'partners' | 'labs' | 'dentists';
type MobileBusinessStep = 'process' | 'credentialing' | 'contracts' | 'review';

const TAB_LABELS: Record<BusinessTab, string> = {
  partners: 'Instituicoes / Coachers',
  labs: 'Laboratórios',
  dentists: 'Dentistas',
};

const MOBILE_STEPS: MobileStepDefinition[] = [
  {
    id: 'process',
    title: 'Processo e Pagamento',
    summary: 'Datas, repasses, prazos e limites para este produto.',
  },
  {
    id: 'credentialing',
    title: 'Regras de Credenciamento',
    summary: 'Critérios de mercado e capacidade operacional por região.',
  },
  {
    id: 'contracts',
    title: 'Contratos e Documentos',
    summary: 'Modelos usados durante intenção, credenciamento e distrato.',
  },
  {
    id: 'review',
    title: 'Revisão',
    summary: 'Resumo final antes de salvar as configurações de negócio.',
  },
];

export function AdminBusinessSettings() {
  const { selectedProduct } = useAdminPortal();
  const [tab, setTab] = useState<BusinessTab>('partners');
  const [mobileStep, setMobileStep] = useState<MobileBusinessStep>('process');
  const [savedSection, setSavedSection] = useState('');
  const content = useMemo(() => BUSINESS_SETTINGS_CONTENT[tab], [tab]);
  const activeMobileStepIndex = MOBILE_STEPS.findIndex((step) => step.id === mobileStep);

  function goToPreviousMobileStep() {
    if (activeMobileStepIndex > 0) {
      setMobileStep(MOBILE_STEPS[activeMobileStepIndex - 1].id as MobileBusinessStep);
    }
  }

  function goToNextMobileStep() {
    if (mobileStep === 'process') {
      setSavedSection('pagamento');
    }

    if (mobileStep === 'credentialing') {
      setSavedSection('credenciamento');
    }

    if (mobileStep === 'contracts') {
      setSavedSection('contratos');
    }

    if (mobileStep === 'review') {
      setSavedSection('revisao');
      return;
    }

    if (activeMobileStepIndex >= 0 && activeMobileStepIndex < MOBILE_STEPS.length - 1) {
      setMobileStep(MOBILE_STEPS[activeMobileStepIndex + 1].id as MobileBusinessStep);
    }
  }

  function handleMobileStepChange(stepId: string) {
    const nextIndex = MOBILE_STEPS.findIndex((step) => step.id === stepId);

    if (nextIndex > activeMobileStepIndex) {
      goToNextMobileStep();
      return;
    }

    if (nextIndex >= 0) {
      setMobileStep(stepId as MobileBusinessStep);
    }
  }

  function renderMobileStep(step: MobileStepDefinition) {
    if (step.id === 'credentialing') {
      return (
        <FormSection padding="md">
          <CompactFieldsGrid>
            <Select
              label="Criterio de mercado"
              value={content.credentialing.marketCriteria}
              onChange={() => undefined}
              options={[
                { value: content.credentialing.marketCriteria, label: content.credentialing.marketCriteria },
                { value: 'Por perfil de renda', label: 'Por perfil de renda' },
                { value: 'Por capacidade operacional', label: 'Por capacidade operacional' },
              ]}
            />
            <Field as="input" label="Maximo por regiao" defaultValue={content.credentialing.maxPerRegion} />
            <Field as="input" label="SLA de análise" defaultValue="48 horas" />
          </CompactFieldsGrid>
        </FormSection>
      );
    }

    if (step.id === 'contracts') {
      return (
        <FormSection padding="md">
          <S.ContractsInlineGrid>
            {content.contracts.map((contract) => (
              <ContractCard key={contract.title}>
                <div>
                  <ContractTitle>{contract.title}</ContractTitle>
                  <ContractDescription>{contract.description}</ContractDescription>
                </div>
                <Button variant="secondary">Editar modelo</Button>
              </ContractCard>
            ))}
          </S.ContractsInlineGrid>
        </FormSection>
      );
    }

    if (step.id === 'review') {
      return (
        <FormSection padding="md">
          <SectionDescription>
            Revise pagamento em {content.process.paymentDay}, comissão de {content.process.commission} e criterio
            {` ${content.credentialing.marketCriteria.toLowerCase()}`} antes de salvar a configuração.
          </SectionDescription>
        </FormSection>
      );
    }

    return (
      <FormSection padding="md">
        <CompactFieldsGrid>
          <Field
            as="input"
            label="Data de pagamento"
            defaultValue={content.process.paymentDay}
            hint="Dia do mes para pagamento consolidado."
          />
          <Field
            as="input"
            label="Comissão (%)"
            defaultValue={content.process.commission}
            hint="Percentual padrao aplicado ao parceiro."
          />
          <Field as="input" label="Prazo (dias)" defaultValue={content.process.processingDeadline} />
          <Field as="input" label="Limite mensal" defaultValue={content.process.monthlyLimit} />
        </CompactFieldsGrid>
      </FormSection>
    );
  }

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Configuração de Negócio</PageTitle>
        <PageSubtitle>
          {selectedProduct
            ? `Gerencie regras, processos e contratos comerciais do ${selectedProduct.label}.`
            : 'Selecione um produto para configurar suas regras comerciais.'}
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          <Tabs value={tab} onChange={(value) => { setTab(value as BusinessTab); }}>
            <TabList>
              <Tab value="partners">{TAB_LABELS.partners}</Tab>
              <Tab value="labs">{TAB_LABELS.labs}</Tab>
              <Tab value="dentists">{TAB_LABELS.dentists}</Tab>
            </TabList>
          </Tabs>

          <S.DesktopSettingsWrap>
            <SectionCardGrid>
              <FormSection padding="lg">
                <div>
                  <SectionTitle>Processo e Pagamento</SectionTitle>
                  <SectionDescription>
                    Defina datas, repasses, limites e parâmetros internos do processo operacional.
                  </SectionDescription>
                </div>
                <CompactFieldsGrid>
                  <Field
                    as="input"
                    label="Data de pagamento"
                    defaultValue={content.process.paymentDay}
                    hint="Dia do mes para pagamento consolidado."
                  />
                  <Field
                    as="input"
                    label="Comissão (%)"
                    defaultValue={content.process.commission}
                    hint="Percentual padrao aplicado ao parceiro."
                  />
                  <Field
                    as="input"
                    label="Prazo (dias)"
                    defaultValue={content.process.processingDeadline}
                  />
                  <Field
                    as="input"
                    label="Limite mensal"
                    defaultValue={content.process.monthlyLimit}
                  />
                </CompactFieldsGrid>
                <FormActionsRow>
                  <Button onClick={() => { setSavedSection('pagamento'); }}>
                    Salvar configurações
                  </Button>
                </FormActionsRow>
              </FormSection>

              <FormSection padding="lg">
                <div>
                  <SectionTitle>Regras de Credenciamento</SectionTitle>
                  <SectionDescription>
                    Controle critérios de mercado, densidade e capacidade maxima por regiao.
                  </SectionDescription>
                </div>
                <CompactFieldsGrid>
                  <Select
                    label="Criterio de mercado"
                    value={content.credentialing.marketCriteria}
                    onChange={() => undefined}
                    options={[
                      { value: content.credentialing.marketCriteria, label: content.credentialing.marketCriteria },
                      { value: 'Por perfil de renda', label: 'Por perfil de renda' },
                      { value: 'Por capacidade operacional', label: 'Por capacidade operacional' },
                    ]}
                  />
                  <Field
                    as="input"
                    label="Maximo por regiao"
                    defaultValue={content.credentialing.maxPerRegion}
                  />
                  <Field
                    as="input"
                    label="SLA de análise"
                    defaultValue="48 horas"
                  />
                </CompactFieldsGrid>
                <FormActionsRow>
                  <Button onClick={() => { setSavedSection('credenciamento'); }}>
                    Salvar regras
                  </Button>
                </FormActionsRow>
              </FormSection>

              <FormSection padding="lg" style={{ gridColumn: '1 / -1' }}>
                <div>
                  <SectionTitle>Contratos e Documentos</SectionTitle>
                  <SectionDescription>
                    Estruture os modelos padrao usados durante intencao, credenciamento e distrato.
                  </SectionDescription>
                </div>
                <S.ContractsInlineGrid>
                  {content.contracts.map((contract) => (
                    <ContractCard key={contract.title}>
                      <div>
                        <ContractTitle>{contract.title}</ContractTitle>
                        <ContractDescription>{contract.description}</ContractDescription>
                      </div>
                      <Button variant="secondary">Editar modelo</Button>
                    </ContractCard>
                  ))}
                </S.ContractsInlineGrid>
              </FormSection>
            </SectionCardGrid>
          </S.DesktopSettingsWrap>

          <S.MobileSettingsWrap aria-label="Configuração de negócio mobile" role="region">
            <MobileStepFlow
              steps={MOBILE_STEPS}
              activeStepId={mobileStep}
              onStepChange={handleMobileStepChange}
              renderStep={renderMobileStep}
            />
            <StickyActionBar
              secondaryLabel="Voltar"
              secondaryDisabled={activeMobileStepIndex <= 0}
              onSecondary={goToPreviousMobileStep}
              primaryLabel={mobileStep === 'review' ? 'Salvar revisão' : 'Salvar e avançar'}
              onPrimary={goToNextMobileStep}
            />
          </S.MobileSettingsWrap>

          {savedSection ? (
            <SectionDescription>
              Última ação local salva nesta tela: {savedSection}.
            </SectionDescription>
          ) : null}
        </>
      ) : null}
    </PageStack>
  );
}
