import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import {
  LegalActions,
  LegalBody,
  LegalContainer,
  LegalDocumentHeader,
  LegalDownloadButton,
  LegalList,
  LegalPage,
  LegalProfileCard,
  LegalProfileGrid,
  LegalProfileIntro,
  LegalSection,
  LegalSectionTitle,
  LegalSubtitle,
  LegalTitle,
  LegalUpdatedAt
} from '../../pages/Legal/styles';
import {
  legalDocuments,
  legalProfiles,
  type LegalDocumentKind,
  type LegalProfileKey
} from './legalDocuments';

const profileKeys = new Set<LegalProfileKey>(legalProfiles.map((profile) => profile.key));

function getSearchProfile(rawProfile: string | null): LegalProfileKey | null {
  return rawProfile && profileKeys.has(rawProfile as LegalProfileKey) ? (rawProfile as LegalProfileKey) : null;
}

export function LegalDocumentPage({
  kind,
  heading,
  intro
}: {
  kind: LegalDocumentKind;
  heading: string;
  intro: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProfile = getSearchProfile(searchParams.get('perfil'));
  const [downloadError, setDownloadError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const selectedContent = useMemo(
    () => (selectedProfile ? legalDocuments[kind][selectedProfile] : null),
    [kind, selectedProfile]
  );

  function handleSelectProfile(profile: LegalProfileKey) {
    setDownloadError('');
    setSearchParams({ perfil: profile });
  }

  async function handleDownloadPdf() {
    if (!selectedContent || isDownloading) {
      return;
    }

    setDownloadError('');
    setIsDownloading(true);

    try {
      const { createLegalDocumentPdfBlob } = await import('./legalPdf');
      const blob = await createLegalDocumentPdfBlob(selectedContent);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = selectedContent.pdfFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError('Não foi possível gerar o PDF agora.');
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <LegalPage>
      <LegalContainer>
        <LegalTitle>{heading}</LegalTitle>
        <LegalProfileIntro>{intro}</LegalProfileIntro>

        <LegalProfileGrid aria-label="Selecione o perfil do documento">
          {legalProfiles.map((profile) => (
            <LegalProfileCard
              key={profile.key}
              type="button"
              $active={selectedProfile === profile.key}
              onClick={() => handleSelectProfile(profile.key)}
            >
              <strong>{profile.title}</strong>
              <span>{profile.description}</span>
            </LegalProfileCard>
          ))}
        </LegalProfileGrid>

        {selectedContent ? (
          <>
            <LegalDocumentHeader>
              <div>
                <LegalTitle as="h2">{selectedContent.title}</LegalTitle>
                <LegalSubtitle>{selectedContent.subtitle}</LegalSubtitle>
                <LegalUpdatedAt>
                  {selectedContent.updatedAt} · {selectedContent.version}
                </LegalUpdatedAt>
              </div>
              <LegalActions>
                <LegalDownloadButton type="button" onClick={handleDownloadPdf} disabled={isDownloading}>
                  <Download size={16} aria-hidden="true" />
                  {isDownloading ? 'Gerando PDF' : 'Baixar PDF'}
                </LegalDownloadButton>
              </LegalActions>
            </LegalDocumentHeader>

            {downloadError ? <LegalBody role="alert">{downloadError}</LegalBody> : null}

            {selectedContent.sections.map((section) => (
              <LegalSection key={section.title}>
                <LegalSectionTitle>{section.title}</LegalSectionTitle>
                {section.body?.map((paragraph) => (
                  <LegalBody key={paragraph}>{paragraph}</LegalBody>
                ))}
                {section.items ? (
                  <LegalList>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </LegalList>
                ) : null}
              </LegalSection>
            ))}
          </>
        ) : null}
      </LegalContainer>
    </LegalPage>
  );
}
