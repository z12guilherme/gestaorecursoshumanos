export interface InssRange {
  limit: number;
  rate: number;
}

export const DEFAULT_INSS_TABLE: InssRange[] = [
  { limit: 1621.00, rate: 0.075 },
  { limit: 2902.84, rate: 0.09 },
  { limit: 4354.27, rate: 0.12 },
  { limit: 8475.55, rate: 0.14 }
];

/**
 * Cálculo progressivo do INSS baseado na tabela de faixas.
 */
export function calculateINSS(grossSalary: number, inssTable: InssRange[] = DEFAULT_INSS_TABLE): number {
  let discount = 0;
  let previousLimit = 0;

  for (const range of inssTable) {
    if (grossSalary > previousLimit) {
      // Calcula a parcela do salário que cai nesta faixa
      const salaryInThisRange = Math.min(grossSalary, range.limit) - previousLimit;
      discount += salaryInThisRange * range.rate;
      previousLimit = range.limit;
    } else {
      break;
    }
  }

  return discount;
}

/**
 * Realiza o cálculo completo da folha de pagamento para um colaborador.
 * Suporta propriedades em camelCase e snake_case.
 */
export function calculatePayroll(
  employee: any,
  overtimeHours: number = 0,
  inssTable: InssRange[] = DEFAULT_INSS_TABLE
) {
  const baseSalary = Number(employee.baseSalary !== undefined ? employee.baseSalary : employee.base_salary) || 0;
  const hours = Number(employee.contractedHours !== undefined ? employee.contractedHours : employee.contracted_hours) || 220;
  const hourlyRate = hours > 0 ? baseSalary / hours : 0;

  // Adicionais
  const insalubrity = (employee.hasInsalubrity || employee.has_insalubrity) ? (Number(employee.insalubrity_amount) || 0) : 0;
  const nightShift = (employee.hasNightShift || employee.has_night_shift) ? (Number(employee.night_shift_amount) || 0) : 0;

  // Horas Extras (50% de acréscimo)
  const overtimeValue = overtimeHours * hourlyRate * 1.5;

  // Adicionais Variáveis
  let variableAdditionsTotal = 0;
  try {
    const additions = Array.isArray(employee.variable_additions)
      ? employee.variable_additions
      : typeof employee.variable_additions === 'string'
      ? JSON.parse(employee.variable_additions || '[]')
      : [];
    variableAdditionsTotal = additions.reduce((acc: number, curr: any) => {
      let val = Number(curr.value);
      if (isNaN(val) && typeof curr.value === 'string') {
        val = Number(curr.value.replace(',', '.'));
      }
      return acc + (val || 0);
    }, 0);
  } catch (e) {
    variableAdditionsTotal = 0;
  }

  const totalAdditions = insalubrity + nightShift + overtimeValue + variableAdditionsTotal;

  // Descontos Variáveis
  let variableDiscountsTotal = 0;
  try {
    const vDiscounts = Array.isArray(employee.variable_discounts)
      ? employee.variable_discounts
      : typeof employee.variable_discounts === 'string'
      ? JSON.parse(employee.variable_discounts || '[]')
      : [];
    variableDiscountsTotal = vDiscounts.reduce((acc: number, curr: any) => {
      let val = Number(curr.value !== undefined ? curr.value : curr.amount);
      if (isNaN(val) && typeof (curr.value !== undefined ? curr.value : curr.amount) === 'string') {
        const valStr = String(curr.value !== undefined ? curr.value : curr.amount).replace(',', '.');
        val = Number(valStr);
      }
      return acc + (val || 0);
    }, 0);
  } catch (e) {
    variableDiscountsTotal = 0;
  }

  // Descontos (Fixos + Variáveis)
  const fixedDiscounts = Number(employee.fixedDiscounts !== undefined ? employee.fixedDiscounts : employee.fixed_discounts) || 0;
  const discounts = fixedDiscounts + variableDiscountsTotal;

  // Base de Cálculo do INSS (Salário Base + Adicionais)
  const inssBase = baseSalary + totalAdditions;

  const hasManualInss = employee.inss_value !== undefined && employee.inss_value !== null;
  let manualInss = 0;
  if (hasManualInss) {
    const valStr = String(employee.inss_value).replace(',', '.');
    manualInss = Number(valStr) || 0;
  }

  const contractType = employee.contractType || employee.contract_type || '';
  const isOutsourced = contractType === 'Terceirizado' || contractType === 'PJ';
  const estimatedTax = hasManualInss ? manualInss : (isOutsourced ? 0 : calculateINSS(inssBase, inssTable));

  const totalDiscounts = discounts + estimatedTax;
  const netSalary = baseSalary + totalAdditions - totalDiscounts;

  return {
    baseSalary,
    insalubrity,
    nightShift,
    overtimeValue,
    totalDiscounts,
    netSalary,
    estimatedTax
  };
}
