import { PlaceItem, Announcement, User, SecurityLog, Role } from "../types/auth";
import { INITIAL_PLACES, INITIAL_USERS } from "../data/initialData";
import { getSupabaseClient, isSupabaseConfigured } from "./config";
import { secureGet, secureSet } from "../utils/storage";

const LOCAL_PLACES_KEY = "riqsi_places_v2";
const LOCAL_USERS_KEY = "riqsi_users_v2";
const LOCAL_ANNOUNCEMENTS_KEY = "riqsi_announcements_v2";
const LOCAL_LOGS_KEY = "riqsi_security_audit_logs_v2";

export const DEFAULT_ANNOUNCEMENT: Announcement = {
  active: true,
  badge: "COCHABAMBA 2026",
  message: "Ruta del Bicentenario activa. Optimización de trayectos con Supabase Cloud DB.",
  linkText: "Ver Detalles",
  linkUrl: "#rutas",
  updatedAt: "2026-10-16",
};

// ==========================================
// 1. PLACES (Lugares Turísticos)
// ==========================================

export async function fetchPlaces(): Promise<PlaceItem[]> {
  const supabase = getSupabaseClient();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database columns if snake_case
        const mapped: PlaceItem[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          area: d.area,
          tag: d.tag,
          category: d.category,
          image:
            (d.image && (d.image.startsWith("http") || d.image.startsWith("data:") || d.image.startsWith("/assets")))
              ? d.image
              : (INITIAL_PLACES.find((p) => p.id === d.id)?.image || d.image),
          rating: d.rating || "4.8",
          time: d.time,
          featured: d.featured,
          visible: d.visible,
          createdAt: d.created_at || d.createdAt,
          updatedAt: d.updated_at || d.updatedAt,
          createdBy: d.created_by || d.createdBy,
        }));
        await saveLocalPlaces(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn("Fallo al consultar Supabase places, usando fallback local:", e);
    }
  }

  return getLocalPlaces();
}

export async function getLocalPlaces(): Promise<PlaceItem[]> {
  const data = await secureGet<PlaceItem[]>(LOCAL_PLACES_KEY);
  return data ?? INITIAL_PLACES;
}

export async function saveLocalPlaces(places: PlaceItem[]): Promise<void> {
  await secureSet(LOCAL_PLACES_KEY, places);
}

export async function savePlace(place: PlaceItem): Promise<boolean> {
  const local = await getLocalPlaces();
  const exists = local.some((p) => p.id === place.id);
  const updated = exists
    ? local.map((p) => (p.id === place.id ? place : p))
    : [place, ...local];
  await saveLocalPlaces(updated);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbPayload = {
        id: place.id,
        title: place.title,
        area: place.area,
        tag: place.tag,
        category: place.category,
        image: place.image,
        rating: place.rating,
        time: place.time,
        featured: place.featured ?? false,
        visible: place.visible ?? true,
        created_at: place.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await supabase.from("places").upsert(dbPayload);
    } catch (e) {
      console.warn("Error upserting place to Supabase:", e);
    }
  }

  return true;
}

export async function deletePlace(id: string): Promise<boolean> {
  const local = (await getLocalPlaces()).filter((p) => p.id !== id);
  await saveLocalPlaces(local);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("places").delete().eq("id", id);
    } catch (e) {
      console.warn("Error deleting place from Supabase:", e);
    }
  }

  return true;
}

// ==========================================
// 2. ANNOUNCEMENTS (Avisos de Administración)
// ==========================================

export async function fetchAnnouncements(): Promise<Announcement> {
  const supabase = getSupabaseClient();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .limit(1)
        .single();

      if (!error && data) {
        const mapped: Announcement = {
          active: data.active,
          badge: data.badge,
          message: data.message,
          linkText: data.link_text || data.linkText,
          linkUrl: data.link_url || data.linkUrl,
          updatedAt: data.updated_at || data.updatedAt,
        };
        await saveLocalAnnouncement(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn("Fallback local para announcement:", e);
    }
  }

  return getLocalAnnouncement();
}

export async function getLocalAnnouncement(): Promise<Announcement> {
  const data = await secureGet<Announcement>(LOCAL_ANNOUNCEMENTS_KEY);
  return data ?? DEFAULT_ANNOUNCEMENT;
}

export async function saveLocalAnnouncement(ann: Announcement): Promise<void> {
  await secureSet(LOCAL_ANNOUNCEMENTS_KEY, ann);
}

export async function updateAnnouncements(ann: Announcement): Promise<boolean> {
  await saveLocalAnnouncement(ann);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("announcements").upsert({
        id: "global-banner-1",
        active: ann.active,
        badge: ann.badge,
        message: ann.message,
        link_text: ann.linkText || "",
        link_url: ann.linkUrl || "",
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Error saving announcement to Supabase:", e);
    }
  }

  return true;
}

// ==========================================
// 3. USERS (Gestión de Usuarios Cifrados)
// ==========================================

export async function fetchUsers(): Promise<User[]> {
  const supabase = getSupabaseClient();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("app_users")
        .select("id, username, name, email, password_hash, role, status, avatar, created_at, last_login")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: User[] = data.map((d: any) => ({
          id: d.id,
          username: d.username,
          name: d.name,
          email: d.email,
          passwordHash: d.password_hash || d.passwordHash,
          role: d.role as Role,
          status: (d.status as "active" | "suspended") || "active",
          avatar: d.avatar || "🎒",
          createdAt: d.created_at || d.createdAt,
          lastLogin: d.last_login || d.lastLogin,
        }));
        await saveLocalUsers(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn("Fallback local para users:", e);
    }
  }

  return getLocalUsers();
}

export async function getLocalUsers(): Promise<User[]> {
  const data = await secureGet<User[]>(LOCAL_USERS_KEY);
  return data ?? INITIAL_USERS;
}

export async function saveLocalUsers(users: User[]): Promise<void> {
  await secureSet(LOCAL_USERS_KEY, users);
}

export async function saveUserToDatabase(user: User): Promise<boolean> {
  const local = await getLocalUsers();
  const exists = local.some((u) => u.id === user.id);
  const updated = exists
    ? local.map((u) => (u.id === user.id ? user : u))
    : [user, ...local];
  await saveLocalUsers(updated);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("app_users").upsert({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        password_hash: user.passwordHash || "",
        role: user.role,
        status: user.status || "active",
        avatar: user.avatar,
        created_at: user.createdAt,
        last_login: user.lastLogin || new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Error saving user to Supabase:", e);
    }
  }

  return true;
}

export async function updateUserRoleInDatabase(id: string, role: Role): Promise<boolean> {
  const local = (await getLocalUsers()).map((u) => (u.id === id ? { ...u, role } : u));
  await saveLocalUsers(local);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("app_users").update({ role }).eq("id", id);
    } catch (e) {
      console.warn("Error updating user role in Supabase:", e);
    }
  }

  return true;
}

export async function updateUserStatusInDatabase(id: string, status: "active" | "suspended"): Promise<boolean> {
  const local = (await getLocalUsers()).map((u) => (u.id === id ? { ...u, status } : u));
  await saveLocalUsers(local);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("app_users").update({ status }).eq("id", id);
    } catch (e) {
      console.warn("Error updating user status in Supabase:", e);
    }
  }

  return true;
}

export async function resetUserPasswordInDatabase(id: string, newPasswordHash: string): Promise<boolean> {
  const local = (await getLocalUsers()).map((u) => (u.id === id ? { ...u, passwordHash: newPasswordHash } : u));
  await saveLocalUsers(local);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("app_users").update({ password_hash: newPasswordHash }).eq("id", id);
    } catch (e) {
      console.warn("Error resetting password in Supabase:", e);
    }
  }

  return true;
}

export async function getSecurityMetrics() {
  const users = await getLocalUsers();
  const places = await getLocalPlaces();
  const logs = await getStoredSecurityLogs();

  return {
    totalUsers: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    editors: users.filter((u) => u.role === "editor").length,
    activePlaces: places.filter((p) => p.visible !== false).length,
    securityIncidents: logs.filter((l) => l.status === "BLOCKED" || l.status === "WARNING").length,
  };
}

export async function deleteUserFromDatabase(id: string): Promise<boolean> {
  const local = (await getLocalUsers()).filter((u) => u.id !== id);
  await saveLocalUsers(local);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("app_users").delete().eq("id", id);
    } catch (e) {
      console.warn("Error deleting user from Supabase:", e);
    }
  }

  return true;
}

// ==========================================
// 4. SECURITY AUDIT LOGS
// ==========================================

export async function logSecurityEvent(log: Omit<SecurityLog, "id" | "timestamp">): Promise<void> {
  const fullLog: SecurityLog = {
    ...log,
    id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = (await secureGet<SecurityLog[]>(LOCAL_LOGS_KEY)) ?? [];
    const updated = [fullLog, ...existing].slice(0, 100);
    await secureSet(LOCAL_LOGS_KEY, updated);
  } catch (e) {
    console.error("Error saving encrypted log", e);
  }

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("security_logs").insert({
        id: fullLog.id,
        event: fullLog.event,
        user_email: fullLog.userEmail,
        role: fullLog.role || "",
        status: fullLog.status,
        details: fullLog.details,
        timestamp: fullLog.timestamp,
      });
    } catch (e) {
      // Ignorar silenciosamente si no hay conexión
    }
  }
}

export async function getStoredSecurityLogs(): Promise<SecurityLog[]> {
  return (await secureGet<SecurityLog[]>(LOCAL_LOGS_KEY)) ?? [];
}

// ==========================================
// 5. JSON IMPORT / EXPORT ENGINE
// ==========================================

export async function exportDatabaseToJson(): Promise<string> {
  const places = await fetchPlaces();
  const announcements = await fetchAnnouncements();
  const users = await fetchUsers();
  const logs = getStoredSecurityLogs();

  // Remove any sensitive cryptographic hashes from public export
  const sanitizedUsers = users.map((u) => {
    const { passwordHash, ...rest } = u;
    return rest;
  });

  const bundle = {
    metadata: {
      exportedAt: new Date().toISOString(),
      platform: "Riqsi Rutas Cochabamba",
      backend: "Supabase Cloud DB",
      version: "2.0.0",
    },
    places,
    announcements,
    users: sanitizedUsers,
    securityLogs: logs,
  };

  return JSON.stringify(bundle, null, 2);
}

export async function importDatabaseFromJson(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const parsed = JSON.parse(jsonString);

    if (parsed.places && Array.isArray(parsed.places)) {
      saveLocalPlaces(parsed.places);
      const supabase = getSupabaseClient();
      if (isSupabaseConfigured() && supabase) {
        for (const p of parsed.places) {
          await supabase.from("places").upsert(p);
        }
      }
    }

    if (parsed.announcements) {
      await updateAnnouncements(parsed.announcements);
    }

    return {
      success: true,
      message: `Base de datos importada con éxito: ${parsed.places?.length || 0} lugares actualizados.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: "Error al importar JSON: " + (err.message || "Estructura no válida"),
    };
  }
}

// ==========================================
// 6. SUBSCRIBE-STYLE WRAPPERS (Supabase Realtime / Polling)
//    These replace Firebase onSnapshot listeners.
// ==========================================

/** Alias: saveAnnouncement → updateAnnouncements */
export const saveAnnouncement = updateAnnouncements;

/**
 * Subscribe to places changes.
 * Returns an unsubscribe function (clears interval or Supabase channel).
 */
export function subscribeToPlaces(callback: (places: PlaceItem[]) => void): () => void {
  // Initial load
  fetchPlaces().then((places) => callback(places));

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    const channel = (supabase as any)
      .channel("places-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "places" },
        async () => {
          const refreshed = await fetchPlaces();
          callback(refreshed);
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }

  // Fallback: poll every 30 seconds when offline
  const interval = setInterval(async () => {
    const places = await fetchPlaces();
    callback(places);
  }, 30_000);

  return () => clearInterval(interval);
}

/**
 * Subscribe to announcement changes.
 * Returns an unsubscribe function.
 */
export function subscribeToAnnouncement(callback: (ann: Announcement) => void): () => void {
  // Initial load
  fetchAnnouncements().then((ann) => callback(ann));

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    const channel = (supabase as any)
      .channel("announcements-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        async () => {
          const refreshed = await fetchAnnouncements();
          callback(refreshed);
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }

  // Fallback: poll every 30 seconds when offline
  const interval = setInterval(async () => {
    const ann = await fetchAnnouncements();
    callback(ann);
  }, 30_000);

  return () => clearInterval(interval);
}
