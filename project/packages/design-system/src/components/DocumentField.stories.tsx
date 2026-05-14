import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DocumentField } from './DocumentField';
import type { SupportedDocumentType } from '../utils/formats';

const meta = {
  title: 'Components/DocumentField',
  component: DocumentField,
  tags: ['autodocs'],
} satisfies Meta<typeof DocumentField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    const [documentType, setDocumentType] = useState<SupportedDocumentType>('cpf');
    const [documentNumber, setDocumentNumber] = useState('');

    return (
      <DocumentField
        label="Documento"
        documentType={documentType}
        documentNumber={documentNumber}
        documentTypes={[
          { value: 'cpf', label: 'CPF' },
          { value: 'rg', label: 'RG' },
        ]}
        onDocumentTypeChange={(nextType) => {
          setDocumentType(nextType);
          setDocumentNumber('');
        }}
        onDocumentNumberChange={setDocumentNumber}
      />
    );
  },
};
