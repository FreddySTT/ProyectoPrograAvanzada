export type Role = "normal" | "admin" | "editor";

export interface User {
  id: string;
  uid?: string;
  username: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: Role;
  status?: "active" | "suspended";
  avatar: string;
  createdAt: string;
  lastLogin?: string;
}

export interface PlaceItem {
  id: string;
  title: string;
  area: string;
  tag: string;
  category: "cultura" | "naturaleza" | "gastronomia" | "aventura";
  image: string;
  rating: string;
  time: string;
  featured?: boolean;
  visible?: boolean;
  coordinates?: [number, number];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  // ── Campos de detalle turístico ───────────────────────────────────────────
  /** Precio en bolivianos (Tarifa por persona, e.g. 85) */
  precio?: number;
  /** Precio en USD (e.g. 12.20) */
  precioUsd?: number;
  /** Texto detallado de precios (e.g. "Teleférico: Bs. 10 · Entrada: Gratuita") */
  precioDetalle?: string;
  /** Horario de visita (e.g. "Martes a Domingo de 08:30 a 19:00") */
  horarioVisita?: string;
  /** Bullet points de qué ver/experimentar */
  descripcionItems?: string[];
  /** Consejo para viajeros (caja rosa) */
  consejo?: string;
  /** Dato histórico / curioso (caja azul) */
  datoHistorico?: string;
  /** Badges adicionales (e.g. ["IMPERDIBLE", "Destacado"]) */
  badges?: string[];
}

export interface Announcement {
  active: boolean;
  badge: string;
  message: string;
  linkText?: string;
  linkUrl?: string;
  updatedAt: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  event:
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "ADMIN_PORTAL_ACCESS"
    | "ADMIN_ELEVATION"
    | "ROLE_UPDATED"
    | "USER_REGISTERED"
    | "USER_SUSPENDED"
    | "USER_ACTIVATED"
    | "PASSWORD_RESET"
    | "PURGE_STORAGE"
    | "STORAGE_MODE_CHANGED"
    | "LOGOUT"
    | "BLOCKED_ATTEMPT";
  userEmail: string;
  role?: string;
  status: "OK" | "WARNING" | "BLOCKED";
  details: string;
}
