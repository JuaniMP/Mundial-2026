/**
 * Utilidades para que el estado local (monedas, sobres, misiones del álbum)
 * no se mezcle entre usuarios distintos.
 *
 * La sesión (token/usuario) vive en sessionStorage —independiente por pestaña—,
 * pero el estado de juego del álbum se guarda en localStorage para que persista.
 * Para que ese estado no sea compartido entre cuentas, cada clave se sufija
 * con un identificador único del usuario actual, derivado del JWT en sesión.
 */

/** Identificador único del usuario logueado (subject/email del JWT). */
export function currentUserKey(): string {
  const token = sessionStorage.getItem('token');
  if (!token || !token.includes('.')) return 'anon';
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as Record<string, unknown>;
    return String(payload.sub ?? payload.email ?? payload.id ?? 'anon');
  } catch {
    return 'anon';
  }
}

/** Devuelve la clave de almacenamiento sufijada por usuario. */
export function scopedKey(base: string): string {
  return `${base}::${currentUserKey()}`;
}
