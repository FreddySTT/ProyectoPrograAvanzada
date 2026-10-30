export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(4, "0")}`;
}

export function formatPokemonName(name: string): string {
  if (!name) return "";
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatHeight(decimetres: number): { meters: string; feetInches: string } {
  const meters = (decimetres / 10).toFixed(1);
  const totalInches = (decimetres * 3.937);
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return {
    meters: `${meters} m`,
    feetInches: `${feet}'${inches.toString().padStart(2, "0")}"`,
  };
}

export function formatWeight(hectograms: number): { kilograms: string; pounds: string } {
  const kg = (hectograms / 10).toFixed(1);
  const lbs = (hectograms * 0.220462).toFixed(1);
  return {
    kilograms: `${kg} kg`,
    pounds: `${lbs} lbs`,
  };
}

export const STAT_NAMES_ES: Record<string, { label: string; short: string }> = {
  hp: { label: "Puntos de Salud", short: "PS" },
  attack: { label: "Ataque", short: "ATQ" },
  defense: { label: "Defensa", short: "DEF" },
  "special-attack": { label: "Ataque Especial", short: "ATQ ESP" },
  "special-defense": { label: "Defensa Especial", short: "DEF ESP" },
  speed: { label: "Velocidad", short: "VEL" },
};

export function getStatRatingColor(value: number): string {
  if (value < 50) return "#f87171";
  if (value < 80) return "#fbbf24";
  if (value < 110) return "#34d399";
  if (value < 140) return "#60a5fa";
  return "#c084fc";
}

// 1. Official Artwork
export function getArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getShinyArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
}

// 2. 3D Models (Pokémon HOME)
export function getModel3DUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
}

export function getShinyModel3DUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`;
}

// 3. Showdown / Animated Battle Sprites
export function getAnimatedSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
}

export function getAnimatedShinySpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`;
}

// 4. Retro Pixel Art (Classic 2D Sprites)
export function getRetroPixelUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function getShinyRetroPixelUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
}

// 5. Gen 1 GameBoy Red/Blue Sprite (for original 151)
export function getGen1RetroUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/${id}.png`;
}
