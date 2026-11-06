// ==============================================================================
// Backend Switch — Riqsi Rutas
// Lee la variable de entorno VITE_BACKEND para seleccionar el backend activo.
// Valores posibles: "supabase" (default) | "firebase"
// ==============================================================================

export type BackendMode = "supabase" | "firebase";

/**
 * Backend activo, determinado en tiempo de compilación por la variable de entorno.
 * Para cambiar en runtime usa el panel de Admin → Configuración o modifica .env:
 *   VITE_BACKEND=firebase   → usa Firebase Auth + Firestore
 *   VITE_BACKEND=supabase   → usa Supabase Cloud (default)
 */
export const BACKEND: BackendMode = (() => {
  const raw = import.meta.env.VITE_BACKEND ?? "supabase";
  return raw === "firebase" ? "firebase" : "supabase";
})();

export const isFirebaseMode = (): boolean => BACKEND === "firebase";
export const isSupabaseMode = (): boolean => BACKEND === "supabase";

