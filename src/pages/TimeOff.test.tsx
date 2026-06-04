import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import TimeOff from './TimeOff';
import { renderWithRouter } from '@/test/renderWithRouter';
import { whatsappService } from '@/services/whatsappService';

// Dados mockados para simular o comportamento do banco/hooks
const mockEmployees = [
    { id: 'emp-1', name: 'João Silva', phone: '5511999999999', department: 'TI', status: 'active' }
];

const mockRequests = [
    {
        id: 'req-1',
        employee_id: 'emp-1',
        employee_name: 'João Silva',
        type: 'vacation',
        status: 'pending',
        start_date: '2026-06-01',
        end_date: '2026-06-15'
    }
];

// 1. Mock dos Hooks de dados
vi.mock('@/hooks/useTimeOff', () => ({
    useTimeOff: () => ({
        requests: mockRequests,
        loading: false,
        updateRequestStatus: vi.fn().mockResolvedValue({ error: null }),
        addRequest: vi.fn(),
        refetch: vi.fn(),
    }),
}));

vi.mock('@/hooks/useEmployees', () => ({
    useEmployees: () => ({
        employees: mockEmployees,
        loading: false,
        updateEmployee: vi.fn().mockResolvedValue({ error: null }),
    }),
}));

// 2. Mock do serviço de WhatsApp (O ponto principal)
vi.mock('@/services/whatsappService', () => ({
    whatsappService: {
        sendMessage: vi.fn().mockResolvedValue({ success: true }),
    },
}));

// Mock do AppLayout para evitar erros de renderização de componentes de layout complexos
vi.mock('@/components/layout/AppLayout', () => ({
    AppLayout: ({ children }: any) => <div>{children}</div>,
}));

describe('Página TimeOff - Integração WhatsApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve chamar o whatsappService com a mensagem de aprovação correta ao clicar em Aprovar', async () => {
        renderWithRouter(<TimeOff />, { route: '/time-off', path: '/time-off' });

        // Encontra o botão de "Aprovar" na lista de solicitações pendentes
        const approveButton = screen.getByRole('button', { name: /aprovar/i });
        fireEvent.click(approveButton);

        // 3. Verificação (Assertion)
        await waitFor(() => {
            // Verifica se o serviço de mensagem foi chamado
            expect(whatsappService.sendMessage).toHaveBeenCalledTimes(1);

            // Verifica se foi enviado para o número correto e contém o texto esperado
            expect(whatsappService.sendMessage).toHaveBeenCalledWith(
                '5511999999999',
                expect.stringContaining('Olá João Silva, suas férias para o período de 01/06/2026 a 15/06/2026 foram *APROVADAS*! 🎉')
            );
        });
    });
});