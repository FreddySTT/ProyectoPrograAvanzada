import { PokemonType } from "../types/pokemon.types";

export interface TypeColorConfig {
  nameEs: string;
  primary: string;
  secondary: string;
  gradient: string;
  text: string;
  glow: string;
  badgeBg: string;
  icon: string;
}

export const POKEMON_TYPE_COLORS: Record<PokemonType, TypeColorConfig> = {
  normal: {
    nameEs: "Normal",
    primary: "#9298a4",
    secondary: "#6c727e",
    gradient: "linear-gradient(135deg, #a8a77a 0%, #797964 100%)",
    text: "#ffffff",
    glow: "rgba(168, 167, 122, 0.4)",
    badgeBg: "rgba(168, 167, 122, 0.25)",
    icon: "⚪",
  },
  fire: {
    nameEs: "Fuego",
    primary: "#ff5722",
    secondary: "#d84315",
    gradient: "linear-gradient(135deg, #ff6b35 0%, #f72585 100%)",
    text: "#ffffff",
    glow: "rgba(255, 107, 53, 0.5)",
    badgeBg: "rgba(255, 87, 34, 0.25)",
    icon: "🔥",
  },
  water: {
    nameEs: "Agua",
    primary: "#2196f3",
    secondary: "#1565c0",
    gradient: "linear-gradient(135deg, #4cc9f0 0%, #3a0ca3 100%)",
    text: "#ffffff",
    glow: "rgba(76, 201, 240, 0.5)",
    badgeBg: "rgba(33, 150, 243, 0.25)",
    icon: "💧",
  },
  electric: {
    nameEs: "Eléctrico",
    primary: "#ffd600",
    secondary: "#f57f17",
    gradient: "linear-gradient(135deg, #ffee32 0%, #f77f00 100%)",
    text: "#1a1a1a",
    glow: "rgba(255, 238, 50, 0.6)",
    badgeBg: "rgba(255, 214, 0, 0.3)",
    icon: "⚡",
  },
  grass: {
    nameEs: "Planta",
    primary: "#4caf50",
    secondary: "#2e7d32",
    gradient: "linear-gradient(135deg, #52b788 0%, #1b4332 100%)",
    text: "#ffffff",
    glow: "rgba(82, 183, 136, 0.5)",
    badgeBg: "rgba(76, 175, 80, 0.25)",
    icon: "🌿",
  },
  ice: {
    nameEs: "Hielo",
    primary: "#00e5ff",
    secondary: "#00b0ff",
    gradient: "linear-gradient(135deg, #a0c4ff 0%, #00b4d8 100%)",
    text: "#081c24",
    glow: "rgba(160, 196, 255, 0.5)",
    badgeBg: "rgba(0, 229, 255, 0.25)",
    icon: "❄️",
  },
  fighting: {
    nameEs: "Lucha",
    primary: "#c62828",
    secondary: "#8e0000",
    gradient: "linear-gradient(135deg, #c0392b 0%, #7b1113 100%)",
    text: "#ffffff",
    glow: "rgba(192, 57, 43, 0.5)",
    badgeBg: "rgba(198, 40, 40, 0.25)",
    icon: "🥊",
  },
  poison: {
    nameEs: "Veneno",
    primary: "#ab47bc",
    secondary: "#6a1b9a",
    gradient: "linear-gradient(135deg, #b5179e 0%, #480ca8 100%)",
    text: "#ffffff",
    glow: "rgba(181, 23, 158, 0.5)",
    badgeBg: "rgba(171, 71, 188, 0.25)",
    icon: "☠️",
  },
  ground: {
    nameEs: "Tierra",
    primary: "#d4a373",
    secondary: "#8d6e63",
    gradient: "linear-gradient(135deg, #e0a96d 0%, #8c531b 100%)",
    text: "#ffffff",
    glow: "rgba(224, 169, 109, 0.5)",
    badgeBg: "rgba(212, 163, 115, 0.25)",
    icon: "🏜️",
  },
  flying: {
    nameEs: "Volador",
    primary: "#81d4fa",
    secondary: "#4ba3e3",
    gradient: "linear-gradient(135deg, #90e0ef 0%, #5e60ce 100%)",
    text: "#0f172a",
    glow: "rgba(144, 224, 239, 0.5)",
    badgeBg: "rgba(129, 212, 250, 0.25)",
    icon: "🌪️",
  },
  psychic: {
    nameEs: "Psíquico",
    primary: "#f06292",
    secondary: "#ad1457",
    gradient: "linear-gradient(135deg, #ff4d6d 0%, #7209b7 100%)",
    text: "#ffffff",
    glow: "rgba(255, 77, 109, 0.5)",
    badgeBg: "rgba(240, 98, 146, 0.25)",
    icon: "🔮",
  },
  bug: {
    nameEs: "Bicho",
    primary: "#8bc34a",
    secondary: "#558b2f",
    gradient: "linear-gradient(135deg, #9ef01a 0%, #38b000 100%)",
    text: "#0f172a",
    glow: "rgba(158, 240, 26, 0.5)",
    badgeBg: "rgba(139, 195, 74, 0.25)",
    icon: "🐛",
  },
  rock: {
    nameEs: "Roca",
    primary: "#bcaaa4",
    secondary: "#6d4c41",
    gradient: "linear-gradient(135deg, #b08968 0%, #583101 100%)",
    text: "#ffffff",
    glow: "rgba(176, 137, 104, 0.45)",
    badgeBg: "rgba(188, 170, 164, 0.25)",
    icon: "🪨",
  },
  ghost: {
    nameEs: "Fantasma",
    primary: "#7e57c2",
    secondary: "#4527a0",
    gradient: "linear-gradient(135deg, #7b2cbf 0%, #240046 100%)",
    text: "#ffffff",
    glow: "rgba(123, 44, 191, 0.55)",
    badgeBg: "rgba(126, 87, 194, 0.25)",
    icon: "👻",
  },
  dragon: {
    nameEs: "Dragón",
    primary: "#651fff",
    secondary: "#311b92",
    gradient: "linear-gradient(135deg, #5390d9 0%, #4361ee 50%, #7209b7 100%)",
    text: "#ffffff",
    glow: "rgba(101, 31, 255, 0.6)",
    badgeBg: "rgba(101, 31, 255, 0.25)",
    icon: "🐲",
  },
  dark: {
    nameEs: "Siniestro",
    primary: "#37474f",
    secondary: "#212121",
    gradient: "linear-gradient(135deg, #495057 0%, #161a1d 100%)",
    text: "#ffffff",
    glow: "rgba(73, 80, 87, 0.4)",
    badgeBg: "rgba(55, 71, 79, 0.35)",
    icon: "🌑",
  },
  steel: {
    nameEs: "Acero",
    primary: "#78909c",
    secondary: "#455a64",
    gradient: "linear-gradient(135deg, #ced4da 0%, #6c757d 100%)",
    text: "#0f172a",
    glow: "rgba(206, 212, 218, 0.45)",
    badgeBg: "rgba(120, 144, 156, 0.25)",
    icon: "⚙️",
  },
  fairy: {
    nameEs: "Hada",
    primary: "#f48fb1",
    secondary: "#c2185b",
    gradient: "linear-gradient(135deg, #f72585 0%, #ffb3c6 100%)",
    text: "#ffffff",
    glow: "rgba(247, 37, 133, 0.5)",
    badgeBg: "rgba(244, 143, 177, 0.25)",
    icon: "✨",
  },
};

export const ALL_POKEMON_TYPES: PokemonType[] = Object.keys(POKEMON_TYPE_COLORS) as PokemonType[];

export function getPokemonTypeConfig(type?: string): TypeColorConfig {
  if (!type || !(type in POKEMON_TYPE_COLORS)) {
    return POKEMON_TYPE_COLORS.normal;
  }
  return POKEMON_TYPE_COLORS[type as PokemonType];
}
