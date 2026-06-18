import { fireEvent, screen, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';
import { renderWithRouter } from '@/test/renderWithRouter';

// ─── Mocks hoisted ────────────────────────────────────────────────────────────
const {
  authState,
  challengeMock,
  getAuthenticatorAssuranceLevelMock,
  listFactorsMock,
  mockNavigate,
  mockToast,
  signInWithPasswordMock,
  settingsMaybeSingleMock,
  signOutMock,
  verifyMock,
} = vi.hoisted(() => ({
  authState: {
    loading: false,
    session: null as null | { user: { id: string } },
    profile: null as null | { id: string; full_name: string; avatar_url: string },
    isManager: false,
    signInMock: undefined as undefined | (() => void),
  },
  challengeMock: vi.fn(),
  getAuthenticatorAssuranceLevelMock: vi.fn(),
  listFactorsMock: vi.fn(),
  mockNavigate: vi.fn(),
  mockToast: vi.fn(),
  signInWithPasswordMock: vi.fn(),
  settingsMaybeSingleMock: vi.fn(),
  signOutMock: vi.fn(),
  verifyMock: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: signInWithPasswordMock,
      signOut: signOutMock,
      mfa: {
        getAuthenticatorAssuranceLevel: getAuthenticatorAssuranceLevelMock,
        listFactors: listFactorsMock,
        challenge: challengeMock,
        verify: verifyMock,
      },
    },
    from: vi.fn((table: string) => {
      if (table === 'settings') {
        return {
          select: vi.fn(() => ({
            maybeSingle: settingsMaybeSingleMock,
            single: settingsMaybeSingleMock,
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      };
    }),
  },
}));

vi.mock('@/lib/mockDatabase', () => ({ USE_MOCK: false }));
vi.mock('@/components/ManualModal', () => ({ ManualModal: () => null }));
vi.mock('@/components/auth/SecurityBadge', () => ({ SecurityBadge: () => null }));

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();

  authState.session = null;
  authState.profile = null;
  authState.isManager = false;
  authState.signInMock = undefined;

  settingsMaybeSingleMock.mockResolvedValue({ data: null, error: null });
  signInWithPasswordMock.mockResolvedValue({ error: null });
  getAuthenticatorAssuranceLevelMock.mockResolvedValue({
    data: { nextLevel: 'aal1', currentLevel: 'aal1' },
    error: null,
  });
  listFactorsMock.mockResolvedValue({
    data: { totp: [] },
    error: null,
  });
  challengeMock.mockResolvedValue({ data: { id: 'challenge-id-123' }, error: null });
  verifyMock.mockResolvedValue({ error: null });
  signOutMock.mockResolvedValue({ error: null });
});

// ─── Testes ───────────────────────────────────────────────────────────────────
describe('Página de Login', () => {
  it('deve renderizar os campos principais do formulário', () => {
    renderWithRouter(<Login />, { route: '/login', path: '/login' });

    expect(screen.getByPlaceholderText('exemplo@rededmi.com.br')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Entrar no Sistema')).toBeInTheDocument();
  });

  it('deve chamar o login do Supabase ao submeter o formulário', async () => {
    renderWithRouter(<Login />, { route: '/login', path: '/login' });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('exemplo@rededmi.com.br'), {
        target: { value: 'admin@rededmi.com.br' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'senha123' },
      });
      fireEvent.click(screen.getByText('Entrar no Sistema'));
    });

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: 'admin@rededmi.com.br',
      password: 'senha123',
    });
  });

  it('deve abrir a área do funcionário pelo atalho da tela de login', () => {
    renderWithRouter(<Login />, { route: '/login', path: '/login' });

    fireEvent.click(screen.getByText('Área do Funcionário'));

    expect(mockNavigate).toHaveBeenCalledWith('/clock-in');
  });

  it('deve exibir o formulário MFA quando a sessão exige segundo fator', async () => {
    // Configura MFA necessário (aal2) com fator TOTP verificado
    getAuthenticatorAssuranceLevelMock.mockResolvedValue({
      data: { nextLevel: 'aal2', currentLevel: 'aal1' },
      error: null,
    });
    listFactorsMock.mockResolvedValue({
      data: { totp: [{ id: 'factor-id-123', status: 'verified' }] },
      error: null,
    });

    // CRÍTICO: setar session E profile juntos.
    // O useEffect tem: `if (!USE_MOCK && !profile) return;`
    // Se profile for null, o efeito retorna cedo e nunca chama getAuthenticatorAssuranceLevel.
    authState.session = { user: { id: 'user-123' } } as any;
    authState.profile = { id: 'user-123', full_name: 'Teste', avatar_url: '' };

    renderWithRouter(<Login />, { route: '/login', path: '/login' });

    // Aguarda o useEffect executar e chamar getAuthenticatorAssuranceLevel
    await waitFor(() => {
      expect(getAuthenticatorAssuranceLevelMock).toHaveBeenCalled();
    });

    // Aguarda listFactors ser chamado (após detectar nextLevel === 'aal2')
    await waitFor(() => {
      expect(listFactorsMock).toHaveBeenCalled();
    });

    // O formulário MFA deve aparecer com o título correto
    await waitFor(() => {
      expect(screen.getByText('Verificação em Duas Etapas')).toBeInTheDocument();
    });

    // O campo de código de 6 dígitos deve estar visível
    expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    expect(screen.getByText('Validar Acesso')).toBeInTheDocument();
  });

  it('deve validar o código MFA e redirecionar para o dashboard', async () => {
    // Configura MFA necessário com fator TOTP verificado
    getAuthenticatorAssuranceLevelMock.mockResolvedValue({
      data: { nextLevel: 'aal2', currentLevel: 'aal1' },
      error: null,
    });
    listFactorsMock.mockResolvedValue({
      data: { totp: [{ id: 'factor-id-123', status: 'verified' }] },
      error: null,
    });
    challengeMock.mockResolvedValue({ data: { id: 'challenge-id-123' }, error: null });
    verifyMock.mockResolvedValue({ error: null });

    // CRÍTICO: session + profile para o useEffect não retornar cedo
    authState.session = { user: { id: 'user-123' } } as any;
    authState.profile = { id: 'user-123', full_name: 'Teste', avatar_url: '' };

    renderWithRouter(<Login />, { route: '/login', path: '/login' });

    // Aguarda o formulário MFA aparecer
    await waitFor(() => {
      expect(screen.getByText('Verificação em Duas Etapas')).toBeInTheDocument();
    });

    // Digita o código de 6 dígitos
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('000000'), {
        target: { value: '123456' },
      });
    });

    // Clica em "Validar Acesso"
    await act(async () => {
      fireEvent.click(screen.getByText('Validar Acesso'));
    });

    // Verifica que challenge foi chamado com o factorId correto
    await waitFor(() => {
      expect(challengeMock).toHaveBeenCalledWith({ factorId: 'factor-id-123' });
    });

    // Verifica que verify foi chamado com os parâmetros corretos
    await waitFor(() => {
      expect(verifyMock).toHaveBeenCalledWith({
        factorId: 'factor-id-123',
        challengeId: 'challenge-id-123',
        code: '123456',
      });
    });
  });
});
