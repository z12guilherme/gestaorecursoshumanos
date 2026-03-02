import { describe, it, expect } from 'vitest';
import { payrollExportService, PayrollData } from './payrollExportService';

describe('payrollExportService', () => {
  const mockData: PayrollData[] = [
    {
      name: 'João Silva',
      cpf: '123.456.789-00',
      netSalary: 2500.50,
      pixKey: 'joao@email.com',
      bankCode: '001',
      bankAgency: '1234',
      bankAccount: '56789-0'
    }
  ];

  it('deve gerar CSV corretamente', () => {
    const csv = payrollExportService.generateCSV(mockData);
    expect(csv).toContain('Nome;CPF;Valor Líquido');
    expect(csv).toContain('João Silva;123.456.789-00;2500,50;joao@email.com;001;1234;56789-0');
  });

  it('deve gerar CNAB240 (simulado) com header e trailer', () => {
    const company = { name: 'Minha Empresa', cnpj: '12345678000199', bankCode: '341' };
    const cnab = payrollExportService.generateCNAB240(mockData, company);
    
    const lines = cnab.split('\n');
    expect(lines.length).toBe(3); // Header + 1 Detail + Trailer
    
    // Verifica Header
    expect(lines[0].substring(0, 3)).toBe('341'); // Banco
    expect(lines[0]).toContain('Minha Empresa');
    
    // Verifica Detalhe
    expect(lines[1]).toContain('João Silva');
    expect(lines[1]).toContain('000000000250050'); // Valor formatado (250050 centavos)
    
    // Verifica Trailer (Total de linhas)
    expect(lines[2]).toContain('000003'); 
  });
});
