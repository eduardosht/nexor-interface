import {
  Badge,
  Button,
  Field,
  MobileStepFlow,
  Select,
  StickyActionBar,
  type MobileStepDefinition,
} from '@nexor/design-system';
import { useState } from 'react';
import { useAdminPortal } from '../../../features/admin/portal';
import * as S from './AdminSystemSettings.styles';
import { AdminProductGate } from './AdminProductGate';
import {
  CompactFieldsGrid,
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

type MobileSystemStep = 'message' | 'purchase' | 'review';

const MOBILE_STEPS: MobileStepDefinition[] = [
  {
    id: 'message',
    title: 'Mensagem Global',
    summary: 'Título, tipo, canal e conteúdo enviado após o login.',
  },
  {
    id: 'purchase',
    title: 'Controle de Compras',
    summary: 'Bloqueio ou liberação imediata de novas ordens.',
  },
  {
    id: 'review',
    title: 'Revisão',
    summary: 'Resumo dos controles transversais antes de salvar.',
  },
];

export function AdminSystemSettings() {
  const { selectedProduct } = useAdminPortal();
  const [messageTitle, setMessageTitle] = useState('Manutencao preventiva agendada');
  const [messageBody, setMessageBody] = useState('Entre 22h e 23h59 realizaremos uma janela controlada de manutenção. O painel administrativo continuará disponível, mas alguns módulos operacionais podem apresentar oscilações temporárias.');
  const [messageType, setMessageType] = useState('Informacao');
  const [purchaseFlowBlocked, setPurchaseFlowBlocked] = useState(false);
  const [mobileStep, setMobileStep] = useState<MobileSystemStep>('message');
  const [notice, setNotice] = useState('');
  const activeMobileStepIndex = MOBILE_STEPS.findIndex((step) => step.id === mobileStep);

  function prepareGlobalMessageNotice() {
    setNotice(`Mensagem "${messageTitle}" preparada como ${messageType.toLowerCase()}.`);
  }

  function togglePurchaseFlow() {
    const next = !purchaseFlowBlocked;
    setPurchaseFlowBlocked(next);
    setNotice(
      next
        ? 'Fluxo de compras bloqueado para novas ordens.'
        : 'Fluxo de compras reabilitado para novas ordens.'
    );
  }

  function goToPreviousMobileStep() {
    if (activeMobileStepIndex > 0) {
      setMobileStep(MOBILE_STEPS[activeMobileStepIndex - 1].id as MobileSystemStep);
    }
  }

  function goToNextMobileStep() {
    if (mobileStep === 'message') {
      prepareGlobalMessageNotice();
    }

    if (mobileStep === 'purchase') {
      setNotice(
        purchaseFlowBlocked
          ? 'Compras seguem bloqueadas para novas ordens.'
          : 'Compras seguem liberadas para novas ordens.'
      );
    }

    if (mobileStep === 'review') {
      setNotice('Configuração de sistema revisada localmente.');
      return;
    }

    if (activeMobileStepIndex >= 0 && activeMobileStepIndex < MOBILE_STEPS.length - 1) {
      setMobileStep(MOBILE_STEPS[activeMobileStepIndex + 1].id as MobileSystemStep);
    }
  }

  function renderMobileStep(step: MobileStepDefinition) {
    if (step.id === 'purchase') {
      return (
        <FormSection padding="md">
          <CompactFieldsGrid>
            <Field as="input" label="Janela de revisão" value="Monitoramento em tempo real" readOnly />
            <Field as="input" label="Escopo" value="Novas ordens do Biteplaner" readOnly />
            <Field as="input" label="Responsável atual" value="Operação Nexor" readOnly />
          </CompactFieldsGrid>

          <S.FlowHeader>
            <Badge tone={purchaseFlowBlocked ? 'warning' : 'success'}>
              {purchaseFlowBlocked ? 'Compras bloqueadas' : 'Compras liberadas'}
            </Badge>
            <Button
              variant={purchaseFlowBlocked ? 'secondary' : 'primary'}
              onClick={togglePurchaseFlow}
            >
              {purchaseFlowBlocked ? 'Liberar compras' : 'Bloquear compras'}
            </Button>
          </S.FlowHeader>

          <SectionDescription>
            Status atual do sistema: {purchaseFlowBlocked
              ? 'novos usuários não podem iniciar ordens.'
              : 'usuários podem criar novas ordens normalmente.'}
          </SectionDescription>
        </FormSection>
      );
    }

    if (step.id === 'review') {
      return (
        <FormSection padding="md">
          <SectionDescription>
            Revise a mensagem "{messageTitle}", tipo {messageType.toLowerCase()} e status de compras
            {purchaseFlowBlocked ? ' bloqueadas' : ' liberadas'} antes de salvar.
          </SectionDescription>
          <CompactFieldsGrid>
            <Field as="input" label="Modo manutenção" value="Desativado" readOnly />
            <Field as="input" label="Feature flags" value="Painel demo ativo" readOnly />
            <Field as="input" label="Última sincronização" value="05/05/2026 14:30" readOnly />
          </CompactFieldsGrid>
        </FormSection>
      );
    }

    return (
      <FormSection padding="md">
        <CompactFieldsGrid>
          <Field
            as="input"
            label="Titulo da mensagem"
            value={messageTitle}
            onChange={(event) => { setMessageTitle(event.target.value); }}
          />
          <Select
            label="Tipo de notificação"
            value={messageType}
            onChange={(value) => { setMessageType(value); }}
            options={[
              { value: 'Informacao', label: 'Informacao' },
              { value: 'Alerta', label: 'Alerta' },
              { value: 'Urgente', label: 'Urgente' },
            ]}
          />
          <Field as="input" label="Canal" value="Painel web" readOnly />
        </CompactFieldsGrid>
        <Field
          as="textarea"
          label="Conteúdo da mensagem"
          value={messageBody}
          onChange={(event) => { setMessageBody(event.target.value); }}
        />
      </FormSection>
    );
  }

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Configuração de Sistema</PageTitle>
        <PageSubtitle>
          {selectedProduct
            ? `Gerencie mensagens globais e controles transversais do ${selectedProduct.label}.`
            : 'Selecione um produto para configurar seus controles globais.'}
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          <S.DesktopSettingsWrap>
            <SectionCardGrid>
              <FormSection padding="lg">
              <div>
                <SectionTitle>Mensagem Global pos Login</SectionTitle>
                <SectionDescription>
                  Envie uma notificação importante para todos os usuários após o login.
                </SectionDescription>
              </div>

              <CompactFieldsGrid>
                <Field
                  as="input"
                  label="Titulo da mensagem"
                  value={messageTitle}
                  onChange={(event) => { setMessageTitle(event.target.value); }}
                />
                <Select
                  label="Tipo de notificação"
                  value={messageType}
                  onChange={(value) => { setMessageType(value); }}
                  options={[
                    { value: 'Informacao', label: 'Informacao' },
                    { value: 'Alerta', label: 'Alerta' },
                    { value: 'Urgente', label: 'Urgente' },
                  ]}
                />
                <Field
                  as="input"
                  label="Canal"
                  value="Painel web"
                  readOnly
                />
              </CompactFieldsGrid>
              <Field
                as="textarea"
                label="Conteúdo da mensagem"
                value={messageBody}
                onChange={(event) => { setMessageBody(event.target.value); }}
              />

              <SectionDescription>
              A mensagem será exibida como notificação não lida para todos os usuários no próximo login.
              Quem já estiver logado passa a ver a mensagem imediatamente.
              </SectionDescription>

              <FormActionsRow>
                <Button
                  onClick={prepareGlobalMessageNotice}
                >
                  Enviar mensagem global
                </Button>
              </FormActionsRow>
            </FormSection>

            <FormSection padding="lg">
              <div>
                <SectionTitle>Controle do fluxo de compras</SectionTitle>
                <SectionDescription>
                  Bloqueie imediatamente novas ordens. Ordens já registradas continuam o fluxo normal.
                </SectionDescription>
              </div>

              <CompactFieldsGrid>
                <Field as="input" label="Janela de revisão" value="Monitoramento em tempo real" readOnly />
                <Field as="input" label="Escopo" value="Novas ordens do Biteplaner" readOnly />
                <Field as="input" label="Responsável atual" value="Operação Nexor" readOnly />
              </CompactFieldsGrid>

              <S.FlowHeader>
                <Badge tone={purchaseFlowBlocked ? 'warning' : 'success'}>
                  {purchaseFlowBlocked ? 'Compras bloqueadas' : 'Compras liberadas'}
                </Badge>
                <Button
                  variant={purchaseFlowBlocked ? 'secondary' : 'primary'}
                  onClick={togglePurchaseFlow}
                >
                  {purchaseFlowBlocked ? 'Liberar compras' : 'Bloquear compras'}
                </Button>
              </S.FlowHeader>

              <SectionDescription>
              Status atual do sistema: {purchaseFlowBlocked
                ? 'novos usuários não podem iniciar ordens.'
                : 'usuários podem criar novas ordens normalmente.'}
              </SectionDescription>
            </FormSection>

            <FormSection padding="lg" style={{ gridColumn: '1 / -1' }}>
              <div>
                <SectionTitle>Outras configurações</SectionTitle>
                <SectionDescription>
                  Mantenha espaco preparado para controles extras, como modo manutenção e feature flags.
                </SectionDescription>
              </div>
              <CompactFieldsGrid>
                <Field as="input" label="Modo manutenção" value="Desativado" readOnly />
                <Field as="input" label="Feature flags" value="Painel demo ativo" readOnly />
                <Field as="input" label="Última sincronização" value="05/05/2026 14:30" readOnly />
              </CompactFieldsGrid>
              <FormActionsRow>
                <Button variant="secondary">Configurar modo manutenção</Button>
              </FormActionsRow>
            </FormSection>
            </SectionCardGrid>
          </S.DesktopSettingsWrap>

          <S.MobileSettingsWrap aria-label="Configuração de sistema mobile" role="region">
            <MobileStepFlow
              steps={MOBILE_STEPS}
              activeStepId={mobileStep}
              onStepChange={(stepId) => { setMobileStep(stepId as MobileSystemStep); }}
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

          {notice ? <SectionDescription>{notice}</SectionDescription> : null}
        </>
      ) : null}
    </PageStack>
  );
}
