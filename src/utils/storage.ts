/**
 * ZeroStorage — Motor de Almacenamiento Cero-Disco (Pure In-Memory RAM)
 *
 * MÁXIMA SEGURIDAD:
 * 1. NADA se escribe en localStorage ni sessionStorage.
 * 2. Cualquier intento de inspeccionar "DevTools -> LocalStorage" mostrará 0 elementos.
 * 3. Las credenciales, hashes de contraseñas y datos sensibles NUNCA tocan el disco del navegador.
 * 4. La persistencia real reside exclusivamente en la nube protegida de Supabase Cloud.
 */

// Limpieza agresiva e inmediata al importar el módulo: destruir cualquier rastro existente
if (typeof window !== "undefined") {
  try {
    if (window.localStorage) {
      window.localStorage.clear();
      // Neutralizar setItem para bloquear cualquier escritura
      window.localStorage.setItem = () => {};
    }
    if (window.sessionStorage) {
      window.sessionStorage.clear();
      window.sessionStorage.setItem = () => {};
    }
  } catch {}
}

const memoryStore = new Map<string, unknown>();

export type StorageMode = "memory-only";

export function getStorageMode(): StorageMode {
  return "memory-only";
}

export function setStorageMode(_mode: StorageMode): void {
  // Siempre memoria pura
}

/**
 * Guarda exclusivamente en memoria RAM del navegador.
 * CERO escritura en localStorage.
 */
export async function secureSet(key: string, value: unknown): Promise<void> {
  memoryStore.set(key, value);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } catch {}
  }
}

/**
 * Lee exclusivamente desde la memoria RAM del navegador.
 */
export async function secureGet<T = unknown>(key: string): Promise<T | null> {
  if (memoryStore.has(key)) {
    return memoryStore.get(key) as T;
  }
  return null;
}

/**
 * Elimina de memoria RAM y asegura que localStorage quede vacío.
 */
export async function secureRemove(key: string): Promise<void> {
  memoryStore.delete(key);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } catch {}
  }
}

/**
 * Purgado completo: vacía la RAM y destruye todo localStorage y sessionStorage.
 */
export function purgeAllLocalStorage(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch {}
  }
}

export function purgeAllStorage(): void {
  memoryStore.clear();
  purgeAllLocalStorage();
}

export function purgeLegacyPlaintext(): void {
  purgeAllLocalStorage();
}

// Ejecutar purga inmediata
if (typeof window !== "undefined") {
  purgeAllLocalStorage();
}
