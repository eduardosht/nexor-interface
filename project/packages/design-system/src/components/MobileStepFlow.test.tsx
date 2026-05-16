import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { initDesignSystem } from '../provider';
import { MobileStepFlow, type MobileStepDefinition } from './MobileStepFlow';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

const steps: MobileStepDefinition[] = [
  { id: 'main', title: 'Dados principais', summary: 'Nome e contato' },
  { id: 'docs', title: 'Licença e documentos', summary: 'CRO e arquivos' },
  { id: 'review', title: 'Revisão', summary: 'Conferência final' },
];

describe('MobileStepFlow', () => {
  it('shows progress, active content and navigation callbacks', () => {
    const onStepChange = vi.fn();

    render(
      <DesignSystemRoot>
        <MobileStepFlow
          steps={steps}
          activeStepId="docs"
          onStepChange={onStepChange}
          renderStep={(step) => <p>Conteúdo de {step.title}</p>}
        />
      </DesignSystemRoot>
    );

    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /licença e documentos/i })).toBeInTheDocument();
    expect(screen.getByText(/conteúdo de licença e documentos/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /voltar para dados principais/i }));
    expect(onStepChange).toHaveBeenCalledWith('main');

    fireEvent.click(screen.getByRole('button', { name: /avançar para revisão/i }));
    expect(onStepChange).toHaveBeenCalledWith('review');
  });
});
