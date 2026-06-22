import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('full-flow recording script', () => {
  const source = readFileSync(join(process.cwd(), 'scripts/e2e-full-flow-recording.mjs'), 'utf8');

  it('records the account deletion review path as part of the full E2E flow', () => {
    expect(source).toContain('demonstrateAccountDeletionViaUi');
    expect(source).toContain('/v1/account/deletion-request');
    expect(source).toContain('/v1/admin/account-deletion-requests');
    expect(source).toContain('account_deletion_approved');
  });

  it('publishes the refreshed video and screenshots to the demo-adm asset tree', () => {
    expect(source).toContain('publishDemoAdmArtifacts');
    expect(source).toContain("public', 'demo-adm-assets', 'assets', 'apresentacao-painel-admin");
    expect(source).toContain('biteplaner-fluxo-completo-e2e.webm');
  });
});
