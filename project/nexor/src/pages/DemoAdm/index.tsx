import { FormEvent, useMemo, useState } from 'react';
import presentationHtml from '../../../docs/apresentacao-painel-administrativo-nexor.html?raw';

const SESSION_KEY = 'nexor-demo-adm-authorized';
const DEFAULT_PASSCODE = 'nexor-demo-adm-2026';
const DEMO_ASSET_BASE = '/demo-adm-assets/assets/apresentacao-painel-admin/';
const VIDEO_SRC = `${DEMO_ASSET_BASE}video/biteplaner-fluxo-completo-e2e.webm`;
const VIDEO_POSTER = `${DEMO_ASSET_BASE}09b-cliente-pre-requisito-secao-2.png`;

type DemoMode = 'video' | 'content';

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

function buildContentHtml() {
  return presentationHtml
    .replace(/\s*<section class="panel section video-section"[\s\S]*?<\/section>/, '')
    .replace('let current = 1;', 'let current = 0;')
    .replaceAll('assets/apresentacao-painel-admin/', DEMO_ASSET_BASE);
}

export function DemoAdm() {
  const [authorized, setAuthorized] = useState(getInitialAuthorization);
  const [mode, setMode] = useState<DemoMode | null>(getInitialMode);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const contentHtml = useMemo(buildContentHtml, []);

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
            Esta página reúne a documentação de apresentação e o vídeo completo do fluxo E2E Biteplaner.
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
            Escolha um formato por vez: o vídeo completo da execução E2E ou a documentação em texto e imagens.
          </p>
          <div className="demo-adm-choice-grid">
            <button type="button" className="demo-adm-choice-card" onClick={() => setMode('video')}>
              <span>Assistir vídeo</span>
              <strong>Execução completa gravada</strong>
              <small>Mostra cadastro, compra, ordens, produção, surveys e transições entre perfis.</small>
            </button>
            <button type="button" className="demo-adm-choice-card" onClick={() => setMode('content')}>
              <span>Ver documentação</span>
              <strong>Texto e imagens do painel</strong>
              <small>Exibe o roteiro visual, prints, mapas de feedback e explicações sem o player de vídeo.</small>
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
          <span className="demo-adm-badge">Documentação</span>
          <strong>Texto e imagens do painel administrativo</strong>
        </div>
        <button type="button" onClick={() => setMode(null)}>Trocar formato</button>
      </header>
      <iframe title="Apresentação do painel administrativo Nexor" srcDoc={contentHtml} />
    </main>
  );
}

const demoAdmStyles = `
  * {
    box-sizing: border-box;
  }

  .demo-adm-gate,
  .demo-adm-choice,
  .demo-adm-video-page {
    min-height: 100vh;
    padding: 24px;
    color: #102033;
    background: linear-gradient(180deg, #f6fbf8, #eef5f8);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
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
    font-weight: 800;
    text-transform: uppercase;
  }

  .demo-adm-card h1,
  .demo-adm-choice-inner h1,
  .demo-adm-view-header h1 {
    margin: 0;
    font-size: clamp(30px, 5vw, 48px);
    line-height: 1.12;
    letter-spacing: 0;
  }

  .demo-adm-card p,
  .demo-adm-choice-inner > p,
  .demo-adm-view-header p {
    max-width: 680px;
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
    font-weight: 800;
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
    font-weight: 800;
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
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    background: #f6fbf8;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  }

  .demo-adm-document-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 14px 18px;
    border-bottom: 1px solid #d8e4de;
    background: #ffffff;
    color: #102033;
  }

  .demo-adm-document-toolbar strong {
    display: block;
    margin-top: 6px;
    font-size: 15px;
  }

  .demo-adm-document iframe {
    display: block;
    width: 100%;
    flex: 1;
    border: 0;
  }

  @media (max-width: 760px) {
    .demo-adm-choice-grid {
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
  }
`;
