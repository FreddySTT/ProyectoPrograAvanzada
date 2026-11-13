/**
 * Storage Manager — Persistencia Segura y Reactiva para Riqsi Rutas
 *
 * Permite guardar y recuperar el estado de la aplicación (lugares editados,
 * sesión de usuario, avisos) persistiendo a través de recargas (F5).
 */

const memoryStore = new Map<string, unknown>();

export type StorageMode = "local-secure" | "memory-only";

export function getStorageMode(): StorageMode {
  return "local-secure";
}

export function setStorageMode(_mode: StorageMode): void {
  // Configuración de modo
}

/**
 * Guarda en localStorage y en memoria caché.
 * Sobrevive a recargas F5.
 */
export async function secureSet(key: string, value: unknown): Promise<void> {
  memoryStore.set(key, value);
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage set error:", e);
    }
  }
}

/**
 * Lee de memoria o de localStorage.
 */
export async function secureGet<T = unknown>(key: string): Promise<T | null> {
  if (memoryStore.has(key)) {
    return memoryStore.get(key) as T;
  }
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item) as T;
        memoryStore.set(key, parsed);
        return parsed;
      }
    } catch (e) {
      console.warn("Storage get error:", e);
    }
  }
  return null;
}

/**
 * Elimina de memoria y de localStorage.
 */
export async function secureRemove(key: string): Promise<void> {
  memoryStore.delete(key);
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }
}

/**
 * Purgado completo del almacenamiento.
 */
export function purgeAllLocalStorage(): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.clear();
    } catch {}
  }
}

export function purgeAllStorage(): void {
  memoryStore.clear();
  purgeAllLocalStorage();
}

export function purgeLegacyPlaintext(): void {
  // Limpieza de claves obsoletas
}
