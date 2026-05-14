import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DesignSystemProvider } from '../provider';
import { UploadField } from './UploadField';

describe('UploadField', () => {
  it('renders uploaded files with status, helper text and remove action', () => {
    const handleFilesChange = vi.fn();
    const handleRemove = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <UploadField
          label="Arquivo 3D"
          hint="Aceita STL, OBJ, PLY ou ZIP."
          browseLabel="browse"
          files={[
            {
              id: 'file-success',
              name: 'arcada.stl',
              status: 'uploaded',
            },
            {
              id: 'file-error',
              name: 'video.mov',
              status: 'error',
              errorMessage: 'File is too large. Max size is 25 MB',
            },
          ]}
          onFilesChange={handleFilesChange}
          onRemoveFile={handleRemove}
        />
      </DesignSystemProvider>
    );

    expect(screen.getByText(/drag & drop file\(s\) to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/arcada.stl/i)).toBeInTheDocument();
    expect(screen.getByText(/video.mov/i)).toBeInTheDocument();
    expect(screen.getByText(/file is too large\. max size is 25 mb/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /remover arquivo video\.mov/i }));

    expect(handleRemove).toHaveBeenCalledWith('file-error');
  });
});
