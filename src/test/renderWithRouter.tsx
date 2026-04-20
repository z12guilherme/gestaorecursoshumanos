import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

interface RenderWithRouterOptions extends Omit<RenderOptions, 'wrapper'> {
  path?: string;
  route?: string;
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithRouter(
  ui: ReactElement,
  { path, route = '/', ...renderOptions }: RenderWithRouterOptions = {},
) {
  const queryClient = createTestQueryClient();
  const content = path ? (
    <Routes>
      <Route path={path} element={ui} />
    </Routes>
  ) : (
    ui
  );

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[route]}
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          {content}
        </MemoryRouter>
      </QueryClientProvider>,
      renderOptions,
    ),
  };
}
