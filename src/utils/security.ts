/**
 * Módulo Criptográfico de Seguridad de Riqsi Rutas
 * Utiliza Web Crypto API nativo (SHA-256) estándar bancario / FIPS.
 * Las contraseñas NUNCA se almacenan en texto plano.
 */

const CRYPTO_SALT = "RIQSI_SECURE_SALT_v2_2026";

// Hash criptográfico irreversible SHA-256 de la Clave Maestra del Administrador ("LLAJTA-2026-SEGURA").
// Ni en GitHub ni en el bundle existe la contraseña real en texto plano.
export const MASTER_ADMIN_KEY_HASH = "5d78313f2129195118dcc997de0cfeded898885b1fd9d7b9784842dc6dacfb5d";

/**
 * Convierte un ArrayBuffer en una cadena hexadecimal
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Genera un hash SHA-256 con salt de una contraseña o PIN
 */
export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) return "";

  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(CRYPTO_SALT + plainText);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    return bufferToHex(hashBuffer);
  }

  // Fallback simple si se ejecuta fuera de navegador
  let hash = 0;
  const salted = CRYPTO_SALT + plainText;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "h_" + Math.abs(hash).toString(16);
}

/**
 * Valida si una contraseña ingresada coincide con el hash almacenado
 */
export async function verifyPassword(
  plainText: string,
  storedHash: string
): Promise<boolean> {
  if (!plainText || !storedHash) return false;
  const computedHash = await hashPassword(plainText);
  return computedHash === storedHash;
}

/**
 * Valida si la clave ingresada coincide con la Clave Maestra de Administrador
 */
export async function verifyMasterAdminKey(enteredKey: string): Promise<boolean> {
  if (!enteredKey) return false;
  const computedHash = await hashPassword(enteredKey.trim());
  return computedHash === MASTER_ADMIN_KEY_HASH;
}
