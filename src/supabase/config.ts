import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Clave ofuscada en sessionStorage para configuración en caliente
const SESSION_CONFIG_KEY = "_rq_sb_cfg";

// Limpiar residuo legado en localStorage de inmediato
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("riqsi_supabase_custom_config_v1");
  } catch {}
}

const envConfig: Partial<SupabaseConfig> = {
  url: import.meta.env.VITE_SUPABASE_URL || "",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
};

let inMemoryCustomConfig: SupabaseConfig | null = null;

// Cargar desde sessionStorage al iniciar
if (typeof window !== "undefined") {
  try {
    const raw = sessionStorage.getItem(SESSION_CONFIG_KEY);
    if (raw) {
      // Formato simple codificado en base64 para evitar texto plano directo
      const decoded = atob(raw);
      inMemoryCustomConfig = JSON.parse(decoded);
    }
  } catch {
    inMemoryCustomConfig = null;
  }
}

export function getSavedSupabaseConfig(): SupabaseConfig | null {
  return inMemoryCustomConfig;
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  inMemoryCustomConfig = config;
  supabaseInstance = null; // Reiniciar instancia para reconectar
  if (typeof window !== "undefined") {
    try {
      const encoded = btoa(JSON.stringify(config));
      sessionStorage.setItem(SESSION_CONFIG_KEY, encoded);
    } catch (e) {
      console.warn("No se pudo guardar la configuración temporal en sessionStorage", e);
    }
  }
}

export function clearCustomSupabaseConfig() {
  inMemoryCustomConfig = null;
  supabaseInstance = null;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(SESSION_CONFIG_KEY);
    } catch {}
  }
}

export function getActiveSupabaseConfig(): SupabaseConfig {
  if (inMemoryCustomConfig && inMemoryCustomConfig.url && inMemoryCustomConfig.anonKey) {
    return inMemoryCustomConfig;
  }

  return {
    url: envConfig.url || "",
    anonKey: envConfig.anonKey || "",
  };
}

export function isSupabaseConfigured(): boolean {
  const config = getActiveSupabaseConfig();
  return Boolean(config.url && config.anonKey && config.url.includes("supabase.co"));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getActiveSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false, // Seguridad reforzada: no persistir sesiones en localStorage
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (error) {
    console.warn("No se pudo inicializar Supabase (usando modo fallback local):", error);
    return null;
  }
}

export const supabase = getSupabaseClient();
