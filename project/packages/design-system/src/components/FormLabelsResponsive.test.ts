import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const formLabelComponents = [
  'CheckboxField.tsx',
  'Field.tsx',
  'MultiSelect.tsx',
  'Select.tsx',
  'TagAutocompleteField.tsx',
  'UploadField.tsx',
];

describe('form labels responsive typography', () => {
  it('keeps form labels at 12px on small devices', () => {
    for (const component of formLabelComponents) {
      const source = readFileSync(join(process.cwd(), 'src/components', component), 'utf8');

      expect(source, component).toContain('@media (max-width: 640px)');
      expect(source, component).toContain('font-size: 12px;');
    }
  });
});
