import { Button } from '@nexor/design-system';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { CookieConsentDraft, CookieConsentState } from './storage';

const BannerShell = styled.div`
  position: fixed;
  left: 24px;
  right: 24px;
  bottom: 24px;
  z-index: 90;
  pointer-events: none;

  @media (max-width: 768px) {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }
`;

const BannerCard = styled.aside`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 20px 20px 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.14);
  pointer-events: auto;
`;

const BannerLabel = styled.p`
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const BannerTitle = styled.h2`
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const BannerBody = styled.p`
  margin: 0;
  max-width: 780px;
  font-size: 14px;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
`;

const PolicyLink = styled(Link)`
  align-self: center;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 120ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const PreferencesPanel = styled.div`
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

const PreferencesTitle = styled.p`
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const PreferencesBody = styled.p`
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PreferencesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PreferenceCard = styled.label<{ $disabled?: boolean }>`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgBase};
  opacity: ${({ $disabled }) => ($disabled ? 0.82 : 1)};
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: ${({ theme }) => theme.colors.textPrimary};
`;

const PreferenceContent = styled.span`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PreferenceName = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const PreferenceDescription = styled.span`
  font-size: 12px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

type CookieConsentBannerProps = {
  consent: CookieConsentState | null;
  isVisible: boolean;
  showPreferences: boolean;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onOpenPreferences: () => void;
  onSavePreferences: (draft: CookieConsentDraft) => void;
  onClosePreferences: () => void;
};

function getDraftFromConsent(consent: CookieConsentState | null): CookieConsentDraft {
  return {
    preferences: consent?.preferences ?? false,
    analytics: consent?.analytics ?? false,
  };
}

export function CookieConsentBanner({
  consent,
  isVisible,
  showPreferences,
  onAcceptAll,
  onRejectAll,
  onOpenPreferences,
  onSavePreferences,
  onClosePreferences,
}: CookieConsentBannerProps) {
  const [draft, setDraft] = useState<CookieConsentDraft>(() => getDraftFromConsent(consent));

  useEffect(() => {
    if (isVisible) {
      setDraft(getDraftFromConsent(consent));
    }
  }, [consent, isVisible, showPreferences]);

  if (!isVisible) {
    return null;
  }

  return (
    <BannerShell>
      <BannerCard aria-label="Consentimento de cookies">
        <BannerLabel>Preferências de cookies</BannerLabel>
        <BannerTitle>Seu controle continua com você</BannerTitle>
        <BannerBody>
          Usamos cookies necessários para o site funcionar com segurança. Os cookies opcionais ajudam a
          lembrar preferências e entender o uso do site para melhorar a experiência.
        </BannerBody>

        {!showPreferences ? (
          <ActionRow>
            <Button size="sm" onClick={onAcceptAll}>
              Aceitar cookies opcionais
            </Button>
            <Button size="sm" variant="secondary" onClick={onRejectAll}>
              Recusar cookies opcionais
            </Button>
            <Button size="sm" variant="ghost" onClick={onOpenPreferences}>
              Gerenciar preferências
            </Button>
            <PolicyLink to="/cookies">Ler política de cookies</PolicyLink>
          </ActionRow>
        ) : (
          <PreferencesPanel>
            <PreferencesTitle>Escolha quais cookies opcionais podem ser ativados</PreferencesTitle>
            <PreferencesBody>
              Os cookies necessários continuam ativos porque sustentam a navegação básica e a segurança da conta.
            </PreferencesBody>

            <PreferencesGrid>
              <PreferenceCard $disabled>
                <Checkbox type="checkbox" checked disabled aria-label="Cookies necessários" />
                <PreferenceContent>
                  <PreferenceName>Cookies necessários</PreferenceName>
                  <PreferenceDescription>
                    Mantêm login, segurança e funcionamento essencial do site.
                  </PreferenceDescription>
                </PreferenceContent>
              </PreferenceCard>

              <PreferenceCard>
                <Checkbox
                  type="checkbox"
                  checked={draft.preferences}
                  aria-label="Cookies de preferências"
                  onChange={() => {
                    setDraft((current) => ({ ...current, preferences: !current.preferences }));
                  }}
                />
                <PreferenceContent>
                  <PreferenceName>Cookies de preferências</PreferenceName>
                  <PreferenceDescription>
                    Lembram escolhas de navegação para não repetir configurações em cada visita.
                  </PreferenceDescription>
                </PreferenceContent>
              </PreferenceCard>

              <PreferenceCard>
                <Checkbox
                  type="checkbox"
                  checked={draft.analytics}
                  aria-label="Cookies de analytics"
                  onChange={() => {
                    setDraft((current) => ({ ...current, analytics: !current.analytics }));
                  }}
                />
                <PreferenceContent>
                  <PreferenceName>Cookies de analytics</PreferenceName>
                  <PreferenceDescription>
                    Medem páginas acessadas e uso geral do site para orientar melhorias.
                  </PreferenceDescription>
                </PreferenceContent>
              </PreferenceCard>
            </PreferencesGrid>

            <ActionRow>
              <Button size="sm" onClick={() => onSavePreferences(draft)}>
                Salvar preferências
              </Button>
              <Button size="sm" variant="secondary" onClick={onRejectAll}>
                Recusar cookies opcionais
              </Button>
              <Button size="sm" variant="ghost" onClick={onAcceptAll}>
                Aceitar cookies opcionais
              </Button>
              {consent ? (
                <Button size="sm" variant="ghost" onClick={onClosePreferences}>
                  Fechar
                </Button>
              ) : null}
              <PolicyLink to="/cookies">Ler política de cookies</PolicyLink>
            </ActionRow>
          </PreferencesPanel>
        )}
      </BannerCard>
    </BannerShell>
  );
}
