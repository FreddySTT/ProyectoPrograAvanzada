export type Role = "normal" | "admin";

export interface User {
  id: string;
  uid?: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
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
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
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
  event: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "ADMIN_PORTAL_ACCESS" | "ADMIN_ELEVATION" | "ROLE_UPDATED" | "LOGOUT" | "BLOCKED_ATTEMPT";
  userEmail: string;
  role?: string;
  status: "OK" | "WARNING" | "BLOCKED";
  details: string;
}
