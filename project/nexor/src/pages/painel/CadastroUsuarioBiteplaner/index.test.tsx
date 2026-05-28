import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPost, mockNavigate } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
  },
}));

import { CadastroUsuarioBiteplaner } from './index';

function mockCepLookup() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      complemento: 'lado ímpar',
      unidade: '',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
      estado: 'São Paulo',
      regiao: 'Sudeste',
      ibge: '3550308',
      gia: '1004',
      ddd: '11',
      siafi: '7107',
    }),
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function demoOrder() {
  return {
    id: 'BP-DEMO-ONBOARDING',
    status: 'registration_started',
    statusLabel: 'Cadastro Biteplaner pendente',
    stage: 'pre_requisite_pending',
    created_at: '2026-05-01T10:00:00.000Z',
    customer: {
      full_name: 'Joao Demo',
      email: 'joao@nexor.dev',
      phone: '11999999999',
    },
  };
}

function onboardingForm(status: 'pending' | 'submitted' = 'pending', summary: Record<string, unknown> | null = null) {
  return {
    id: 'BP-WF-ONBOARDING',
    orderId: 'BP-DEMO-ONBOARDING',
    templateKey: 'customer_new_user_onboarding',
    stepKey: 'new_user_onboarding',
    status,
    canViewPayload: true,
    summary,
    releasedAt: '2026-05-01T10:00:00.000Z',
    submittedAt: status === 'submitted' ? '2026-05-01T10:15:00.000Z' : null,
    payload: null,
  };
}

function renderPage() {
  mockUseAuth.mockReturnValue({
    loading: false,
    session: { access_token: 'tok', user: { id: '1', email: 'joao@nexor.dev' } },
    backendUser: {
      email: 'joao@nexor.dev',
      phone: '11999999999',
      full_name: 'Joao Demo',
      roles: ['customer'],
    },
    backendUserResolved: true,
    hasConfiguredAuth: true,
    isMockMode: true,
    demoPersona: 'athlete',
  });

  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <CadastroUsuarioBiteplaner />
      </ThemeProvider>
    </MemoryRouter>
  );
}

function selectDropdown(label: RegExp, optionName: RegExp | string) {
  fireEvent.click(screen.getByLabelText(label));
  fireEvent.click(screen.getByRole('option', { name: optionName }));
}

function selectTagOption(label: RegExp, search: string, optionName: RegExp | string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value: search } });
  fireEvent.click(screen.getByRole('option', { name: optionName }));
}

async function acceptInitialPrivacyGateIfNeeded() {
  await screen.findByText(/empresa de bioengenharia/i);

  await waitFor(() => {
    expect(
      screen.queryByLabelText(/declaro que li e entendi/i) ??
        screen.queryByRole('button', { name: /dados cl.nicos/i })
    ).toBeTruthy();
  });

  const privacyCheckbox = screen.queryByLabelText(/declaro que li e entendi/i);

  if (!privacyCheckbox) {
    return;
  }

  fireEvent.click(privacyCheckbox);
  fireEvent.click(await screen.findByRole('button', { name: /continuar/i }));
  await screen.findByRole('button', { name: /dados cl.nicos/i });
}

async function fillRequiredOnboardingFields({ cpf = '52998224725', birthDate = '10011990' } = {}) {
  await acceptInitialPrivacyGateIfNeeded();
  expect(await screen.findByDisplayValue('Joao Demo')).toBeInTheDocument();
  expect(screen.getByDisplayValue('joao@nexor.dev')).toBeInTheDocument();
  expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();

  expect(screen.getByLabelText(/telefone/i)).toHaveAttribute('placeholder', '(11) 99999-9999');
  const cpfInput = screen.getByLabelText(/cpf/i);
  const birthDateInput = screen.getByLabelText(/data de nascimento/i);
  expect(cpfInput).toHaveAttribute('placeholder', '000.000.000-00');
  expect(birthDateInput).toHaveAttribute('placeholder', 'DD/MM/AAAA');
  fireEvent.change(cpfInput, { target: { value: cpf } });
  fireEvent.change(birthDateInput, { target: { value: birthDate } });
  expect(cpfInput).toHaveValue(cpf === '52998224725' ? '529.982.247-25' : '123.456.789-01');
  expect(birthDateInput).toHaveValue(birthDate === '10011990' ? '10/01/1990' : '10/01/2010');
  fireEvent.change(screen.getByLabelText(/^cep/i), { target: { value: '01001000' } });
  fireEvent.change(screen.getByLabelText(/^endere.*o/i), { target: { value: 'Praça da Sé - Sé' } });
  fireEvent.change(screen.getByLabelText(/complemento/i), { target: { value: 'lado ímpar' } });
  fireEvent.change(screen.getByLabelText(/^cidade \(\*\)$/i), { target: { value: 'São Paulo' } });
  fireEvent.change(screen.getByLabelText(/^estado \(\*\)$/i), { target: { value: 'SP' } });
  fireEvent.change(screen.getByLabelText(/profiss.*o/i), { target: { value: 'Atleta' } });
  selectDropdown(/sexo biol.*gico/i, 'Masculino');
  selectDropdown(/lateralidade predominante/i, 'Destro');
  expect(screen.getByText('Exemplo: 70,5')).toBeInTheDocument();
  expect(screen.getByText('Exemplo: 1,70')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/massa corporal/i), { target: { value: '70.5' } });
  fireEvent.change(screen.getByLabelText(/altura/i), { target: { value: '1.70' } });

  selectTagOption(/esportes\/atividades atuais/i, 'corr', /^corrida$/i);
  selectDropdown(/h.* quanto tempo/i, '2 a 5 anos');
  fireEvent.click(screen.getByLabelText(/mesmo local da resid/i));
  expect(screen.getByLabelText(/cidade\/bairro onde treina/i)).toBeDisabled();
  expect(screen.getByLabelText(/cidade\/bairro onde treina/i)).toHaveValue('Praça da Sé - Sé, lado ímpar, São Paulo - SP');
  fireEvent.click(screen.getByLabelText(/^academia$/i));
  fireEvent.click(screen.getByLabelText(/personal trainer/i));
  selectTagOption(/acess.*rios de seguran.*a/i, 'rel', /rel.*gios sensores/i);
  selectTagOption(/esportes\/atividades passados/i, 'mus', /^muscula.*o$/i);

  fireEvent.click(screen.getAllByLabelText(/^Não$/i)[0]);
  fireEvent.click(screen.getAllByLabelText(/^Não$/i)[1]);
  fireEvent.click(screen.getByRole('button', { name: /pr.*xima etapa/i }));

  fireEvent.change(screen.getByLabelText(/locais de treinamento/i), { target: { value: '20000' } });
  expect(screen.getByLabelText(/locais de treinamento/i)).toHaveValue('R$ 200,00');
  selectDropdown(/renda mensal/i, /R\$ 5\.001 a R\$ 10\.000/);

  fireEvent.change(screen.getByLabelText(/maior objetivo/i), { target: { value: 'Melhorar performance' } });
  fireEvent.change(screen.getByLabelText(/maior preocupa.*o/i), { target: { value: 'Evitar lesões' } });
  selectDropdown(/trabalho afeta/i, 'Não afeta');

  expect(screen.queryByText(/novo sistema integrado \(SIN\)/i)).not.toBeInTheDocument();
  expect(screen.queryByText('ACOMPANHAMENTO DE DISPOSITIVOS')).not.toBeInTheDocument();
  expect(screen.queryByRole('radiogroup', { name: /chance de voc.* usar/i })).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/indicaria a nexor/i)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /pr.*xima etapa/i }));

  expect(screen.queryByLabelText(/pol.*tica de privacidade/i)).not.toBeInTheDocument();
  expect(screen.getByText(/A NEXOR precisa me ajudar a/i)).toBeInTheDocument();
  expect(screen.getByText(/Opcional.*campo aberto/i)).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/mais importante.*nexor/i), { target: { value: 'A treinar com segurança' } });
}

describe('CadastroUsuarioBiteplaner', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockNavigate.mockReset();
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prefills account data and sends a valid onboarding to the clinical prerequisite', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [onboardingForm()] });
    mockApiPost.mockResolvedValueOnce({
      ...onboardingForm('submitted', { blocked: false, responseCount: 1 }),
      payload: {
        fullName: 'Joao Demo',
        email: 'joao@nexor.dev',
        phone: '11999999999',
        privacyConsent: ['accepted'],
      },
    });

    renderPage();

    expect(await screen.findByRole('heading', { name: /cadastro de novos usu.*rios/i })).toBeInTheDocument();
    expect(screen.queryByTestId('athlete-order-card')).not.toBeInTheDocument();
    expect(screen.queryByText(/cadastro de novos usu.*rios biteplaner/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/liberado em/i)).not.toBeInTheDocument();
    expect(await screen.findByText(/empresa de bioengenharia/i)).toBeInTheDocument();
    expect(screen.getByText(/\* Indica uma pergunta obrigat.ria/i)).toBeInTheDocument();
    screen
      .getAllByRole('link', { name: /pol.*tica de privacidade/i })
      .forEach((link) => expect(link).toHaveAttribute('href', '/privacidade'));
    expect(screen.queryByRole('button', { name: /dados cl.nicos/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/declaro que li e entendi/i));
    expect(screen.getByRole('button', { name: /continuar/i })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));
    expect(await screen.findByRole('button', { name: /dados cl.nicos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /perfil financeiro e objetivos/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /experi.ncia com o dispositivo/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pesquisa de satisfa..o/i })).toBeInTheDocument();
    expect(screen.getAllByText(/dados cl.*nicos para seu cuidado/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/campos marcados com/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/menor de idade/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/app de mensagens/i)).not.toBeInTheDocument();
    await fillRequiredOnboardingFields();
    expect(screen.getByLabelText(/mais importante.*nexor/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /enviar formul.*rio/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-ONBOARDING/workflow-forms/BP-WF-ONBOARDING/submit',
        {
          payload: expect.objectContaining({
            fullName: 'Joao Demo',
            email: 'joao@nexor.dev',
            phone: '11999999999',
            cpf: '52998224725',
            birthDate: '1990-01-10',
            residenceCep: '01001000',
            residenceAddress: 'Praça da Sé - Sé',
            residenceComplement: 'lado ímpar',
            residenceCity: 'São Paulo',
            residenceState: 'SP',
            fullAddress: 'Praça da Sé - Sé, lado ímpar, São Paulo - SP',
            profession: 'Atleta',
            handedness: 'right',
            bodyMassKg: 70.5,
            heightM: 1.7,
            currentSports: ['running'],
            pastSports: ['strength_training'],
            trainingExperience: '2_to_5_years',
            trainingCityOrNeighborhood: 'Praça da Sé - Sé, lado ímpar, São Paulo - SP',
            trainingLocations: ['gym'],
            trainingSupport: ['personal_trainer'],
            accessories: ['sensor_watch'],
            currentTrainingHealthLimitations: 'Não',
            previousTrainingInjuries: 'Não',
            monthlyTrainingLocationSpend: 200,
            monthlyIncomeRange: '5001_10000',
            nexorMostImportantHelp: 'A treinar com segurança',
            privacyConsent: ['accepted'],
          }),
        },
        'tok'
      )
    );
    expect(await screen.findByText(/agradecemos sua disponibilidade e confian.*a/i)).toBeInTheDocument();
    expect(screen.getByText(/voc.* ser.* redirecionado em/i)).toBeInTheDocument();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/jornada'), { timeout: 8000 });
  }, 20000);

  it('blocks submission when CPF is invalid', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [onboardingForm()] });

    renderPage();

    await acceptInitialPrivacyGateIfNeeded();
    const cpfInput = await screen.findByLabelText(/cpf/i);
    fireEvent.change(cpfInput, { target: { value: '12345678901' } });
    fireEvent.blur(cpfInput);

    expect(await screen.findByText(/cpf inv.*lido/i)).toBeInTheDocument();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('marks required fields and validates CPF on blur below the input', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [onboardingForm()] });

    renderPage();

    await acceptInitialPrivacyGateIfNeeded();
    const cpfInput = await screen.findByLabelText(/cpf/i);
    expect(await screen.findByLabelText(/cpf \(\*\)/i)).toBe(cpfInput);

    fireEvent.blur(cpfInput);
    expect(await screen.findByText('Campo obrigatório')).toBeInTheDocument();

    fireEvent.change(cpfInput, { target: { value: '12345678901' } });
    fireEvent.blur(cpfInput);
    expect(await screen.findByText(/cpf inv.*lido/i)).toBeInTheDocument();
  });

  it('validates birth date on blur and blocks impossible years', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [onboardingForm()] });

    renderPage();

    await acceptInitialPrivacyGateIfNeeded();
    const birthDateInput = await screen.findByLabelText(/data de nascimento/i);
    fireEvent.change(birthDateInput, { target: { value: '01019990' } });
    fireEvent.blur(birthDateInput);

    expect(await screen.findByText(/insira uma data valida/i)).toBeInTheDocument();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('does not show CEP helper copy and scrolls smoothly to the top when advancing steps', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [onboardingForm()] });

    renderPage();

    await fillRequiredOnboardingFields();

    expect(screen.queryByText(/ao sair do campo/i)).not.toBeInTheDocument();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('uses tag autocomplete fields for current sports and accessories', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [onboardingForm()] });

    renderPage();

    await acceptInitialPrivacyGateIfNeeded();
    expect(screen.queryByRole('button', { name: /hist.*rico esportivo/i })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /esportes\/atividades passados/i })).toBeInTheDocument();
    const sportsInput = await screen.findByLabelText(/esportes\/atividades atuais/i);
    fireEvent.focus(sportsInput);
    expect(screen.getByRole('option', { name: /voleibol/i })).toBeInTheDocument();
    fireEvent.change(sportsInput, { target: { value: 'corr' } });
    fireEvent.click(screen.getByRole('option', { name: /^corrida$/i }));
    expect(sportsInput).not.toHaveFocus();

    const accessoriesInput = screen.getByLabelText(/acess.*rios de seguran.*a/i);
    accessoriesInput.focus();
    fireEvent.change(accessoriesInput, { target: { value: 'rel' } });
    fireEvent.click(screen.getByRole('option', { name: /rel.*gios sensores/i }));
    expect(accessoriesInput).not.toHaveFocus();

    expect(screen.getByRole('button', { name: /remover corrida/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remover rel.*gios sensores/i })).toBeInTheDocument();
  });

  it('uses residence as training location when same-place checkbox is selected', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [onboardingForm()] });

    renderPage();

    await acceptInitialPrivacyGateIfNeeded();
    fireEvent.change(await screen.findByLabelText(/^endere.*o/i), {
      target: { value: 'Praça da Sé - Sé' },
    });
    fireEvent.change(screen.getByLabelText(/^cidade \(\*\)$/i), { target: { value: 'São Paulo' } });
    fireEvent.change(screen.getByLabelText(/^estado \(\*\)$/i), { target: { value: 'SP' } });
    const trainingLocationInput = screen.getByLabelText(/cidade\/bairro onde treina/i);
    fireEvent.click(screen.getByLabelText(/mesmo local da resid/i));

    expect(trainingLocationInput).toBeDisabled();
    expect(trainingLocationInput).toHaveValue('Praça da Sé - Sé, São Paulo - SP');
  });

  it('shows conditional health descriptions only when the answer is yes', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [onboardingForm()] });

    renderPage();

    await acceptInitialPrivacyGateIfNeeded();
    expect(screen.queryByLabelText(/qual les.*o\/problema atual/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByLabelText(/^Sim$/i)[0]);
    const currentDescription = screen.getByLabelText(/qual les.*o\/problema atual/i);
    expect(currentDescription).toBeInTheDocument();

    fireEvent.blur(currentDescription);
    expect(await screen.findByText('Campo obrigatório')).toBeInTheDocument();

    fireEvent.change(currentDescription, { target: { value: 'Dor no joelho direito' } });
    expect(currentDescription).toHaveValue('Dor no joelho direito');

    fireEvent.click(screen.getAllByLabelText(/^Não$/i)[0]);
    expect(screen.queryByLabelText(/qual les.*o\/problema atual/i)).not.toBeInTheDocument();
  });

  it('formats financial fields as Brazilian currency cents while typing and deleting', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [onboardingForm()] });

    renderPage();

    await acceptInitialPrivacyGateIfNeeded();
    fireEvent.click(await screen.findByRole('button', { name: /perfil financeiro e objetivos/i }));

    const locationSpendInput = screen.getByLabelText(/locais de treinamento/i);
    const accessorySpendInput = screen.getByLabelText(/gasto anual com acess.*rios/i);

    fireEvent.change(locationSpendInput, { target: { value: '2' } });
    expect(locationSpendInput).toHaveValue('R$ 0,02');

    fireEvent.change(locationSpendInput, { target: { value: 'R$ 0,022' } });
    expect(locationSpendInput).toHaveValue('R$ 0,22');

    fireEvent.change(locationSpendInput, { target: { value: 'R$ 0,2' } });
    expect(locationSpendInput).toHaveValue('R$ 0,02');

    fireEvent.change(locationSpendInput, { target: { value: '20000' } });
    fireEvent.change(accessorySpendInput, { target: { value: '105000' } });

    expect(locationSpendInput).toHaveValue('R$ 200,00');
    expect(accessorySpendInput).toHaveValue('R$ 1.050,00');
  });

  it('shows a blocker when the new user is underage without guardian confirmation', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [onboardingForm()] });
    mockApiPost.mockResolvedValueOnce({
      ...onboardingForm('submitted', {
        blocked: true,
        blocker: 'minor_without_guardian',
        responseCount: 1,
      }),
      payload: {
        fullName: 'Joao Demo',
        email: 'joao@nexor.dev',
        privacyConsent: ['accepted'],
        birthDate: '2010-01-10',
      },
    });

    renderPage();

    await fillRequiredOnboardingFields({ birthDate: '10012010' });
    fireEvent.click(screen.getByRole('button', { name: /enviar formul.*rio/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/BP-DEMO-ONBOARDING/workflow-forms/BP-WF-ONBOARDING/submit',
        expect.objectContaining({
          payload: expect.objectContaining({
            birthDate: '2010-01-10'
          })
        }),
        'tok'
      )
    );
    await waitFor(() =>
      expect(screen.getAllByRole('alert').some((alert) => /respons.*vel maior/i.test(alert.textContent ?? ''))).toBe(true)
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('fills residence address fields automatically after a valid Brazilian CEP', async () => {
    const fetchMock = mockCepLookup();
    mockApiGet
      .mockResolvedValueOnce({ orders: [demoOrder()] })
      .mockResolvedValueOnce({ forms: [onboardingForm()] });

    renderPage();

    await acceptInitialPrivacyGateIfNeeded();

    expect(screen.queryByLabelText(/cidade\/bairro onde reside/i)).not.toBeInTheDocument();

    fireEvent.change(await screen.findByLabelText(/^cep/i), {
      target: { value: '01001000' },
    });

    expect(screen.getByLabelText(/^cep/i)).toHaveValue('01001-000');
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.blur(screen.getByLabelText(/^cep/i));

    await waitFor(() => {
      expect(screen.getByLabelText(/^endere.*o/i)).toHaveValue('Praça da Sé - Sé');
    });

    expect(fetchMock).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/');
    expect(screen.getByLabelText(/complemento/i)).toHaveValue('lado ímpar');
    expect(screen.getByLabelText(/^cidade \(\*\)$/i)).toHaveValue('São Paulo');
    expect(screen.getByLabelText(/^estado \(\*\)$/i)).toHaveValue('SP');
  });
});
