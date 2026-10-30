export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export interface PokemonListItem {
  id: number;
  name: string;
  url: string;
  formattedId: string;
  artwork: string;
  sprite: string;
  animatedSprite: string;
  types?: PokemonType[];
}

export interface PokemonStat {
  name: "hp" | "attack" | "defense" | "special-attack" | "special-defense" | "speed";
  baseStat: number;
  effort: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
  slot: number;
  effect?: string;
  shortEffect?: string;
}

export interface PokemonCry {
  latest?: string;
  legacy?: string;
}

export interface PokemonEvolutionNode {
  id: number;
  name: string;
  image: string;
  minLevel?: number | null;
  trigger?: string | null;
  item?: string | null;
  evolvesTo: PokemonEvolutionNode[];
}

export interface PokemonSpriteCollection {
  officialArtwork: string;
  officialArtworkShiny: string;
  model3D: string;
  model3DShiny: string;
  animatedBattle: string;
  animatedBattleShiny: string;
  pixelRetro: string;
  pixelRetroShiny: string;
  gen1Retro?: string;
}

export type VarietyCategory = "mega" | "alola" | "galar" | "hisui" | "paldea" | "gmax" | "alternate";

export interface PokemonVariety {
  id: number;
  name: string;
  displayName: string;
  isDefault: boolean;
  category: VarietyCategory;
  artwork: string;
  types?: PokemonType[];
  stats?: PokemonStat[];
  abilities?: PokemonAbility[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  formattedId: string;
  height: number;
  weight: number;
  baseExperience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  cries: PokemonCry;
  sprites: PokemonSpriteCollection;
  species: {
    name: string;
    genus: string;
    flavorTextEs: string;
    flavorTextEn: string;
    captureRate: number;
    baseHappiness: number;
    growthRate: string;
    isLegendary: boolean;
    isMythical: boolean;
    genderRatio: {
      male: number;
      female: number;
      genderless: boolean;
    };
  };
  evolutionChain?: PokemonEvolutionNode;
  varieties: PokemonVariety[];
}

export type GenerationRange = {
  gen: number;
  name: string;
  region: string;
  start: number;
  end: number;
};

export const GENERATIONS: GenerationRange[] = [
  { gen: 0, name: "Todos", region: "Kanto -> Paldea", start: 1, end: 1025 },
  { gen: 1, name: "Gen I", region: "Kanto", start: 1, end: 151 },
  { gen: 2, name: "Gen II", region: "Johto", start: 152, end: 251 },
  { gen: 3, name: "Gen III", region: "Hoenn", start: 252, end: 386 },
  { gen: 4, name: "Gen IV", region: "Sinnoh", start: 387, end: 493 },
  { gen: 5, name: "Gen V", region: "Unova", start: 494, end: 649 },
  { gen: 6, name: "Gen VI", region: "Kalos", start: 650, end: 721 },
  { gen: 7, name: "Gen VII", region: "Alola", start: 722, end: 809 },
  { gen: 8, name: "Gen VIII", region: "Galar / Hisui", start: 810, end: 905 },
  { gen: 9, name: "Gen IX", region: "Paldea", start: 906, end: 1025 },
];
