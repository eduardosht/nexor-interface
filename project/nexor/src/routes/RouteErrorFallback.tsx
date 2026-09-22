import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import styled from 'styled-components';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: unknown;
};

const CHUNK_ERROR_PATTERNS = [
  'failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'importing a module script failed',
  'loading chunk',
  'chunkloaderror',
];

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('Application error boundary captured an error', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return <ErrorFallbackView error={this.state.error} />;
    }

    return this.props.children;
  }
}

export function RouteErrorFallback() {
  const error = useRouteError();

  return <ErrorFallbackView error={error} />;
}

export function ErrorFallbackView({ error }: { error: unknown }) {
  const isChunkError = isDynamicImportError(error);
  const title = isChunkError ? 'Atualize a aplicação para continuar' : 'Não foi possível carregar esta página';
  const description = isChunkError
    ? 'Uma nova versão do sistema foi publicada enquanto você navegava. Recarregue a aplicação para baixar os arquivos mais recentes e continuar.'
    : 'Encontramos uma instabilidade ao abrir esta área. Tente novamente agora ou volte para o painel.';

  return (
    <FallbackPage role="alert">
      <FallbackCard>
        <Eyebrow>{isChunkError ? 'Atualização necessária' : 'Erro inesperado'}</Eyebrow>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <Actions>
          <PrimaryButton type="button" onClick={() => window.location.reload()}>
            Recarregar aplicação
          </PrimaryButton>
          <SecondaryLink href="/">Voltar ao início</SecondaryLink>
        </Actions>
      </FallbackCard>
    </FallbackPage>
  );
}

function isDynamicImportError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  return CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText} ${error.data ?? ''}`;
  }

  if (error instanceof Error) {
    return `${error.name} ${error.message}`;
  }

  return String(error);
}

const FallbackPage = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: clamp(24px, 5vw, 64px);
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.12), transparent 34%),
    #f7faf9;
  color: ${({ theme }) => theme.colors.text};
`;

const FallbackCard = styled.section`
  width: min(100%, 560px);
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 8px;
  background: #ffffff;
  padding: clamp(24px, 4vw, 40px);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
`;

const Eyebrow = styled.p`
  margin: 0 0 10px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1.15;
  color: ${({ theme }) => theme.colors.text};
`;

const Description = styled.p`
  margin: 14px 0 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
`;

const PrimaryButton = styled.button`
  min-height: 44px;
  border: 0;
  border-radius: 8px;
  padding: 0 18px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
`;

const SecondaryLink = styled.a`
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 8px;
  padding: 0 18px;
  background: #ffffff;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  text-decoration: none;
`;
