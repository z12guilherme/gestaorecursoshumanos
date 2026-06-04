import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import Tickets from './Tickets';
import { renderWithRouter } from '@/test/renderWithRouter';
import { whatsappService } from '@/services/whatsappService';

// Mock dos dados
const mockEmployees = [
    { id: 'emp-1', name: 'Maria Silva', phone: '5511888888888', department: 'Financeiro' }
];

const mockRequests = [
    {
        id: 'req-1',
        employee_id: 'emp-1',
        employee_name: 'Maria Silva',
        type: 'vacation',
        status: 'pending',
        start_date: '2026-12-20',
        end_date: '2027-01-05'
    }
];

// 1. Mock dos Hooks e Supabase
vi.mock('@/hooks/useTimeOff', () => ({
    useTimeOff: () => ({
        requests: mockRequests,
        updateRequestStatus: vi.fn().mockResolvedValue({ error: null }),
    }),
}));

vi.mock('@/hooks/useEmployees', () => ({
    useEmployees: () => ({
        employees: mockEmployees,
        updateEmployee: vi.fn().mockResolvedValue({ error: null }),
    }),
}));

vi.mock('@/services/whatsappService', () => ({
    whatsappService: {
        sendMessage: vi.fn().mockResolvedValue({ success: true }),
    },
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
    },
}));

// Mock do componente Tabs para garantir que o conteúdo da aba "inbox" seja sempre renderizado
// Isso contorna problemas de JSDOM com a ativação de abas complexas do Radix UI
vi.mock('../components/ui/tabs', () => {
    return {
        Tabs: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        TabsList: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        TabsTrigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
        TabsContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    };
});

describe('Página Tickets - Integração WhatsApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve enviar WhatsApp ao aprovar solicitação na aba Inbox', async () => {
        renderWithRouter(<Tickets />, { route: '/tickets', path: '/tickets' });

        // Com o mock de Tabs, o conteúdo da aba "Inbox RH" já estará no DOM.
        // Não precisamos clicar na aba para ativá-la, apenas encontrar o botão "Aprovar" diretamente.
        // findByRole ainda é usado para aguardar a renderização do componente Tickets e seus filhos.
        const approveButton = await screen.findByRole('button', { name: /aprovar/i });
        fireEvent.click(approveButton);

        // Verificação
        await waitFor(() => {
            expect(whatsappService.sendMessage).toHaveBeenCalledTimes(1);

            // Verifica se a mensagem dinâmica com o nome do tipo (Férias) e datas foi montada
            expect(whatsappService.sendMessage).toHaveBeenCalledWith(
                '5511888888888',
                expect.stringContaining('Maria Silva, sua solicitação de Férias para o período de 2026-12-20 a 2027-01-05 foi *APROVADA*!')
            );
        });
    });
});