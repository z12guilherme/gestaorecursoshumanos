/**
 * Calcula o crescimento percentual entre dois valores.
 * @param current Valor do período atual
 * @param previous Valor do período anterior
 * @returns A porcentagem de crescimento (ex: 10.5 para 10.5%)
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

/**
 * Formata um valor numérico para moeda BRL.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata um valor percentual.
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
