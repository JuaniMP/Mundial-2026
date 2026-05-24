const ROLE_ALIASES: Record<string, string> = {
  ROLE_ADMIN: 'ADMIN',
  ROLE_SUPPORT: 'SOPORTE',
  ROLE_SOPORTE: 'SOPORTE',
  ROLE_COMPLIANCE: 'COMPLIANCE',
  ROLE_OPERATOR: 'OPERADOR',
  ROLE_OPERADOR: 'OPERADOR',
};

export function normalizeRole(role?: string | null): string {
  if (!role) return '';
  const upper = role.toUpperCase();
  return ROLE_ALIASES[upper] ?? upper.replace(/^ROLE_/, '');
}

export function hasRole(role: string | undefined | null, allowedRoles: string[]): boolean {
  const normalized = normalizeRole(role);
  return (
    normalized !== '' && allowedRoles.map((value) => normalizeRole(value)).includes(normalized)
  );
}
