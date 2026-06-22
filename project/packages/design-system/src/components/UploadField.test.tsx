import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesignSystemProvider } from '../provider';
import { UploadField } from './UploadField';

describe('UploadField', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders uploaded files with status, helper text and remove action', () => {
    const handleFilesChange = vi.fn();
    const handleRemove = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <UploadField
          label="Arquivo 3D"
          hint="Aceita STL, OBJ, PLY ou ZIP."
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

    expect(screen.getByText(/arraste e solte o\(s\) arquivo\(s\) para enviar/i)).toBeTruthy();
    expect(screen.getByText(/ou procurar/i)).toBeTruthy();
    expect(screen.getByText(/arcada.stl/i)).toBeTruthy();
    expect(screen.getByText(/video.mov/i)).toBeTruthy();
    expect(screen.getByText(/file is too large\. max size is 25 mb/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /remover arquivo video\.mov/i }));

    expect(handleRemove).toHaveBeenCalledWith('file-error');
  });

  it('accepts files dropped into the upload area', () => {
    const handleFilesChange = vi.fn();
    const droppedFile = new File(['scan'], 'scan.dcm', { type: 'application/dicom' });

    render(
      <DesignSystemProvider brand="nexor">
        <UploadField
          label="Arquivo 3D"
          files={[]}
          onFilesChange={handleFilesChange}
          onRemoveFile={vi.fn()}
        />
      </DesignSystemProvider>
    );

    fireEvent.drop(screen.getByRole('button', { name: /arraste e solte/i }), {
      dataTransfer: {
        files: [droppedFile],
      },
    });

    expect(handleFilesChange).toHaveBeenCalledWith([droppedFile]);
  });

  it('highlights the upload area while a file is dragged over it', () => {
    render(
      <DesignSystemProvider brand="nexor">
        <UploadField
          label="Arquivo 3D"
          files={[]}
          onFilesChange={vi.fn()}
          onRemoveFile={vi.fn()}
        />
      </DesignSystemProvider>
    );

    const dropzone = screen.getByRole('button', { name: /arraste e solte/i });

    expect(dropzone.getAttribute('data-drag-active')).toBe('false');

    fireEvent.dragEnter(dropzone);
    expect(dropzone.getAttribute('data-drag-active')).toBe('true');

    fireEvent.dragLeave(dropzone);
    expect(dropzone.getAttribute('data-drag-active')).toBe('false');
  });
});
