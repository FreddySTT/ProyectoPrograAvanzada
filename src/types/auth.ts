export type Role = "normal" | "admin";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar: string;
  createdAt: string;
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
}

export interface Announcement {
  active: boolean;
  badge: string;
  message: string;
  linkText?: string;
  linkUrl?: string;
  updatedAt: string;
}
