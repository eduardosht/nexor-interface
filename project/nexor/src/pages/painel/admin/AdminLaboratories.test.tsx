import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { AdminLaboratories } from './AdminLaboratories';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({ useAuth: () => ({ session: { access_token: 'tok' } }) }));
vi.mock('../../../lib/api', () => ({ api: { get: (...args: unknown[]) => mockGet(...args), post: (...args: unknown[]) => mockPost(...args), patch: (...args: unknown[]) => mockPatch(...args) } }));
const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });
const laboratory = { id: 'lab-1', name: 'Lab Prime', legalName: 'Lab Prime Ltda', cnpj: '11222333000181', email: 'lab@nexor.dev', phone: null, asaasMode: 'linked_account', asaasAccountId: 'acc-1', asaasWalletId: 'wallet-1', integrationStatus: 'ready', integrationErrorMessage: null, splitFixedValueCents: 17500, distributionWeightBasisPoints: 5000, active: true };
function renderPage() { return render(<ThemeProvider theme={lightTheme}><DesignSystemRoot><MemoryRouter><AdminLaboratories /></MemoryRouter></DesignSystemRoot></ThemeProvider>); }
describe('AdminLaboratories', () => {
  beforeEach(() => { mockGet.mockReset(); mockPost.mockReset(); mockPatch.mockReset(); });
  it('loads laboratories and displays fixed split and routing weight', async () => { mockGet.mockResolvedValue({ laboratories: [laboratory] }); renderPage(); await waitFor(() => expect(mockGet).toHaveBeenCalledWith('/v1/admin/commerce/laboratories?includeInactive=true', 'tok')); expect(screen.getByText('Lab Prime')).toBeInTheDocument(); expect(screen.getByText('R$ 175,00')).toBeInTheDocument(); expect(screen.getAllByText('50,00%').length).toBeGreaterThanOrEqual(1); });
  it('submits a linked Asaas laboratory with cents and basis points', async () => { mockGet.mockResolvedValue({ laboratories: [] }); mockPost.mockResolvedValue({ laboratory }); renderPage(); await screen.findByText('Nenhum laboratório cadastrado.'); fireEvent.change(screen.getByLabelText('Nome fantasia'), { target: { value: 'Lab Prime' } }); fireEvent.change(screen.getByLabelText('Razão social'), { target: { value: 'Lab Prime Ltda' } }); fireEvent.change(screen.getByLabelText('CNPJ'), { target: { value: '11222333000181' } }); fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'lab@nexor.dev' } }); fireEvent.change(screen.getByLabelText('Wallet Asaas'), { target: { value: 'wallet-1' } }); fireEvent.change(screen.getByLabelText('Split fixo (R$)'), { target: { value: '175,00' } }); fireEvent.change(screen.getByLabelText('Peso de distribuição (%)'), { target: { value: '50' } }); fireEvent.click(screen.getByRole('button', { name: /cadastrar laboratório/i })); await waitFor(() => expect(mockPost).toHaveBeenCalledWith('/v1/admin/commerce/laboratories', expect.objectContaining({ splitFixedValueCents: 17500, distributionWeightBasisPoints: 5000, asaasWalletId: 'wallet-1' }), 'tok')); });
});