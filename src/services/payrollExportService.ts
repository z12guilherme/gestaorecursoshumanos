export interface PayrollData {
  name: string;
  cpf: string;
  bankAccount?: string;
  bankAgency?: string;
  bankCode?: string;
  netSalary: number;
  pixKey?: string;
}

export const payrollExportService = {
  /**
   * Gera um arquivo CSV para importação em sistemas contábeis (ex: Contabilidade, ERPs).
   */
  generateCSV(data: PayrollData[]): string {
    const header = ['Nome', 'CPF', 'Valor Líquido', 'Chave PIX', 'Banco', 'Agência', 'Conta'];
    const rows = data.map(item => [
      item.name,
      item.cpf,
      item.netSalary.toFixed(2).replace('.', ','),
      item.pixKey || '',
      item.bankCode || '',
      item.bankAgency || '',
      item.bankAccount || ''
    ]);

    return [
      header.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');
  },

  /**
   * Gera um arquivo de remessa padrão CNAB 240 (Simulado) para pagamento de salários.
   * Nota: Um CNAB real requer validação rigorosa de posições e homologação com o banco específico.
   */
  generateCNAB240(data: PayrollData[], companyInfo: { name: string, cnpj: string, bankCode: string }): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 6).replace(/:/g, '');

    // Header do Arquivo (240 posições - Simplificado para exemplo)
    // Pos 001-003: Banco
    // Pos 004-007: Lote (0000)
    // Pos 008-008: Tipo Registro (0)
    // ...
    const header = [
      companyInfo.bankCode.padEnd(3, '0'),
      '0000',
      '0',
      ''.padEnd(9, ' '),
      '2', // Tipo Inscrição (CNPJ)
      companyInfo.cnpj.replace(/\D/g, '').padEnd(14, '0'),
      companyInfo.name.padEnd(30, ' ').slice(0, 30),
      'PAGAMENTO SALARIOS'.padEnd(30, ' '),
      dateStr,
      timeStr,
      '000001', // Sequencial
      '083', // Versão Layout
      ''.padEnd(87, ' ')
    ].join('');

    // Detalhes (Segmento A - Pagamento)
    const details = data.map((item, index) => {
      const seq = (index + 1).toString().padStart(5, '0');
      const value = Math.round(item.netSalary * 100).toString().padStart(15, '0');
      
      return [
        companyInfo.bankCode.padEnd(3, '0'),
        '0001', // Lote
        '3', // Tipo Registro (Detalhe)
        seq,
        'A', // Segmento
        '000', // Tipo Movimento
        item.bankCode?.padEnd(3, '0') || '000',
        (item.bankAgency || '').replace(/\D/g, '').padEnd(5, '0'),
        (item.bankAccount || '').replace(/\D/g, '').padEnd(12, '0'),
        item.name.padEnd(30, ' ').slice(0, 30),
        item.cpf.replace(/\D/g, '').padEnd(11, '0'),
        value, // Valor em centavos
        ''.padEnd(20, ' ') // Nosso Número / Outros
      ].join('');
    });

    // Trailer do Arquivo
    const trailer = [
      companyInfo.bankCode.padEnd(3, '0'),
      '9999',
      '9',
      ''.padEnd(9, ' '),
      (data.length + 2).toString().padStart(6, '0'), // Qtd Registros (Header + Detalhes + Trailer)
      ''.padEnd(200, ' ')
    ].join('');

    return [header, ...details, trailer].join('\n');
  }
};
