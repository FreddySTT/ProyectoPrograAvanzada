import heroImage from "../assets/cochabamba-hero.jpg";
import adventureBikeImage from "../assets/aventura-bici.jpg";
import cultureDanceImage from "../assets/cultura-danza.jpg";
import foodImage from "../assets/gastronomia.jpg";
import foodTraditionalImage from "../assets/comida-tradicional.jpg";
import heritageImage from "../assets/patrimonio.jpg";
import natureValleyImage from "../assets/naturaleza-valle.jpg";
import tunariImage from "../assets/tunari.jpg";
import type { PlaceItem, User, Announcement } from "../types/auth";

export const INITIAL_USERS: User[] = [
  {
    id: "usr-admin-1",
    username: "admin",
    name: "Freddy (Administrador)",
    email: "admin@riqsirutas.bo",
    password: "admin",
    role: "admin",
    avatar: "👑",
    createdAt: "2026-09-01",
  },
  {
    id: "usr-turista-1",
    username: "turista",
    name: "Carlos Viajero",
    email: "carlos@gmail.com",
    password: "123",
    role: "normal",
    avatar: "🎒",
    createdAt: "2026-09-15",
  },
  {
    id: "usr-turista-2",
    username: "camila",
    name: "Camila Lara",
    email: "camila@unifranz.edu.bo",
    password: "123",
    role: "normal",
    avatar: "🌸",
    createdAt: "2026-10-02",
  },
];

export const INITIAL_PLACES: PlaceItem[] = [
  {
    id: "place-1",
    title: "Cristo de la Concordia",
    area: "Cerro San Pedro",
    tag: "Imperdible",
    category: "cultura",
    image: heroImage,
    rating: "4.8",
    time: "2–3 h",
    featured: true,
    visible: true,
  },
  {
    id: "place-2",
    title: "Palacio Portales",
    area: "Queru Queru",
    tag: "Cultura",
    category: "cultura",
    image: heritageImage,
    rating: "4.7",
    time: "1–2 h",
    featured: false,
    visible: true,
  },
  {
    id: "place-3",
    title: "Parque Nacional Tunari",
    area: "Cordillera",
    tag: "Naturaleza",
    category: "naturaleza",
    image: tunariImage,
    rating: "4.9",
    time: "Día completo",
    featured: true,
    visible: true,
  },
  {
    id: "place-4",
    title: "Mercado La Cancha & Sabores",
    area: "La Cancha",
    tag: "Gastronomía",
    category: "gastronomia",
    image: foodImage,
    rating: "4.9",
    time: "2 h",
    featured: true,
    visible: true,
  },
  {
    id: "place-5",
    title: "Valle de las Ánimas",
    area: "Tiquipaya",
    tag: "Naturaleza",
    category: "naturaleza",
    image: natureValleyImage,
    rating: "4.8",
    time: "4–5 h",
    featured: false,
    visible: true,
  },
  {
    id: "place-6",
    title: "Ruta del Silpancho y Pique",
    area: "El Prado y Cala Cala",
    tag: "Gastronomía",
    category: "gastronomia",
    image: foodTraditionalImage,
    rating: "5.0",
    time: "3 h",
    featured: true,
    visible: true,
  },
  {
    id: "place-7",
    title: "Danzas y Tradición Viva",
    area: "Centro Histórico",
    tag: "Tradición",
    category: "cultura",
    image: cultureDanceImage,
    rating: "4.9",
    time: "Medio día",
    featured: false,
    visible: true,
  },
  {
    id: "place-8",
    title: "Travesía en Bici por los Valles",
    area: "Valle Alto",
    tag: "Aventura",
    category: "aventura",
    image: adventureBikeImage,
    rating: "4.8",
    time: "4 h",
    featured: false,
    visible: true,
  },
];

export const INITIAL_ANNOUNCEMENT: Announcement = {
  active: true,
  badge: "COMUNICADO OFICIAL",
  message: "¡Bienvenidos a la Llajta! Conoce las nuevas rutas ecoturísticas y gastronómicas de Cochabamba.",
  linkText: "Ver novedades",
  updatedAt: "2026-10-08",
};

export const AVAILABLE_PHOTO_PRESETS = [
  { name: "Cristo de la Concordia (Hero)", url: heroImage },
  { name: "Palacio Portales (Patrimonio)", url: heritageImage },
  { name: "Cordillera del Tunari", url: tunariImage },
  { name: "Mercado La Cancha", url: foodImage },
  { name: "Valle de Tiquipaya", url: natureValleyImage },
  { name: "Platos Típicos / Pique Macho", url: foodTraditionalImage },
  { name: "Danza y Tradición", url: cultureDanceImage },
  { name: "Ciclismo Valle Alto", url: adventureBikeImage },
];
