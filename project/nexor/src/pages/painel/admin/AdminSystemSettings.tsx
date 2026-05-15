import { Badge, Button, Field, Select } from '@nexor/design-system';
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


export function AdminSystemSettings() {
  const { selectedProduct } = useAdminPortal();
  const [messageTitle, setMessageTitle] = useState('Manutencao preventiva agendada');
  const [messageBody, setMessageBody] = useState('Entre 22h e 23h59 realizaremos uma janela controlada de manutenção. O painel administrativo continuará disponível, mas alguns módulos operacionais podem apresentar oscilações temporárias.');
  const [messageType, setMessageType] = useState('Informacao');
  const [purchaseFlowBlocked, setPurchaseFlowBlocked] = useState(false);
  const [notice, setNotice] = useState('');

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
                  onClick={() => {
                    setNotice(`Mensagem "${messageTitle}" preparada como ${messageType.toLowerCase()}.`);
                  }}
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
                  onClick={() => {
                    const next = !purchaseFlowBlocked;
                    setPurchaseFlowBlocked(next);
                    setNotice(
                      next
                        ? 'Fluxo de compras bloqueado para novas ordens.'
                        : 'Fluxo de compras reabilitado para novas ordens.'
                    );
                  }}
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

          {notice ? <SectionDescription>{notice}</SectionDescription> : null}
        </>
      ) : null}
    </PageStack>
  );
}
