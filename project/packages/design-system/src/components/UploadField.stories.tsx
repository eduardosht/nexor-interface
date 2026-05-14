import type { Meta, StoryObj } from '@storybook/react';
import { UploadField } from '../index';

const meta = {
  title: 'Components/UploadField',
  component: UploadField,
  tags: ['autodocs'],
  args: {
    label: 'Arquivo 3D da arcada dentaria',
    hint: 'Aceita STL, OBJ, PLY ou ZIP.',
    browseLabel: 'browse',
    files: [
      {
        id: 'file-1',
        name: 'arcada.stl',
        status: 'uploaded',
      },
      {
        id: 'file-2',
        name: 'video.mov',
        status: 'error',
        errorMessage: 'File is too large. Max size is 25 MB',
      },
    ],
  },
} satisfies Meta<typeof UploadField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onFilesChange: () => undefined,
    onRemoveFile: () => undefined,
  },
};
