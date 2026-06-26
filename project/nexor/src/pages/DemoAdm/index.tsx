import { FormEvent, useMemo, useState } from 'react';

const SESSION_KEY = 'nexor-demo-adm-authorized';
const DEFAULT_PASSCODE = 'nexor-demo-adm-2026';
const DEMO_ASSET_BASE = '/demo-adm-assets/assets/apresentacao-painel-admin/';
const VIDEO_SRC = `${DEMO_ASSET_BASE}video/biteplaner-fluxo-completo-e2e.webm`;
const VIDEO_POSTER = `${DEMO_ASSET_BASE}e2e-18-cliente-onboarding-formulario.png`;

type DemoMode = 'video' | 'content';

const e2eScreenshotFiles = [
  'e2e-01-cadastro-conta-partner-dados.png',
  'e2e-02-cadastro-conta-partner-consentimentos.png',
  'e2e-03-parceiro-home-atalho-cadastro.png',
  'e2e-04-cadastro-parceiro-formulario.png',
  'e2e-05-cadastro-parceiro-preenchido.png',
  'e2e-06-cadastro-parceiro-enviado.png',
  'e2e-07-admin-login-antes-aprovacoes.png',
  'e2e-08-admin-aprovacao-parceiros.png',
  'e2e-09-admin-aprovacao-parceiro-modal.png',
  'e2e-10-admin-aprovacao-parceiro-aprovado.png',
  'e2e-11-parceiro-dashboard-gerar-link.png',
  'e2e-12-parceiro-indicar-preenchido.png',
  'e2e-13-parceiro-link-gerado-modal.png',
  'e2e-14-cadastro-conta-customer-dados.png',
  'e2e-15-cadastro-conta-customer-consentimentos.png',
  'e2e-16-cliente-hub-antes-pedido.png',
  'e2e-17-cliente-jornada-pedido-criado.png',
  'e2e-18-cliente-onboarding-formulario.png',
  'e2e-19-cliente-onboarding-step-1.png',
  'e2e-20-cliente-onboarding-step-2.png',
  'e2e-21-cliente-jornada-onboarding-enviado.png',
  'e2e-22-cliente-pre-consulta-formulario.png',
  'e2e-23-cliente-pre-consulta-step-1.png',
  'e2e-24-cliente-pre-consulta-step-2.png',
  'e2e-25-cliente-pre-consulta-step-3.png',
  'e2e-26-cliente-pre-consulta-step-4.png',
  'e2e-27-cliente-formulario-pronto-para-envio.png',
  'e2e-28-cliente-pre-consulta-pronta-para-envio.png',
  'e2e-29-cliente-jornada-pre-consulta-enviada.png',
  'e2e-30-cliente-selecao-clinica-abertura.png',
  'e2e-31-cliente-selecao-clinica-escolhida.png',
  'e2e-32-cliente-selecao-clinica-confirmada.png',
  'e2e-33-dentista-listagem-aceite-consulta.png',
  'e2e-34-dentista-listagem-aceite-consulta-modal.png',
  'e2e-35-dentista-listagem-aceite-consulta.png',
  'e2e-36-cliente-confirmacao-consulta-realizada.png',
  'e2e-37-cliente-confirmacao-consulta-realizada-enviada.png',
  'e2e-38-dentista-listagem-confirmacao-consulta.png',
  'e2e-39-dentista-listagem-confirmacao-consulta-modal.png',
  'e2e-40-dentista-listagem-confirmacao-consulta.png',
  'e2e-41-dentista-producao-consulta-aceita.png',
  'e2e-42-dentista-complemento-pre-consulta.png',
  'e2e-43-dentista-complemento-pre-consulta-step-1.png',
  'e2e-44-dentista-complemento-pre-consulta-step-2.png',
  'e2e-45-dentista-complemento-pre-consulta-step-3.png',
  'e2e-46-dentista-complemento-pre-consulta-enviado.png',
  'e2e-47-dentista-producao-elegibilidade.png',
  'e2e-48-cliente-compra-biteplaner.png',
  'e2e-49-cliente-compra-sucesso.png',
  'e2e-50-dentista-producao-pagamento-confirmado.png',
  'e2e-51-dentista-selecao-laboratorio-abertura.png',
  'e2e-52-dentista-producao-formulario-preenchido.png',
  'e2e-53-dentista-selecao-laboratorio-escolhido.png',
  'e2e-54-dentista-producao-solicitada.png',
  'e2e-55-laboratorio-hub-antes-producao.png',
  'e2e-56-laboratorio-listagem-aprova-producao-modal.png',
  'e2e-57-laboratorio-listagem-aprova-producao.png',
  'e2e-58-laboratorio-producao-iniciada.png',
  'e2e-59-laboratorio-listagem-entrega-producao-modal.png',
  'e2e-60-laboratorio-listagem-entrega-producao.png',
  'e2e-61-laboratorio-producao-concluida.png',
  'e2e-62-dentista-produto-recebido.png',
  'e2e-63-dentista-adaptacao-concluida.png',
  'e2e-64-survey-partner_review_by_customer-aberto.png',
  'e2e-65-survey-partner_review_by_customer-modal.png',
  'e2e-66-survey-partner_review_by_customer-preenchido.png',
  'e2e-67-survey-dentist_review_by_customer-aberto.png',
  'e2e-68-survey-dentist_review_by_customer-modal.png',
  'e2e-69-survey-dentist_review_by_customer-preenchido.png',
  'e2e-70-survey-lab_review_by_dentist-aberto.png',
  'e2e-71-survey-lab_review_by_dentist-modal.png',
  'e2e-72-survey-lab_review_by_dentist-preenchido.png',
  'e2e-73-survey-dentist_review_by_lab-aberto.png',
  'e2e-74-survey-dentist_review_by_lab-modal.png',
  'e2e-75-survey-dentist_review_by_lab-preenchido.png',
  'e2e-76-cliente-avaliacoes-enviadas.png',
  'e2e-77-dentista-avaliacoes-enviadas.png',
  'e2e-78-laboratorio-avaliacoes-enviadas.png',
  'e2e-79-cadastro-conta-deletionCustomer-dados.png',
  'e2e-80-cadastro-conta-deletionCustomer-consentimentos.png',
  'e2e-81-cliente-remocao-jornada-ativa.png',
  'e2e-82-cliente-remocao-conta-abertura.png',
  'e2e-83-cliente-remocao-conta-modal-confirmacao.png',
  'e2e-84-cliente-remocao-conta-pendente.png',
  'e2e-85-cliente-remocao-conta-analise.png',
  'e2e-86-admin-remocao-lista.png',
  'e2e-87-admin-remocao-modal.png',
  'e2e-88-admin-remocao-aprovada.png',
  'e2e-89-cliente-remocao-jornada-interrompida.png',
  'e2e-90-parceiro-hub-final.png'
] as const;

const screenshotSections = [
  { id: 'cadastro-parceiro', title: 'Parceiro e aprovação inicial', range: [1, 13] },
  { id: 'cliente-onboarding', title: 'Cliente, onboarding e pré-consulta', range: [14, 32] },
  { id: 'dentista-clinica', title: 'Dentista e confirmação clínica', range: [33, 47] },
  { id: 'compra-producao', title: 'Compra, laboratório e adaptação', range: [48, 63] },
  { id: 'avaliacoes', title: 'Avaliações finais', range: [64, 78] },
  { id: 'remocao-conta', title: 'Remoção de conta e encerramento', range: [79, 90] }
] as const;

const screenshotTitleWords: Record<string, string> = {
  abertura: 'abertura',
  adaptacao: 'adaptação',
  admin: 'admin',
  analise: 'análise',
  aprova: 'aprova',
  aprovada: 'aprovada',
  avaliacoes: 'avaliações',
  by: 'por',
  cadastro: 'cadastro',
  clinica: 'clínica',
  cliente: 'cliente',
  compra: 'compra',
  confirmacao: 'confirmação',
  consentimentos: 'consentimentos',
  conta: 'conta',
  customer: 'cliente',
  dados: 'dados',
  deletioncustomer: 'cliente de remoção',
  dentista: 'dentista',
  dentist: 'dentista',
  elegibilidade: 'elegibilidade',
  enviado: 'enviado',
  enviadas: 'enviadas',
  escolhida: 'escolhida',
  escolhido: 'escolhido',
  formulario: 'formulário',
  hub: 'hub',
  indicacao: 'indicação',
  iniciada: 'iniciada',
  interrompida: 'interrompida',
  jornada: 'jornada',
  lab: 'laboratório',
  laboratorio: 'laboratório',
  link: 'link',
  lista: 'lista',
  modal: 'modal',
  onboarding: 'onboarding',
  parceiro: 'parceiro',
  partner: 'parceiro',
  pendente: 'pendente',
  pre: 'pré',
  preenchido: 'preenchido',
  producao: 'produção',
  pronta: 'pronta',
  pronto: 'pronto',
  recebida: 'recebida',
  recebido: 'recebido',
  remocao: 'remoção',
  review: 'avaliação',
  selecao: 'seleção',
  solicitada: 'solicitada',
  step: 'etapa',
  sucesso: 'sucesso'
};

function getExpectedPasscode() {
  return import.meta.env.VITE_DEMO_ADM_PASSCODE || DEFAULT_PASSCODE;
}

function getInitialAuthorization() {
  const expected = getExpectedPasscode();
  const params = new URLSearchParams(window.location.search);
  const urlCode = params.get('code');

  if (urlCode && urlCode === expected) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    return true;
  }

  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function getInitialMode(): DemoMode | null {
  const view = new URLSearchParams(window.location.search).get('view')?.toLowerCase();

  if (view === 'video') {
    return 'video';
  }

  if (view === 'conteudo' || view === 'content' || view === 'documentacao' || view === 'doc') {
    return 'content';
  }

  return null;
}

function getScreenshotNumber(fileName: string) {
  return Number(fileName.match(/^e2e-(\d+)/)?.[1] ?? 0);
}

function getScreenshotTitle(fileName: string) {
  const withoutExtension = fileName.replace(/^e2e-\d+-/, '').replace(/\.png$/, '').replaceAll('_', '-');
  return withoutExtension
    .split('-')
    .map((word) => {
      const normalizedWord = word.toLowerCase();
      const label = screenshotTitleWords[normalizedWord] ?? word;
      return label.charAt(0).toUpperCase() + label.slice(1);
    })
    .join(' ');
}

export function DemoAdm() {
  const [authorized, setAuthorized] = useState(getInitialAuthorization);
  const [mode, setMode] = useState<DemoMode | null>(getInitialMode);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const groupedScreenshots = useMemo(
    () =>
      screenshotSections.map((section) => ({
        ...section,
        screenshots: e2eScreenshotFiles.filter((fileName) => {
          const number = getScreenshotNumber(fileName);
          return number >= section.range[0] && number <= section.range[1];
        })
      })),
    []
  );
  const selectedScreenshotTitle = selectedScreenshot ? getScreenshotTitle(selectedScreenshot) : '';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.trim() !== getExpectedPasscode()) {
      setError('Código inválido para acessar a demonstração.');
      return;
    }

    sessionStorage.setItem(SESSION_KEY, 'true');
    setAuthorized(true);
    setError('');
  }

  if (!authorized) {
    return (
      <main className="demo-adm-gate">
        <style>{demoAdmStyles}</style>
        <section className="demo-adm-card" aria-labelledby="demo-adm-title">
          <span className="demo-adm-badge">Demo protegida</span>
          <h1 id="demo-adm-title">Painel administrativo Nexor</h1>
          <p>
            Esta página reúne a documentação visual e o vídeo completo do fluxo E2E Biteplaner.
          </p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="demo-adm-code">Código de acesso</label>
            <input
              id="demo-adm-code"
              type="password"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setError('');
              }}
              autoComplete="off"
              autoFocus
            />
            {error ? <span role="alert">{error}</span> : null}
            <button type="submit">Acessar demo</button>
          </form>
        </section>
      </main>
    );
  }

  if (!mode) {
    return (
      <main className="demo-adm-choice">
        <style>{demoAdmStyles}</style>
        <section className="demo-adm-choice-inner" aria-labelledby="demo-adm-choice-title">
          <span className="demo-adm-badge">Demo liberada</span>
          <h1 id="demo-adm-choice-title">Como deseja apresentar o fluxo?</h1>
          <p>
            Escolha um formato por vez: o vídeo completo da execução E2E ou o roteiro visual com as screenshots atualizadas.
          </p>
          <div className="demo-adm-choice-grid">
            <button type="button" className="demo-adm-choice-card" onClick={() => setMode('video')}>
              <span>Assistir vídeo</span>
              <strong>Execução completa gravada</strong>
              <small>Mostra cadastro, compra, ordens, produção, surveys, remoção de conta e transições entre perfis.</small>
            </button>
            <button type="button" className="demo-adm-choice-card" onClick={() => setMode('content')}>
              <span>Ver screenshots</span>
              <strong>Roteiro visual atualizado</strong>
              <small>Exibe as 90 capturas do E2E completo no layout novo, agrupadas por etapa operacional.</small>
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (mode === 'video') {
    return (
      <main className="demo-adm-video-page">
        <style>{demoAdmStyles}</style>
        <header className="demo-adm-view-header">
          <div>
            <span className="demo-adm-badge">Vídeo completo</span>
            <h1>Fluxo E2E Biteplaner</h1>
            <p>Gravação única do fluxo administrativo com dados reais do Supabase local.</p>
          </div>
          <button type="button" onClick={() => setMode(null)}>Trocar formato</button>
        </header>
        <section className="demo-adm-video-shell" aria-label="Vídeo completo da demonstração">
          <video controls preload="metadata" poster={VIDEO_POSTER}>
            <source src={VIDEO_SRC} type="video/webm" />
            Seu navegador não conseguiu carregar o vídeo da demonstração.
          </video>
        </section>
      </main>
    );
  }

  return (
    <main className="demo-adm-document">
      <style>{demoAdmStyles}</style>
      <header className="demo-adm-document-toolbar">
        <div>
          <span className="demo-adm-badge">Screenshots E2E</span>
          <strong>Roteiro visual do painel administrativo Biteplaner</strong>
        </div>
        <button type="button" onClick={() => setMode(null)}>Trocar formato</button>
      </header>
      <section className="demo-adm-document-hero" aria-labelledby="demo-adm-document-title">
        <div>
          <span className="demo-adm-badge">90 capturas atualizadas</span>
          <h1 id="demo-adm-document-title">Fluxo completo com remoção de conta</h1>
          <p>
            As imagens abaixo substituem a apresentação antiga e acompanham a última gravação E2E: cadastro, aprovação, compra,
            produção, avaliações, solicitação de remoção, análise administrativa e jornada interrompida.
          </p>
        </div>
        <nav aria-label="Seções do roteiro visual">
          {groupedScreenshots.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.title}
              <span>{section.screenshots.length}</span>
            </a>
          ))}
        </nav>
      </section>
      <div className="demo-adm-screenshot-sections">
        {groupedScreenshots.map((section) => (
          <section key={section.id} id={section.id} className="demo-adm-screenshot-section">
            <div className="demo-adm-section-heading">
              <span>{section.range[0]}-{section.range[1]}</span>
              <h2>{section.title}</h2>
            </div>
            <div className="demo-adm-screenshot-grid">
              {section.screenshots.map((fileName) => (
                <figure key={fileName} className="demo-adm-screenshot-card">
                  <button
                    type="button"
                    className="demo-adm-screenshot-open"
                    onClick={() => setSelectedScreenshot(fileName)}
                    aria-label={`Expandir imagem ${getScreenshotTitle(fileName)}`}
                  >
                    <img
                      src={`${DEMO_ASSET_BASE}${fileName}`}
                      alt={getScreenshotTitle(fileName)}
                      loading="lazy"
                    />
                  </button>
                  <figcaption>
                    <span>{String(getScreenshotNumber(fileName)).padStart(2, '0')}</span>
                    {getScreenshotTitle(fileName)}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}
      </div>
      {selectedScreenshot ? (
        <div
          className="demo-adm-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-adm-lightbox-title"
          onClick={() => setSelectedScreenshot(null)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setSelectedScreenshot(null);
            }
          }}
          tabIndex={-1}
        >
          <div className="demo-adm-lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span className="demo-adm-badge">Imagem expandida</span>
                <h2 id="demo-adm-lightbox-title">{selectedScreenshotTitle}</h2>
              </div>
              <button type="button" onClick={() => setSelectedScreenshot(null)} aria-label="Fechar imagem expandida">
                Fechar
              </button>
            </header>
            <img src={`${DEMO_ASSET_BASE}${selectedScreenshot}`} alt={selectedScreenshotTitle} />
          </div>
        </div>
      ) : null}
    </main>
  );
}

const demoAdmStyles = `
  * {
    box-sizing: border-box;
  }

  .demo-adm-gate,
  .demo-adm-choice,
  .demo-adm-video-page,
  .demo-adm-document {
    min-height: 100vh;
    color: #102033;
    background: linear-gradient(180deg, #f6fbf8, #eef5f8);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  }

  .demo-adm-gate,
  .demo-adm-choice,
  .demo-adm-video-page {
    padding: 24px;
  }

  .demo-adm-gate,
  .demo-adm-choice {
    display: grid;
    place-items: center;
  }

  .demo-adm-card,
  .demo-adm-choice-inner {
    width: min(100%, 920px);
  }

  .demo-adm-card {
    width: min(100%, 480px);
    display: grid;
    gap: 18px;
    padding: 28px;
    border: 1px solid #d8e4de;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 18px 48px rgba(15, 30, 45, 0.1);
  }

  .demo-adm-badge {
    width: fit-content;
    min-height: 28px;
    display: inline-flex;
    align-items: center;
    padding: 0 12px;
    border-radius: 999px;
    color: #145c3d;
    background: #e8f7ee;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .demo-adm-card h1,
  .demo-adm-choice-inner h1,
  .demo-adm-view-header h1,
  .demo-adm-document-hero h1 {
    margin: 0;
    font-size: clamp(30px, 5vw, 48px);
    line-height: 1.12;
    letter-spacing: 0;
  }

  .demo-adm-card p,
  .demo-adm-choice-inner > p,
  .demo-adm-view-header p,
  .demo-adm-document-hero p {
    max-width: 780px;
    margin: 0;
    color: #546173;
    line-height: 1.55;
  }

  .demo-adm-card form {
    display: grid;
    gap: 10px;
  }

  .demo-adm-card label {
    font-size: 13px;
    font-weight: 700;
  }

  .demo-adm-card input {
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid #cdd9d3;
    border-radius: 6px;
    font: inherit;
  }

  .demo-adm-card span[role="alert"] {
    color: #b42318;
    font-size: 13px;
  }

  .demo-adm-card button,
  .demo-adm-view-header button,
  .demo-adm-document-toolbar button {
    min-height: 44px;
    border: 0;
    border-radius: 6px;
    color: #fff;
    background: #15803d;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .demo-adm-choice-inner {
    display: grid;
    gap: 14px;
  }

  .demo-adm-choice-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin-top: 18px;
  }

  .demo-adm-choice-card {
    min-height: 230px;
    padding: 24px;
    border: 1px solid #d8e4de;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 18px 48px rgba(15, 30, 45, 0.1);
    color: #102033;
    cursor: pointer;
    text-align: left;
    transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
  }

  .demo-adm-choice-card:hover,
  .demo-adm-choice-card:focus-visible {
    border-color: #15803d;
    box-shadow: 0 22px 58px rgba(15, 30, 45, 0.14);
    outline: none;
    transform: translateY(-2px);
  }

  .demo-adm-choice-card span {
    display: inline-flex;
    width: fit-content;
    min-height: 28px;
    align-items: center;
    margin-bottom: 34px;
    padding: 0 12px;
    border-radius: 999px;
    color: #145c3d;
    background: #e8f7ee;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .demo-adm-choice-card strong {
    display: block;
    margin-bottom: 10px;
    font-size: 24px;
    letter-spacing: 0;
  }

  .demo-adm-choice-card small {
    display: block;
    color: #546173;
    font-size: 15px;
    line-height: 1.55;
  }

  .demo-adm-view-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    width: min(100%, 1180px);
    margin: 0 auto 24px;
  }

  .demo-adm-view-header > div {
    display: grid;
    gap: 12px;
  }

  .demo-adm-view-header button,
  .demo-adm-document-toolbar button {
    min-width: 150px;
    border: 1px solid #cdd9d3;
    color: #102033;
    background: #ffffff;
  }

  .demo-adm-video-shell {
    width: min(100%, 1180px);
    margin: 0 auto;
    padding: 12px;
    border: 1px solid #d8e4de;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 18px 48px rgba(15, 30, 45, 0.1);
  }

  .demo-adm-video-shell video {
    display: block;
    width: 100%;
    max-height: calc(100vh - 210px);
    border-radius: 6px;
    background: #0b1220;
  }

  .demo-adm-document {
    padding-bottom: 48px;
  }

  .demo-adm-document-toolbar {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 14px 18px;
    border-bottom: 1px solid #d8e4de;
    background: rgba(255, 255, 255, 0.96);
    color: #102033;
    backdrop-filter: blur(12px);
  }

  .demo-adm-document-toolbar strong {
    display: block;
    margin-top: 6px;
    font-size: 15px;
  }

  .demo-adm-document-hero {
    width: min(100% - 32px, 1280px);
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 32px;
    margin: 34px auto 28px;
    align-items: start;
  }

  .demo-adm-document-hero > div {
    display: grid;
    gap: 14px;
  }

  .demo-adm-document-hero nav {
    display: grid;
    gap: 8px;
    padding: 12px;
    border: 1px solid #d8e4de;
    border-radius: 8px;
    background: #ffffff;
  }

  .demo-adm-document-hero a {
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 12px;
    border-radius: 6px;
    color: #102033;
    text-decoration: none;
    font-weight: 700;
  }

  .demo-adm-document-hero a:hover,
  .demo-adm-document-hero a:focus-visible {
    outline: none;
    background: #e8f7ee;
  }

  .demo-adm-document-hero a span {
    min-width: 28px;
    min-height: 24px;
    display: inline-grid;
    place-items: center;
    border-radius: 999px;
    color: #145c3d;
    background: #e8f7ee;
    font-size: 12px;
  }

  .demo-adm-screenshot-sections {
    width: min(100% - 32px, 1280px);
    display: grid;
    gap: 34px;
    margin: 0 auto;
  }

  .demo-adm-screenshot-section {
    scroll-margin-top: 92px;
  }

  .demo-adm-section-heading {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 14px;
  }

  .demo-adm-section-heading span {
    color: #15803d;
    font-size: 13px;
    font-weight: 900;
  }

  .demo-adm-section-heading h2 {
    margin: 0;
    font-size: clamp(22px, 3vw, 32px);
    letter-spacing: 0;
  }

  .demo-adm-screenshot-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .demo-adm-screenshot-card {
    min-width: 0;
    overflow: hidden;
    margin: 0;
    border: 1px solid #d8e4de;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 14px 38px rgba(15, 30, 45, 0.08);
  }

  .demo-adm-screenshot-open {
    width: 100%;
    display: block;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: zoom-in;
  }

  .demo-adm-screenshot-open:focus-visible {
    outline: 3px solid #15803d;
    outline-offset: -3px;
  }

  .demo-adm-screenshot-card img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    object-position: top center;
    background: #eef5f8;
  }

  .demo-adm-screenshot-card figcaption {
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    color: #334155;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.35;
  }

  .demo-adm-screenshot-card figcaption span {
    min-width: 30px;
    min-height: 30px;
    display: inline-grid;
    place-items: center;
    border-radius: 999px;
    color: #145c3d;
    background: #e8f7ee;
    font-size: 12px;
    font-weight: 900;
  }

  .demo-adm-lightbox {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 24px;
    background: rgba(8, 18, 32, 0.72);
  }

  .demo-adm-lightbox-panel {
    width: min(100%, 1280px);
    max-height: calc(100vh - 48px);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
  }

  .demo-adm-lightbox-panel header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 14px 16px;
    border-bottom: 1px solid #d8e4de;
  }

  .demo-adm-lightbox-panel header > div {
    min-width: 0;
    display: grid;
    gap: 8px;
  }

  .demo-adm-lightbox-panel h2 {
    margin: 0;
    font-size: clamp(18px, 2vw, 24px);
    line-height: 1.2;
  }

  .demo-adm-lightbox-panel header button {
    min-height: 40px;
    padding: 0 14px;
    border: 1px solid #cdd9d3;
    border-radius: 6px;
    color: #102033;
    background: #ffffff;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .demo-adm-lightbox-panel > img {
    width: 100%;
    height: 100%;
    max-height: calc(100vh - 154px);
    object-fit: contain;
    background: #0b1220;
  }

  @media (max-width: 1040px) {
    .demo-adm-document-hero {
      grid-template-columns: 1fr;
    }

    .demo-adm-screenshot-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .demo-adm-choice-grid,
    .demo-adm-screenshot-grid {
      grid-template-columns: 1fr;
    }

    .demo-adm-view-header,
    .demo-adm-document-toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    .demo-adm-video-shell video {
      max-height: none;
    }

    .demo-adm-lightbox {
      padding: 12px;
    }

    .demo-adm-lightbox-panel {
      max-height: calc(100vh - 24px);
    }

    .demo-adm-lightbox-panel header {
      align-items: stretch;
      flex-direction: column;
    }

    .demo-adm-lightbox-panel > img {
      max-height: calc(100vh - 184px);
    }
  }
`;
