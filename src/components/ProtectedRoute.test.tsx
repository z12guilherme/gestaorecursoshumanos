import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { renderWithRouter } from '@/test/renderWithRouter';

const authState = {
  loading: false,
  session: null as null | { user: { id: string } },
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

describe('ProtectedRoute', () => {
  it('redireciona para login quando não existe sessão', async () => {
    authState.loading = false;
    authState.session = null;

    renderWithRouter(
      <Routes>
        <Route path="/login" element={<div>Tela de Login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/relatorios" element={<div>Área Protegida</div>} />
        </Route>
      </Routes>,
      { route: '/relatorios' },
    );

    expect(await screen.findByText('Tela de Login')).toBeInTheDocument();
    expect(screen.queryByText('Área Protegida')).not.toBeInTheDocument();
  });

  it('renderiza o conteúdo protegido quando a sessão existe', async () => {
    authState.loading = false;
    authState.session = { user: { id: 'user-1' } };

    renderWithRouter(
      <Routes>
        <Route path="/login" element={<div>Tela de Login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/relatorios" element={<div>Área Protegida</div>} />
        </Route>
      </Routes>,
      { route: '/relatorios' },
    );

    expect(await screen.findByText('Área Protegida')).toBeInTheDocument();
    expect(screen.queryByText('Tela de Login')).not.toBeInTheDocument();
  });
});
