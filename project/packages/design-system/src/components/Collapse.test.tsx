import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Collapse } from './Collapse';

describe('Collapse', () => {
  it('renders trigger text', () => {
    render(<Collapse trigger="Pergunta exemplo">Resposta aqui</Collapse>);
    expect(screen.getByText('Pergunta exemplo')).toBeInTheDocument();
  });

  it('is collapsed by default (aria-expanded false, body aria-hidden)', () => {
    render(<Collapse trigger="Pergunta">Resposta oculta</Collapse>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Resposta oculta').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('expands after clicking trigger', () => {
    render(<Collapse trigger="Pergunta">Resposta visível</Collapse>);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Resposta visível').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'false');
  });

  it('collapses again on second click', () => {
    render(<Collapse trigger="Pergunta">Resposta</Collapse>);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('starts expanded when defaultOpen is true', () => {
    render(<Collapse trigger="Pergunta" defaultOpen>Resposta aberta</Collapse>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Resposta aberta').closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'false');
  });
});
