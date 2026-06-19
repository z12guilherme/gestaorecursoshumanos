export const DEFAULT_APP_NAME = 'Sistema';
export const DEFAULT_EMPLOYEE_PORTAL_NAME = 'Portal do Colaborador';

export function buildAppTitle(companyName?: string | null) {
  return companyName?.trim() ? companyName.trim() : DEFAULT_APP_NAME;
}
