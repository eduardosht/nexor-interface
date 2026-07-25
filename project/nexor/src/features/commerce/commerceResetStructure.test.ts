import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = resolve(process.cwd(), 'src');
const projectRoot = process.cwd();

describe('commerce reset structure', () => {
  it('does not keep retired Biteplaner financial onboarding and legacy workflow mocks', () => {
    const retiredPaths = [
      'features/financialOnboarding',
      'mocks/handlers/partner.ts',
      'mocks/handlers/orders.ts',
      'mocks/handlers/reports.ts',
      'features/demo/biteplanerQueryKeys.ts',
    ];

    expect(retiredPaths.filter((path) => existsSync(resolve(sourceRoot, path)))).toEqual([]);
  });

  it('does not keep retired presentation scripts for the old customer journey', () => {
    const retiredPaths = [
      'scripts/pw-recapture-admin-presentation.mjs',
      'scripts/pw-capture-presentation-form-steps.mjs',
      'scripts/e2e-full-flow-recording.mjs',
      'scripts/e2e-full-flow-recording.test.ts',
      'scripts/pw-record-biteplaner-documentary.mjs',
      'scripts/audit-presentation-screenshots.mjs',
      'docs/apresentacao-painel-administrativo-nexor.html',
      'docs/biteplaner-video-documental.html',
      'docs/assets/apresentacao-painel-admin',
      'docs/superpowers/plans/2026-05-28-biteplaner-form-layout.md',
      'src/features/platformEmails',
    ];

    expect(retiredPaths.filter((path) => existsSync(resolve(projectRoot, path)))).toEqual([]);
  });

  it('does not expose retired full-flow recording commands', () => {
    const packageSource = readFileSync(resolve(projectRoot, 'package.json'), 'utf8');

    expect(packageSource).not.toMatch(/e2e:full-flow:record|e2e-full-flow-recording/);
  });

  it('documents the reset Biteplaner order flow without the retired clinical journey', () => {
    const biteplanerOrderFlowSource = readFileSync(resolve(projectRoot, 'docs/biteplaner-order-flow.md'), 'utf8');

    expect(biteplanerOrderFlowSource).toMatch(/commerce|dentista|licenciamento|Asaas|S3|pedido/i);
    expect(biteplanerOrderFlowSource).not.toMatch(
      /cliente|paciente|pré-requisito|pre-requisito|pré-consulta|pre-consulta|seleção de clínica|jornada visual|check-up|awaiting_scheduling|awaiting_dentist_acceptance|awaiting_lab_start|lab_processing|follow_up/i
    );
  });

  it('does not expose retired Pagar.me financial onboarding endpoints in active mocks or notification actions', () => {
    const activeSources = [
      'mocks/handlers/products.ts',
      'features/account/notificationActions.ts',
    ].map((path) => readFileSync(resolve(sourceRoot, path), 'utf8')).join('\n');

    expect(activeSources).not.toMatch(/financial-onboarding|financial_onboarding|pagarme|Pagar\.me/i);
  });

  it('does not keep retired customer journey wording in account deletion mocks', () => {
    const accountDeletionSource = readFileSync(resolve(sourceRoot, 'mocks/handlers/accountDeletion.ts'), 'utf8');

    expect(accountDeletionSource).not.toMatch(/cliente|jornada/i);
  });

  it('does not keep retired partner invite registration state in Nexor signup', () => {
    const cadastroSource = readFileSync(resolve(sourceRoot, 'pages/Cadastro/index.tsx'), 'utf8');

    expect(cadastroSource).not.toMatch(/nexor_partner_invite|partner invite|convite de parceiro/i);
  });

  it('keeps demo state scoped to current Nexor commerce personas', () => {
    const demoStateSource = readFileSync(resolve(sourceRoot, 'mocks/demoState.ts'), 'utf8');

    expect(demoStateSource).not.toMatch(
      /athlete|customer|partner|\blab\b|pre[-_ ]?consult|clinic selection|seleção de clínica|workflow form/i
    );
  });

  it('does not keep retired Biteplaner journey routes as compatibility redirects', () => {
    const routesSource = readFileSync(resolve(sourceRoot, 'routes/index.tsx'), 'utf8');

    expect(routesSource).not.toMatch(
      /\/painel\/(?:pre-requisito|consulta-inicial|compra|confirmacao-compra)|\/painel\/biteplaner\/(?:financeiro|indicar|avaliacoes|jornada)|\/painel\/dentista\/producao|\/painel\/admin\/(?:parceiros|laborat(?:órios|orios))/
    );
  });

  it('does not keep retired clinic, partner, or laboratory auth fields in the frontend account contract', () => {
    const authSource = readFileSync(resolve(sourceRoot, 'hooks/useAuth.tsx'), 'utf8');
    const demoStateSource = readFileSync(resolve(sourceRoot, 'mocks/demoState.ts'), 'utf8');

    expect(`${authSource}\n${demoStateSource}`).not.toMatch(/clinicIds|partnerId|labId/);
  });

  it('does not keep retired clinical administration roles in the frontend guard contract', () => {
    const adminRolesSource = readFileSync(resolve(sourceRoot, 'features/auth/adminRoles.ts'), 'utf8');

    expect(adminRolesSource).not.toMatch(/clinical/);
  });

  it('does not keep retired check-up email language in the account UI', () => {
    const accountSource = readFileSync(resolve(sourceRoot, 'pages/painel/MinhaConta/index.tsx'), 'utf8');

    expect(accountSource).not.toMatch(/check-up|checkup|platformEmails|platform email/i);
  });

  it('does not keep skipped frontend tests around retired flows', () => {
    const portalLayoutTestSource = readFileSync(
      resolve(sourceRoot, 'components/portal/PortalLayout/PortalLayout.test.tsx'),
      'utf8'
    );

    expect(portalLayoutTestSource).not.toMatch(/\b(?:it|test|describe)\.skip\(/);
  });
});
