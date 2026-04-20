import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';
import { renderWithRouter } from '@/test/renderWithRouter';

const {
  authState,
  challengeMock,
  getAuthenticatorAssuranceLevelMock,
  listFactorsMock,
  mockNavigate,
  mockToast,
  signInWithPasswordMock,
  signOutMock,
  verifyMock,
} = vi.hoisted(() => ({
  authState: {
    loading: false,
    session: null as null | { user: { id: string } },
  },
  challengeMock: vi.fn(),
  getAuthenticatorAssuranceLevelMock: vi.fn(),
  listFactorsMock: vi.fn(),
  mockNavigate: vi.fn(),
  mockToast: vi.fn(),
  signInWithPasswordMock: vi.fn(),
  signOutMock: vi.fn(),
  verifyMock: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
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
  },
}));

describe('Página de Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.loading = false;
    authState.session = null;
    signInWithPasswordMock.mockResolvedValue({ error: null });
    signOutMock.mockResolvedValue({ error: null });
    getAuthenticatorAssuranceLevelMock.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal1' },
      error: null,
    });
    listFactorsMock.mockResolvedValue({ data: { totp: [] } });
    challengeMock.mockResolvedValue({ data: { id: 'challenge-1' }, error: null });
    verifyMock.mockResolvedValue({ error: null });
  });

  it('deve renderizar os campos principais do formulário', () => {
    const { container } = renderWithRouter(<Login />, { route: '/login', path: '/login' });
    const passwordInput = container.querySelector('input[type="password"]');

    expect(screen.getByPlaceholderText(/exemplo@rededmi.com.br/i)).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar no sistema/i })).toBeInTheDocument();
  });

  it('deve chamar o login do Supabase ao submeter o formulário', async () => {
    const { container } = renderWithRouter(<Login />, { route: '/login', path: '/login' });
    const passwordInput = container.querySelector('input[type="password"]');

    fireEvent.change(screen.getByPlaceholderText(/exemplo@rededmi.com.br/i), {
      target: { value: 'admin@teste.com' },
    });
    expect(passwordInput).not.toBeNull();
    fireEvent.change(passwordInput!, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar no sistema/i }));

    await waitFor(() => {
      expect(signInWithPasswordMock).toHaveBeenCalledWith({
        email: 'admin@teste.com',
        password: '123456',
      });
    });
  });

  it('deve abrir a área do funcionário pelo atalho da tela de login', () => {
    renderWithRouter(<Login />, { route: '/login', path: '/login' });

    fireEvent.click(screen.getByRole('button', { name: /área do funcionário/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/clock-in');
  });

  it('deve exibir o formulário MFA quando a sessão exige segundo fator', async () => {
    authState.session = { user: { id: 'user-1' } };
    getAuthenticatorAssuranceLevelMock.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    });
    listFactorsMock.mockResolvedValue({
      data: { totp: [{ id: 'factor-1', status: 'verified' }] },
    });

    renderWithRouter(<Login />, { route: '/login', path: '/login' });

    expect(await screen.findByRole('heading', { name: /verificação em duas etapas/i })).toBeInTheDocument();
    expect(listFactorsMock).toHaveBeenCalled();
  });

  it('deve validar o código MFA e redirecionar para o dashboard', async () => {
    authState.session = { user: { id: 'user-1' } };
    getAuthenticatorAssuranceLevelMock.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    });
    listFactorsMock.mockResolvedValue({
      data: { totp: [{ id: 'factor-1', status: 'verified' }] },
    });

    renderWithRouter(<Login />, { route: '/login', path: '/login' });

    await screen.findByRole('heading', { name: /verificação em duas etapas/i });
    fireEvent.change(screen.getByPlaceholderText('000000'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /validar acesso/i }));

    await waitFor(() => {
      expect(challengeMock).toHaveBeenCalledWith({ factorId: 'factor-1' });
      expect(verifyMock).toHaveBeenCalledWith({
        factorId: 'factor-1',
        challengeId: 'challenge-1',
        code: '123456',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
