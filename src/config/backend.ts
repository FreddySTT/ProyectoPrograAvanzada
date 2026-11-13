// ==============================================================================
// Backend Switch — Riqsi Rutas
// Lee la variable de entorno VITE_BACKEND para seleccionar el backend activo.
// Valores posibles: "dual" (default activo-activo) | "supabase" | "firebase"
// ==============================================================================

export type BackendMode = "supabase" | "firebase" | "dual";

/**
 * Backend activo, determinado en tiempo de compilación por la variable de entorno.
 *   VITE_BACKEND=dual       → Replicación concurrente en Supabase y Firestore (Default)
 *   VITE_BACKEND=firebase   → usa Firebase Auth + Firestore exclusivamente
 *   VITE_BACKEND=supabase   → usa Supabase Cloud PostgreSQL exclusivamente
 */
export const BACKEND: BackendMode = (() => {
  const raw = import.meta.env.VITE_BACKEND ?? "dual";
  if (raw === "firebase") return "firebase";
  if (raw === "supabase") return "supabase";
  return "dual";
})();

export const isFirebaseMode = (): boolean => BACKEND === "firebase";
export const isSupabaseMode = (): boolean => BACKEND === "supabase";
export const isDualMode = (): boolean => BACKEND === "dual";

