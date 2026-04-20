import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import ClockInPage from './ClockIn';
import { renderWithRouter } from '@/test/renderWithRouter';

const {
  deleteEntryMock,
  employees,
  fromMock,
  getPendingEntriesMock,
  mockNavigate,
  mockToast,
  rpcMock,
  saveEntryMock,
  settingsMaybeSingleMock,
  timeEntriesInsertMock,
  timeEntriesMaybeSingleMock,
} = vi.hoisted(() => ({
  deleteEntryMock: vi.fn(),
  employees: [
    {
      id: 'emp-1',
      name: 'Maria Silva',
      email: 'maria@empresa.com',
      phone: '11999999999',
      position: 'Analista de RH',
      department: 'RH',
      contractType: 'CLT' as const,
      status: 'active' as const,
      hireDate: '2024-01-01',
      birthDate: '1990-01-01',
      password: '1234',
    },
  ],
  fromMock: vi.fn(),
  getPendingEntriesMock: vi.fn(),
  mockNavigate: vi.fn(),
  mockToast: vi.fn(),
  rpcMock: vi.fn(),
  saveEntryMock: vi.fn(),
  settingsMaybeSingleMock: vi.fn(),
  timeEntriesInsertMock: vi.fn(),
  timeEntriesMaybeSingleMock: vi.fn(),
}));

function buildTableMock(table: string) {
  if (table === 'settings') {
    return {
      select: vi.fn(() => ({
        maybeSingle: settingsMaybeSingleMock,
      })),
    };
  }

  if (table === 'time_entries') {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: timeEntriesMaybeSingleMock,
            })),
          })),
        })),
      })),
      insert: timeEntriesInsertMock,
    };
  }

  if (table === 'tickets') {
    return {
      insert: vi.fn(),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
    };
  }

  return {
    insert: vi.fn(),
    select: vi.fn(() => ({
      maybeSingle: vi.fn(),
      order: vi.fn(),
      eq: vi.fn(),
    })),
  };
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/useEmployees', () => ({
  useEmployees: () => ({
    employees,
  }),
}));

vi.mock('@/hooks/useCommunication', () => ({
  useCommunication: () => ({
    announcements: [
      {
        id: 'announcement-1',
        title: 'Atualização de Escala',
        content: 'A nova escala foi publicada.',
        priority: 'medium',
        author: 'RH',
        created_at: '2026-01-10T12:00:00.000Z',
      },
    ],
  }),
}));

vi.mock('@/hooks/useDocuments', () => ({
  useDocuments: () => ({
    documents: [],
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock('@/lib/offlineDb', () => ({
  offlineDb: {
    getPendingEntries: getPendingEntriesMock,
    saveEntry: saveEntryMock,
    deleteEntry: deleteEntryMock,
  },
}));

vi.mock('@/components/PayslipButton', () => ({
  PayslipButton: () => <button type="button">Baixar Holerite</button>,
}));

vi.mock('@/components/PayslipViewerModal', () => ({
  PayslipViewerModal: () => null,
}));

vi.mock('@/components/EmployeeBadge', () => ({
  EmployeeBadge: () => <div>Crachá do Colaborador</div>,
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: unknown }) => <div>{children as any}</div>,
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: fromMock,
    rpc: rpcMock,
  },
}));

describe('ClockInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsMaybeSingleMock.mockResolvedValue({
      data: { company_name: 'Hospital DMI', cnpj: '04.232.442/0001-14' },
      error: null,
    });
    timeEntriesMaybeSingleMock.mockResolvedValue({ data: null, error: null });
    timeEntriesInsertMock.mockResolvedValue({ error: null });
    getPendingEntriesMock.mockResolvedValue([]);
    saveEntryMock.mockResolvedValue(undefined);
    deleteEntryMock.mockResolvedValue(undefined);
    rpcMock.mockResolvedValue({ data: [], error: null });
    fromMock.mockImplementation(buildTableMock);

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });

    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: {
              latitude: -23.5505,
              longitude: -46.6333,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: () => ({}),
            },
            timestamp: Date.now(),
            toJSON: () => ({}),
          } as GeolocationPosition),
      },
    });
  });

  it('registra uma entrada online para um colaborador identificado pelo PIN', async () => {
    renderWithRouter(<ClockInPage />, { route: '/clock-in', path: '/clock-in' });

    fireEvent.change(screen.getByPlaceholderText(/digite seu pin/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /registrar entrada/i }));

    await waitFor(() => {
      expect(timeEntriesInsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          employee_id: 'emp-1',
          type: 'in',
          latitude: -23.5505,
          longitude: -46.6333,
          timestamp: expect.any(String),
        }),
      );
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ponto Registrado!',
      }),
    );
    expect(screen.getByPlaceholderText(/digite seu pin/i)).toHaveValue('');
  });

  it('bloqueia uma saída como primeiro registro do dia', async () => {
    renderWithRouter(<ClockInPage />, { route: '/clock-in', path: '/clock-in' });

    fireEvent.change(screen.getByPlaceholderText(/digite seu pin/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /registrar saída/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Ação Inválida',
          variant: 'destructive',
        }),
      );
    });

    expect(timeEntriesInsertMock).not.toHaveBeenCalled();
  });

  it('retorna ao login pelo acesso administrativo', async () => {
    renderWithRouter(<ClockInPage />, { route: '/clock-in', path: '/clock-in' });
    await waitFor(() => expect(settingsMaybeSingleMock).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /acesso administrativo/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
