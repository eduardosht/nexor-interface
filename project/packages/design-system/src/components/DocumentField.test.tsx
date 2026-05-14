import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DesignSystemProvider } from '../provider';
import { DocumentField } from './DocumentField';

describe('DocumentField', () => {
  it('masks CPF visually and emits raw digits', () => {
    const handleTypeChange = vi.fn();
    const handleNumberChange = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <DocumentField
          label="Documento"
          documentType="cpf"
          documentNumber="12345678909"
          documentTypes={[
            { value: 'cpf', label: 'CPF' },
            { value: 'rg', label: 'RG' },
          ]}
          onDocumentTypeChange={handleTypeChange}
          onDocumentNumberChange={handleNumberChange}
        />
      </DesignSystemProvider>,
    );

    expect(screen.getByLabelText('Documento')).toHaveValue('123.456.789-09');

    fireEvent.change(screen.getByLabelText('Documento'), {
      target: { value: '987.654.321-00' },
    });

    expect(handleNumberChange).toHaveBeenCalledWith('98765432100');
  });

  it('changes document type through the left selector', () => {
    const handleTypeChange = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <DocumentField
          label="Documento"
          documentType="cpf"
          documentNumber=""
          documentTypes={[
            { value: 'cpf', label: 'CPF' },
            { value: 'rg', label: 'RG' },
          ]}
          onDocumentTypeChange={handleTypeChange}
          onDocumentNumberChange={vi.fn()}
        />
      </DesignSystemProvider>,
    );

    fireEvent.change(screen.getByLabelText('Tipo de documento'), {
      target: { value: 'rg' },
    });

    expect(handleTypeChange).toHaveBeenCalledWith('rg');
  });
});
