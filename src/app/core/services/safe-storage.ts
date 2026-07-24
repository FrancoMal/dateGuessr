/**
 * Escrituras a localStorage que no lanzan excepciones: con el storage
 * bloqueado (Safari con "Bloquear todas las cookies", webviews embebidas)
 * o lleno (QuotaExceededError), la partida sigue funcionando en memoria
 * aunque la persistencia falle. Simétrico al try/catch que ya tienen
 * todas las lecturas de los servicios.
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    // storage inaccesible o lleno → seguir sin persistir
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // storage inaccesible → no hay nada que borrar
  }
}
