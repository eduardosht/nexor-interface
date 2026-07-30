const scenarios = [
  {
    id: 'admin-account-deletion-and-audit',
    role: 'admin',
    route: '/painel/admin/remocoes-conta',
    apiAssertions: ['/v1/admin/account-deletions', '/v1/reports/audit'],
    forbiddenData: ['payload clinico bruto', 'scan 3D privado', 'segredos de provedor']
  },
  {
    id: 'customer-privacy-center',
    role: 'customer',
    route: '/painel/conta',
    apiAssertions: ['/v1/account/privacy-export', '/v1/account/consents', '/v1/account/consents/revoke'],
    forbiddenData: ['dados de outro cliente', 'fila administrativa', 'dados financeiros internos']
  },
  {
    id: 'dentist-production-request',
    role: 'dentist',
    route: '/painel/dentista/producao/BP-E2E-001',
    apiAssertions: ['/v1/biteplaner/orders/BP-E2E-001/production-request'],
    forbiddenData: ['segredos de storage', 'url publica de arquivo', 'prescricao medica legada']
  },
  {
    id: 'partner-commercial-referral',
    role: 'partner',
    route: '/painel/biteplaner/indicar?mode=partner',
    apiAssertions: ['/v1/biteplaner/orders', '/v1/partner/referrals'],
    forbiddenData: ['payload clinico', 'documentos medicos', 'scan 3D de producao']
  },
];

const requiredRoles = ['admin', 'customer', 'dentist', 'partner'];
const findings = [];

for (const role of requiredRoles) {
  if (!scenarios.some((scenario) => scenario.role === role)) {
    findings.push(`Missing scenario for role: ${role}`);
  }
}

for (const scenario of scenarios) {
  if (!scenario.route.startsWith('/painel/')) {
    findings.push(`${scenario.id} must target an authenticated panel route`);
  }

  if (scenario.apiAssertions.length === 0) {
    findings.push(`${scenario.id} must declare backend API assertions`);
  }

  if (scenario.forbiddenData.length === 0) {
    findings.push(`${scenario.id} must declare forbidden data assertions`);
  }
}

if (process.env.LGPD_E2E_RUN_AUTHENTICATED === 'true') {
  if (!process.env.LGPD_E2E_BASE_URL) {
    findings.push('LGPD_E2E_BASE_URL is required for authenticated execution');
  }

  for (const role of requiredRoles) {
    const tokenName = `LGPD_E2E_${role.toUpperCase()}_TOKEN`;
    if (!process.env[tokenName]) {
      findings.push(`${tokenName} is required for authenticated execution`);
    }
  }
}

if (findings.length > 0) {
  console.error('LGPD role E2E readiness failed:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: 'ready',
      mode: process.env.LGPD_E2E_RUN_AUTHENTICATED === 'true' ? 'authenticated-e2e' : 'local-readiness',
      scenarios: scenarios.map(({ id, role, route, apiAssertions }) => ({ id, role, route, apiAssertions }))
    },
    null,
    2
  )
);
