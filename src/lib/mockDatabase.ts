export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK).trim().toLowerCase() === 'true';

// Helper para gerar datas relativas ao "hoje"
const today = new Date();
const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString();
};
const daysFromNow = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString();
};
const dateOnly = (iso: string) => iso.split('T')[0];

export const mockDatabase = {
    init() {
        const tables = [
            'employees', 'time_off', 'payroll', 'candidates',
            'jobs', 'time_entries', 'announcements', 'performance_reviews',
            'documents', 'audit_logs', 'update_requests', 'automation_scripts',
            'ai_messages', 'settings', 'suggestions',
            'manager_protocols', 'protocol_recipients', 'protocol_replies', 'manager_tickets'
        ];
        tables.forEach(table => {
            const key = `mock_${table}`;
            const defaultKey = `default${table.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}` as keyof typeof mockDatabase;
            if (!localStorage.getItem(key) && (this as any)[defaultKey]) {
                localStorage.setItem(key, JSON.stringify((this as any)[defaultKey]));
            }
        });
    },

    get(table: string) {
        const data = localStorage.getItem(`mock_${table}`);
        return data ? JSON.parse(data) : [];
    },

    set(table: string, data: any) {
        localStorage.setItem(`mock_${table}`, JSON.stringify(data));
    },

    // Adiciona um item a uma tabela
    add(table: string, item: any) {
        const data = this.get(table);
        data.push(item);
        this.set(table, data);
        return item;
    },

    // Atualiza um item por ID
    update(table: string, id: string, updates: any) {
        const data = this.get(table);
        const index = data.findIndex((item: any) => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            this.set(table, data);
            return data[index];
        }
        return null;
    },

    // Remove um item por ID
    remove(table: string, id: string) {
        const data = this.get(table);
        const filtered = data.filter((item: any) => item.id !== id);
        this.set(table, filtered);
    },

    // =====================================================
    // ===== BANCO DE DADOS FICTÍCIO PARA APRESENTAÇÃO =====
    // =====================================================

    defaultEmployees: [
        {
            id: '101',
            name: 'Carlos Desenvolvedor',
            email: 'carlos.dev@demo.com',
            department: 'TI',
            role: 'Engenheiro de Software Sênior',
            status: 'active',
            base_salary: 8500.00,
            admission_date: '2022-03-15',
            phone: '(11) 98765-4321',
            contract_type: 'CLT',
            birth_date: '1990-07-22',
            manager: 'Diretor de Tecnologia',
            work_schedule: '09:00-18:00',
            unit: 'Matriz',
            fixed_discounts: 350.00,
            has_insalubrity: false,
            has_night_shift: false,
            contracted_hours: 220,
            password: '1234',
            created_at: '2022-03-15T10:00:00.000Z',
        },
        {
            id: '102',
            name: 'Ana do Marketing',
            email: 'ana.mkt@demo.com',
            department: 'Marketing',
            role: 'Coordenadora de Marketing',
            status: 'active',
            base_salary: 6200.00,
            admission_date: '2023-01-10',
            phone: '(11) 97654-3210',
            contract_type: 'CLT',
            birth_date: '1993-03-14',
            manager: 'Diretora Comercial',
            work_schedule: '08:00-17:00',
            unit: 'Matriz',
            fixed_discounts: 280.00,
            has_insalubrity: false,
            has_night_shift: false,
            contracted_hours: 220,
            password: '1234',
            created_at: '2023-01-10T10:00:00.000Z',
        },
        {
            id: '103',
            name: 'João do Financeiro',
            email: 'joao.fin@demo.com',
            department: 'Financeiro',
            role: 'Analista Financeiro Pleno',
            status: 'active',
            base_salary: 4800.00,
            admission_date: '2023-11-05',
            phone: '(11) 96543-2100',
            contract_type: 'CLT',
            birth_date: '1995-11-30',
            manager: 'Gerente Financeiro',
            work_schedule: '08:00-17:00',
            unit: 'Filial SP',
            fixed_discounts: 200.00,
            has_insalubrity: false,
            has_night_shift: false,
            contracted_hours: 220,
            password: '1234',
            created_at: '2023-11-05T10:00:00.000Z',
        },
        {
            id: '104',
            name: 'Fernanda RH',
            email: 'fernanda.rh@demo.com',
            department: 'Recursos Humanos',
            role: 'Analista de RH Sênior',
            status: 'active',
            base_salary: 5800.00,
            admission_date: '2021-06-01',
            phone: '(11) 95432-1098',
            contract_type: 'CLT',
            birth_date: '1988-12-05',
            manager: 'Diretora de RH',
            work_schedule: '08:00-17:00',
            unit: 'Matriz',
            fixed_discounts: 310.00,
            has_insalubrity: false,
            has_night_shift: false,
            contracted_hours: 220,
            password: '1234',
            created_at: '2021-06-01T10:00:00.000Z',
        },
        {
            id: '105',
            name: 'Ricardo Operações',
            email: 'ricardo.ops@demo.com',
            department: 'Operações',
            role: 'Supervisor de Operações',
            status: 'vacation',
            base_salary: 7200.00,
            admission_date: '2020-02-20',
            phone: '(11) 94321-0987',
            contract_type: 'CLT',
            birth_date: '1985-05-18',
            manager: 'Diretor de Operações',
            work_schedule: '07:00-16:00',
            unit: 'Filial RJ',
            fixed_discounts: 400.00,
            has_insalubrity: true,
            has_night_shift: false,
            contracted_hours: 220,
            password: '1234',
            created_at: '2020-02-20T10:00:00.000Z',
        },
    ],

    defaultTimeOff: [
        {
            id: '201',
            employee_id: '102',
            type: 'vacation',
            start_date: dateOnly(daysFromNow(10)),
            end_date: dateOnly(daysFromNow(25)),
            status: 'approved',
            reason: 'Férias programadas',
            created_at: daysAgo(5),
            attachment_url: null,
            employee: { name: 'Ana do Marketing', department: 'Marketing' },
        },
        {
            id: '202',
            employee_id: '105',
            type: 'vacation',
            start_date: dateOnly(daysAgo(3)),
            end_date: dateOnly(daysFromNow(12)),
            status: 'approved',
            reason: 'Férias regulamentares',
            created_at: daysAgo(15),
            attachment_url: null,
            employee: { name: 'Ricardo Operações', department: 'Operações' },
        },
        {
            id: '203',
            employee_id: '103',
            type: 'sick',
            start_date: dateOnly(daysAgo(1)),
            end_date: dateOnly(daysFromNow(2)),
            status: 'pending',
            reason: 'Consulta médica',
            created_at: daysAgo(1),
            attachment_url: null,
            employee: { name: 'João do Financeiro', department: 'Financeiro' },
        },
    ],

    defaultPayroll: [
        {
            id: 'pay-101',
            employee_id: '101',
            employee_name: 'Carlos Desenvolvedor',
            department: 'TI',
            base_salary: 8500.00,
            overtime_hours: 12,
            overtime_amount: 580.90,
            deductions: 1850.00,
            net_salary: 7230.90,
            month: today.getMonth() + 1,
            year: today.getFullYear(),
        },
        {
            id: 'pay-102',
            employee_id: '102',
            employee_name: 'Ana do Marketing',
            department: 'Marketing',
            base_salary: 6200.00,
            overtime_hours: 4,
            overtime_amount: 169.09,
            deductions: 1340.00,
            net_salary: 5029.09,
            month: today.getMonth() + 1,
            year: today.getFullYear(),
        },
        {
            id: 'pay-103',
            employee_id: '103',
            employee_name: 'João do Financeiro',
            department: 'Financeiro',
            base_salary: 4800.00,
            overtime_hours: 0,
            overtime_amount: 0,
            deductions: 960.00,
            net_salary: 3840.00,
            month: today.getMonth() + 1,
            year: today.getFullYear(),
        },
        {
            id: 'pay-104',
            employee_id: '104',
            employee_name: 'Fernanda RH',
            department: 'Recursos Humanos',
            base_salary: 5800.00,
            overtime_hours: 6,
            overtime_amount: 237.27,
            deductions: 1200.00,
            net_salary: 4837.27,
            month: today.getMonth() + 1,
            year: today.getFullYear(),
        },
        {
            id: 'pay-105',
            employee_id: '105',
            employee_name: 'Ricardo Operações',
            department: 'Operações',
            base_salary: 7200.00,
            overtime_hours: 8,
            overtime_amount: 392.72,
            deductions: 1680.00,
            net_salary: 5912.72,
            month: today.getMonth() + 1,
            year: today.getFullYear(),
        },
    ],

    defaultCandidates: [
        {
            id: '301',
            job_id: '401',
            name: 'Mariana Silva',
            email: 'mariana.silva@email.com',
            phone: '(21) 99887-6543',
            position: 'Desenvolvedor Front-end',
            status: 'screening',
            match_score: 95,
            rating: 5,
            notes: 'Excelente portfólio em React e TypeScript. Experiência com Design Systems.',
            applied_at: daysAgo(2),
            resume_url: null,
            role_applied: 'Desenvolvedor Front-end',
        },
        {
            id: '302',
            job_id: '401',
            name: 'Pedro Mendes',
            email: 'pedro.mendes@email.com',
            phone: '(31) 99776-5432',
            position: 'Desenvolvedor Front-end',
            status: 'interview',
            match_score: 82,
            rating: 4,
            notes: 'Boa experiência com Vue.js, em transição para React.',
            applied_at: daysAgo(5),
            resume_url: null,
            role_applied: 'Desenvolvedor Front-end',
        },
        {
            id: '303',
            job_id: '402',
            name: 'Luciana Costa',
            email: 'luciana.costa@email.com',
            phone: '(41) 99665-4321',
            position: 'Analista de Marketing Digital',
            status: 'applied',
            match_score: 78,
            rating: 3,
            notes: 'Experiência sólida em SEO e Google Ads.',
            applied_at: daysAgo(1),
            resume_url: null,
            role_applied: 'Analista de Marketing Digital',
        },
    ],

    defaultJobs: [
        {
            id: '401',
            title: 'Desenvolvedor Front-end Pleno',
            department: 'TI',
            location: 'Remoto',
            type: 'Tempo Integral',
            status: 'Aberta',
            description: 'Buscamos desenvolvedor React/TypeScript para atuar em nosso produto SaaS de RH.',
            requirements: ['React', 'TypeScript', 'CSS/Tailwind', 'Git', 'API REST'],
            created_at: daysAgo(7),
            applicants_count: 2,
        },
        {
            id: '402',
            title: 'Analista de Marketing Digital',
            department: 'Marketing',
            location: 'Híbrido',
            type: 'Tempo Integral',
            status: 'Aberta',
            description: 'Profissional para gestão de campanhas digitais e geração de leads.',
            requirements: ['Google Ads', 'SEO', 'Redes Sociais', 'Analytics', 'Copywriting'],
            created_at: daysAgo(3),
            applicants_count: 1,
        },
        {
            id: '403',
            title: 'Estagiário de Administração',
            department: 'Financeiro',
            location: 'Presencial',
            type: 'Estágio',
            status: 'Aberta',
            description: 'Vaga de estágio para apoio nas rotinas financeiras e administrativas.',
            requirements: ['Cursando Administração ou Contabilidade', 'Excel Intermediário', 'Proatividade'],
            created_at: daysAgo(1),
            applicants_count: 0,
        },
    ],

    defaultTimeEntries: (() => {
        const entries: any[] = [];
        const emps = [
            { id: '101', name: 'Carlos Desenvolvedor', dept: 'TI' },
            { id: '102', name: 'Ana do Marketing', dept: 'Marketing' },
            { id: '103', name: 'João do Financeiro', dept: 'Financeiro' },
            { id: '104', name: 'Fernanda RH', dept: 'Recursos Humanos' },
        ];
        const now = new Date();
        let counter = 1;

        for (let i = 4; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            emps.forEach(emp => {
                // João faltou há 2 dias (anomalia: ausência)
                if (emp.id === '103' && i === 2) return;

                // Carlos esqueceu saída ontem (anomalia: batida ímpar)
                if (emp.id === '101' && i === 1) {
                    entries.push({ id: `te-${counter++}`, timestamp: `${dateStr}T08:00:00.000Z`, type: 'in', employee_id: emp.id, employees: { name: emp.name, department: emp.dept } });
                    return;
                }

                // Hoje (simulando andamento do expediente)
                if (i === 0) {
                    entries.push({ id: `te-${counter++}`, timestamp: `${dateStr}T08:00:00.000Z`, type: 'in', employee_id: emp.id, employees: { name: emp.name, department: emp.dept } });
                    if (emp.id === '101') {
                        entries.push({ id: `te-${counter++}`, timestamp: `${dateStr}T12:30:00.000Z`, type: 'lunch_start', employee_id: emp.id, employees: { name: emp.name, department: emp.dept } });
                    }
                    if (emp.id === '103') {
                        entries.push({ id: `te-${counter++}`, timestamp: `${dateStr}T18:00:00.000Z`, type: 'out', employee_id: emp.id, employees: { name: emp.name, department: emp.dept } });
                    }
                    return;
                }

                // Dias normais
                entries.push({ id: `te-${counter++}`, timestamp: `${dateStr}T08:00:00.000Z`, type: 'in', employee_id: emp.id, employees: { name: emp.name, department: emp.dept } });
                entries.push({ id: `te-${counter++}`, timestamp: `${dateStr}T12:00:00.000Z`, type: 'lunch_start', employee_id: emp.id, employees: { name: emp.name, department: emp.dept } });
                entries.push({ id: `te-${counter++}`, timestamp: `${dateStr}T13:00:00.000Z`, type: 'lunch_end', employee_id: emp.id, employees: { name: emp.name, department: emp.dept } });
                entries.push({ id: `te-${counter++}`, timestamp: `${dateStr}T18:00:00.000Z`, type: 'out', employee_id: emp.id, employees: { name: emp.name, department: emp.dept } });
            });
        }

        return entries;
    })(),

    defaultAnnouncements: [
        {
            id: 'ann-1',
            title: 'Confraternização de Fim de Ano',
            content: 'Nossa confraternização será no dia 20/12 às 19h no Restaurante Sabores do Chef. Confirmem presença até sexta-feira!',
            priority: 'high' as const,
            author: 'Fernanda RH',
            created_at: daysAgo(2),
        },
        {
            id: 'ann-2',
            title: 'Novo Plano de Saúde',
            content: 'A partir do próximo mês, teremos um novo convênio médico com cobertura ampliada. Detalhes serão enviados por e-mail.',
            priority: 'medium' as const,
            author: 'Diretoria',
            created_at: daysAgo(5),
        },
        {
            id: 'ann-3',
            title: 'Manutenção no Sistema',
            content: 'O sistema ficará indisponível no sábado das 22h às 02h para manutenção programada.',
            priority: 'low' as const,
            author: 'TI',
            created_at: daysAgo(1),
        },
    ],

    defaultPerformanceReviews: [
        {
            id: 'perf-1',
            employee_id: '101',
            reviewer_id: '104',
            period: '2025-Q4',
            overall_score: 9.2,
            goals: [
                { description: 'Entregar módulo de Ponto Eletrônico', achieved: true, score: 10 },
                { description: 'Reduzir bugs em produção em 30%', achieved: true, score: 9 },
                { description: 'Mentoria de 2 devs juniores', achieved: false, score: 7 },
            ],
            competencies: [
                { name: 'Comunicação', score: 8 },
                { name: 'Técnica', score: 10 },
                { name: 'Liderança', score: 8 },
                { name: 'Proatividade', score: 9 },
            ],
            feedback: 'Carlos demonstrou excelência técnica e entregou todas as funcionalidades dentro do prazo. Precisa melhorar a delegação e mentoria.',
            created_at: daysAgo(30),
            employee: { name: 'Carlos Desenvolvedor' },
            reviewer: { name: 'Fernanda RH' },
        },
        {
            id: 'perf-2',
            employee_id: '102',
            reviewer_id: '104',
            period: '2025-Q4',
            overall_score: 8.5,
            goals: [
                { description: 'Aumentar leads em 25%', achieved: true, score: 9 },
                { description: 'Lançar campanha institucional', achieved: true, score: 8 },
            ],
            competencies: [
                { name: 'Comunicação', score: 10 },
                { name: 'Técnica', score: 7 },
                { name: 'Criatividade', score: 9 },
                { name: 'Proatividade', score: 8 },
            ],
            feedback: 'Ana superou a meta de leads e demonstrou criatividade nas campanhas. Sugerimos aprofundar conhecimentos em analytics.',
            created_at: daysAgo(28),
            employee: { name: 'Ana do Marketing' },
            reviewer: { name: 'Fernanda RH' },
        },
    ],

    defaultDocuments: [
        {
            id: 'doc-1',
            employee_id: '101',
            name: 'Contrato de Trabalho - Carlos',
            url: '#',
            created_at: '2022-03-15T10:00:00.000Z',
        },
        {
            id: 'doc-2',
            employee_id: '101',
            name: 'Certificado TypeScript Avançado',
            url: '#',
            created_at: '2024-06-10T10:00:00.000Z',
        },
        {
            id: 'doc-3',
            employee_id: '102',
            name: 'Contrato de Trabalho - Ana',
            url: '#',
            created_at: '2023-01-10T10:00:00.000Z',
        },
    ],

    defaultAuditLogs: [
        {
            id: 'audit-1',
            table_name: 'employees',
            record_id: '101',
            action: 'UPDATE' as const,
            old_data: { base_salary: 7500 },
            new_data: { base_salary: 8500 },
            changed_by: 'admin@demo.com',
            changed_at: daysAgo(10),
        },
        {
            id: 'audit-2',
            table_name: 'time_off_requests',
            record_id: '201',
            action: 'INSERT' as const,
            old_data: null,
            new_data: { employee_id: '102', type: 'vacation', status: 'approved' },
            changed_by: 'fernanda.rh@demo.com',
            changed_at: daysAgo(5),
        },
        {
            id: 'audit-3',
            table_name: 'employees',
            record_id: '105',
            action: 'UPDATE' as const,
            old_data: { status: 'active' },
            new_data: { status: 'vacation' },
            changed_by: 'fernanda.rh@demo.com',
            changed_at: daysAgo(3),
        },
    ],

    defaultUpdateRequests: [
        {
            id: 'upd-1',
            employee_id: '103',
            requested_changes: { phone: '(11) 91234-5678', email: 'joao.novo@demo.com' },
            status: 'pending' as const,
            created_at: daysAgo(1),
            employees: { name: 'João do Financeiro', department: 'Financeiro', avatar_url: '' },
        },
    ],

    defaultAutomationScripts: [
        {
            id: 'auto-1',
            title: 'Relatório Mensal de Horas',
            description: 'Gera automaticamente o relatório consolidado de horas trabalhadas no final do mês.',
            code: '// Automação: Relatório Mensal\nconst report = generateMonthlyReport();\nsendEmail(hr_email, report);',
            language: 'javascript',
            instructions: 'Executar no último dia útil de cada mês.',
            is_custom: false,
            created_at: daysAgo(60),
        },
        {
            id: 'auto-2',
            title: 'Alerta de Aniversário',
            description: 'Envia notificação de aniversário para o RH e parabéns automático para o colaborador.',
            code: '// Automação: Aniversários\nconst birthdays = getTodayBirthdays();\nbirthdays.forEach(sendCongrats);',
            language: 'javascript',
            instructions: 'Executar diariamente às 08:00.',
            is_custom: true,
            created_at: daysAgo(30),
        },
    ],

    defaultAiMessages: [
        {
            id: 'aim-1',
            role: 'assistant',
            content: `Olá! Sou seu assistente de RH inteligente. 🤖\nEstou aqui para agilizar sua gestão. Você pode conversar comigo naturalmente ou usar os comandos numéricos.\n\nExemplos do que posso fazer:\n• "Liste os colaboradores do setor de Tecnologia"\n• "Quantas pessoas temos na empresa?"\n• "Há vagas abertas para Desenvolvedor?"\n\nMenu Rápido:\n1. Listar todos\n2. Contagem total\n3. Vagas abertas\n4. Férias\n5. Criar aviso\n6. Buscar\n7. Demitir\n8. Admissão em massa`,
            created_at: daysAgo(0),
        },
    ],

    defaultSettings: {
        company_name: 'Empresa Demo',
        cnpj: '12.345.678/0001-99',
        avatar_url: null,
        theme: 'system',
        login_background_url: null,
        login_title: 'Portal de Gestão de Pessoas',
        login_subtitle: 'Sistema demo para gestão de recursos humanos',
    },

    defaultSuggestions: [
        {
            id: 'sug-1',
            customer_name: 'Anônimo',
            contact_info: '',
            content: 'Acho que poderíamos ter mais opções de frutas no refeitório.',
            created_at: daysAgo(2),
            status: 'Nova'
        },
        {
            id: 'sug-2',
            customer_name: 'Marcos Silva',
            contact_info: 'marcos@email.com',
            content: 'O processo de reembolso de despesas está muito burocrático e demorado. Demorei 2 meses para receber um absurdo! Acionarei meu advogado.',
            created_at: daysAgo(5),
            status: 'Nova'
        },
        {
            id: 'sug-3',
            customer_name: 'Juliana TI',
            contact_info: 'juliana@demo.com',
            content: 'Queria deixar um elogio incrível para a equipe do RH pelo evento de fim de ano, foi maravilhoso! Parabéns!',
            created_at: daysAgo(10),
            status: 'Lida'
        }
    ],

    defaultManagerProtocols: [
        {
            id: 'proto-1',
            protocol_number: 'PROT-2026-000001',
            subject: 'Reunião de Alinhamento Q3 - Metas e KPIs',
            body: 'Prezados gestores,\n\nConvoco reunião de alinhamento para definição das metas do terceiro trimestre. Precisamos revisar os KPIs de cada área e definir planos de ação.\n\nA reunião ocorrerá via meet na próxima terça-feira às 10h.\n\nAtenciosamente,\nDiretoria',
            sender_id: 'mock-admin-id',
            sender_name: 'Administrador Demo',
            priority: 'high',
            category: 'directive',
            status: 'open',
            created_at: daysAgo(3),
            updated_at: daysAgo(3),
        },
        {
            id: 'proto-2',
            protocol_number: 'PROT-2026-000002',
            subject: 'Solicitação de Aprovação: Contratação Urgente - Setor Financeiro',
            body: 'RH Estratégico,\n\nSolicito aprovação para abertura imediata de vaga no setor financeiro. A saída do colaborador João do Financeiro impactará diretamente o fechamento mensal.\n\nRationale: Sem reposição, risco de atraso no balanço do mês.',
            sender_id: 'mock-admin-id',
            sender_name: 'Administrador Demo',
            priority: 'urgent',
            category: 'request',
            status: 'open',
            created_at: daysAgo(1),
            updated_at: daysAgo(1),
        },
    ],

    defaultProtocolRecipients: [
        {
            id: 'recip-1',
            protocol_id: 'proto-1',
            recipient_id: 'mock-admin-id',
            recipient_name: 'Administrador Demo',
            read_at: daysAgo(2),
            acknowledged_at: daysAgo(1),
            created_at: daysAgo(3),
        },
        {
            id: 'recip-2',
            protocol_id: 'proto-2',
            recipient_id: 'mock-admin-id',
            recipient_name: 'Administrador Demo',
            read_at: null,
            acknowledged_at: null,
            created_at: daysAgo(1),
        },
    ],

    defaultProtocolReplies: [
        {
            id: 'reply-1',
            protocol_id: 'proto-1',
            sender_id: 'mock-admin-id',
            sender_name: 'Administrador Demo',
            body: 'Confirmo presença na reunião. Já preparei os slides com os dados do meu setor.',
            created_at: daysAgo(2),
        },
    ],

    defaultManagerTickets: [
        {
            id: 'tick-1',
            ticket_number: 'TICK-2026-000001',
            requester_id: 'mock-admin-id',
            requester_name: 'Administrador Demo',
            assigned_to: 'RH Estratégico',
            subject: 'Revisão da Política de Banco de Horas',
            description: 'A política atual de banco de horas está gerando conflitos com colaboradores do turno da tarde. Solicito revisão e emissão de nova circular explicativa.',
            status: 'in_progress',
            priority: 'normal',
            resolution: null,
            created_at: daysAgo(7),
            updated_at: daysAgo(2),
        },
        {
            id: 'tick-2',
            ticket_number: 'TICK-2026-000002',
            requester_id: 'mock-admin-id',
            requester_name: 'Administrador Demo',
            assigned_to: 'Diretoria',
            subject: 'Autorização para Horas Extras - Projeto Especial',
            description: 'Solicito autorização formal para banco de horas extras da equipe durante o mês de junho para entrega do projeto especial do cliente X.',
            status: 'open',
            priority: 'high',
            resolution: null,
            created_at: daysAgo(1),
            updated_at: daysAgo(1),
        },
    ],
};

// Inicializa o banco falso assim que o arquivo é importado
if (USE_MOCK) mockDatabase.init();
