import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// Mock do hook useAuth e useNavigate
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    session: null,
    loading: false,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock do useToast para evitar erros de contexto
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock do Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

describe('Página de Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar os campos de email e senha', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Verifica se os inputs existem (ajuste o texto se seu placeholder for diferente)
    expect(screen.getByPlaceholderText(/exemplo@rededmi.com.br/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar|acessar|login/i })).toBeInTheDocument();
  });

  it('deve chamar a função signIn ao submeter o formulário', async () => {
    // Configura o mock do Supabase para retornar sucesso
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { session: { user: { id: '123' } } },
      error: null,
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/exemplo@rededmi.com.br/i), { target: { value: 'admin@teste.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: '123456' } });
    
    fireEvent.click(screen.getByRole('button', { name: /entrar|acessar|login/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'admin@teste.com',
        password: '123456',
      });
    });
  });
});