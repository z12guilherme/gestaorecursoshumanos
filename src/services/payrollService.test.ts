import { describe, it, expect } from 'vitest';
import { calculateINSS, calculatePayroll } from './payrollService';

describe('payrollService - calculateINSS', () => {
  it('deve calcular INSS progressivo corretamente', () => {
    // Para salário de R$ 1500 (dentro da primeira faixa de 7.5%)
    // 1500 * 0.075 = 112.50
    expect(calculateINSS(1500)).toBeCloseTo(112.50, 2);

    // Para salário de R$ 2500:
    // Faixa 1: 1621 * 0.075 = 121.575
    // Faixa 2: (2500 - 1621) * 0.09 = 879 * 0.09 = 79.11
    // Total = 121.575 + 79.11 = 200.685 -> ~200.69
    expect(calculateINSS(2500)).toBeCloseTo(200.69, 2);
  });
});

describe('payrollService - calculatePayroll', () => {
  it('deve calcular folha básica sem adicionais ou descontos extras', () => {
    const employee = {
      baseSalary: 2000,
      contractedHours: 200,
      hasInsalubrity: false,
      hasNightShift: false,
      fixedDiscounts: 0
    };

    const result = calculatePayroll(employee, 0);
    expect(result.baseSalary).toBe(2000);
    expect(result.insalubrity).toBe(0);
    expect(result.nightShift).toBe(0);
    expect(result.overtimeValue).toBe(0);
    expect(result.estimatedTax).toBeCloseTo(calculateINSS(2000), 2);
    expect(result.netSalary).toBeCloseTo(2000 - result.estimatedTax, 2);
  });

  it('deve incluir adicionais de insalubridade e adicional noturno', () => {
    const employee = {
      baseSalary: 3000,
      contractedHours: 220,
      hasInsalubrity: true,
      insalubrity_amount: 282.40,
      hasNightShift: true,
      night_shift_amount: 150.00
    };

    const result = calculatePayroll(employee, 0);
    expect(result.insalubrity).toBe(282.40);
    expect(result.nightShift).toBe(150.00);
    expect(result.estimatedTax).toBeCloseTo(calculateINSS(3000 + 282.40 + 150.00), 2);
  });

  it('deve calcular horas extras com acréscimo de 50%', () => {
    const employee = {
      baseSalary: 2200,
      contractedHours: 220 // valor da hora = R$ 10
    };

    // 10 horas extras: 10 * 10 * 1.5 = R$ 150
    const result = calculatePayroll(employee, 10);
    expect(result.overtimeValue).toBe(150);
  });

  it('deve aplicar desconto de INSS como zero para Terceirizados ou PJ', () => {
    const employee = {
      baseSalary: 5000,
      contract_type: 'PJ'
    };

    const result = calculatePayroll(employee, 0);
    expect(result.estimatedTax).toBe(0);
  });

  it('deve usar valor de INSS manual se estiver preenchido no colaborador', () => {
    const employee = {
      baseSalary: 4000,
      inss_value: 350.50
    };

    const result = calculatePayroll(employee, 0);
    expect(result.estimatedTax).toBe(350.50);
  });
});
