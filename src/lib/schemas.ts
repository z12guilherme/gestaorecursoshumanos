import { z } from 'zod';

// Esquema para validação de Colaboradores (server-side / API)
export const employeeSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    role: z.string().min(2, "Cargo é obrigatório"),
    department: z.string().min(2, "Departamento é obrigatório"),
    salary: z.number().positive("Salário deve ser maior que zero"),
    admission_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Data de admissão inválida",
    }),
    status: z.enum(['active', 'vacation', 'terminated', 'Ativo', 'Férias', 'Desligado']),
    cpf: z.string().length(14, "CPF deve seguir o formato 000.000.000-00"),
});

// ──────────────────────────────────────────────────────────────
// Esquema completo para o formulário de criação/edição (client-side)
// Integrado com react-hook-form via zodResolver
// ──────────────────────────────────────────────────────────────
export const employeeFormSchema = z.object({
    // === Dados Pessoais (obrigatórios) ===
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    phone: z.string().min(1, "Telefone é obrigatório"),
    role: z.string().min(2, "Cargo é obrigatório"),
    department: z.string().min(2, "Departamento é obrigatório"),
    contract_type: z.string().min(1, "Tipo de contrato é obrigatório"),
    status: z.enum(['active', 'vacation', 'leave', 'terminated'], {
        required_error: "Status é obrigatório",
    }),
    admission_date: z.string().min(1, "Data de admissão é obrigatória"),
    birth_date: z.string().min(1, "Data de nascimento é obrigatória"),

    // === Campos Opcionais ===
    cpf: z.string()
        .refine((val) => val === '' || val.length === 14, {
            message: "CPF deve seguir o formato 000.000.000-00",
        })
        .optional()
        .default(''),
    password: z.string().optional().default(''),
    termination_date: z.string().optional().nullable().default(null),
    avatar_url: z.string().optional().default(''),

    // === Dados Financeiros ===
    base_salary: z.coerce.number().min(0, "Salário base não pode ser negativo").default(0),
    fixed_discounts: z.coerce.number().min(0, "Descontos fixos não podem ser negativos").default(0),
    inss_value: z.coerce.number().nullable().optional().default(null),
    contracted_hours: z.coerce.number().min(0, "Carga horária não pode ser negativa").default(220),
    has_insalubrity: z.boolean().default(false),
    insalubrity_amount: z.coerce.number().min(0).default(0),
    has_night_shift: z.boolean().default(false),
    night_shift_amount: z.coerce.number().min(0).default(0),

    // === Documentação & Prazos ===
    pis_pasep: z.string().optional().default(''),
    pix_key: z.string().optional().default(''),
    vacation_due_date: z.string().optional().default(''),
    vacation_limit_date: z.string().optional().default(''),

    // === Listas Dinâmicas ===
    variable_discounts: z.array(z.object({
        description: z.string(),
        value: z.coerce.number().min(0, "Valor não pode ser negativo"),
    })).default([]),
    variable_additions: z.array(z.object({
        description: z.string(),
        value: z.coerce.number().min(0, "Valor não pode ser negativo"),
    })).default([]),

    // === Campos Personalizados ===
    custom_fields: z.record(z.string(), z.any()).default({}),
});

// Tipo inferido para uso com react-hook-form
export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// ──────────────────────────────────────────────────────────────
// Esquema para Avaliação de Desempenho
// ──────────────────────────────────────────────────────────────
export const performanceReviewSchema = z.object({
    employee_id: z.string().uuid("ID do colaborador inválido"),
    reviewer_id: z.string().uuid("ID do avaliador inválido"),
    period: z.string().regex(/^\d{2}\/\d{4}$/, "Formato de período deve ser MM/AAAA"),
    overall_score: z.number().min(0).max(5),
    feedback: z.string().min(10, "O feedback deve ter pelo menos 10 caracteres"),
    goals: z.array(z.object({
        description: z.string(),
        achieved: z.boolean(),
        score: z.number()
    })),
});