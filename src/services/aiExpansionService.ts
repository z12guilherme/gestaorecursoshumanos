/**
 * Serviço de Expansão de Inteligência Artificial
 * Lida com integrações avançadas de IA para Recursos Humanos.
 */

export interface CandidateParseResult {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experienceYears: number;
    summary: string;
}

export interface TurnoverRiskPrediction {
    employeeId: string;
    riskScore: number; // 0 a 100
    riskLevel: 'Baixo' | 'Médio' | 'Alto';
    contributingFactors: string[];
}

/**
 * Extrai dados estruturados de um currículo em formato PDF/Texto
 * Em um ambiente real, faria uma chamada a uma API como OpenAI (GPT-4) ou AWS Textract
 */
export async function parseResumeWithAI(resumeTextContent: string): Promise<CandidateParseResult> {
    // Simulação de chamada de API de IA para extração de entidades
    console.log('Analisando currículo com IA...', resumeTextContent.substring(0, 50));

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                name: 'Candidato Extraído pela IA',
                email: 'candidato.ia@exemplo.com',
                phone: '(11) 99999-9999',
                skills: ['React', 'TypeScript', 'Node.js', 'Liderança'],
                experienceYears: 5,
                summary: 'Profissional com ampla experiência em desenvolvimento web e arquitetura de sistemas.'
            });
        }, 1500); // Simulando delay de rede
    });
}

/**
 * Analisa o padrão de comportamento de um funcionário para prever risco de saída (Turnover)
 * Baseado em heurísticas e (idealmente) modelos de Machine Learning (ex: Random Forest)
 */
export async function predictTurnoverRisk(
    employeeId: string,
    metrics: {
        recentAbsences: number;
        overtimeHours: number;
        lastPerformanceScore: number; // 0 a 10
        monthsSinceLastPromotion: number;
    }
): Promise<TurnoverRiskPrediction> {
    // Modelo Preditivo Heurístico Simplificado
    let score = 10; // Risco base
    const factors: string[] = [];

    if (metrics.recentAbsences > 3) {
        score += 30;
        factors.push('Alto índice de absenteísmo recente');
    }
    if (metrics.overtimeHours > 40) {
        score += 25;
        factors.push('Sobrecarga de trabalho (muitas horas extras)');
    }
    if (metrics.monthsSinceLastPromotion > 24) {
        score += 20;
        factors.push('Estagnação de cargo (> 2 anos sem promoção)');
    }
    if (metrics.lastPerformanceScore < 5) {
        score += 15;
        factors.push('Baixo desempenho na última avaliação');
    }

    const riskLevel = score > 60 ? 'Alto' : score > 30 ? 'Médio' : 'Baixo';

    return { employeeId, riskScore: Math.min(score, 100), riskLevel, contributingFactors: factors };
}