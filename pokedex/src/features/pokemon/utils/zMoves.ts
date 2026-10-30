import { PokemonType } from "../types/pokemon.types";

export interface ZMoveInfo {
  name: string;
  nameEn: string;
  type: PokemonType;
  crystal: string;
  crystalIcon: string;
  power: number | string;
  category: "Físico" | "Especial" | "Estado" | "Variable";
  description: string;
  isExclusive?: boolean;
  requiredPokemon?: string;
}

export const ELEMENTAL_Z_MOVES: Record<PokemonType, ZMoveInfo> = {
  normal: {
    name: "Carrera Arrolladora",
    nameEn: "Breakneck Blitz",
    type: "normal",
    crystal: "Normastal Z",
    crystalIcon: "⚪",
    power: "Variable",
    category: "Variable",
    description: "El usuario emplea el Poder Z para coger carrerilla y arremeter contra el objetivo con ímpetu colosal.",
  },
  fire: {
    name: "Hecatombe Pírica",
    nameEn: "Inferno Overdrive",
    type: "fire",
    crystal: "Pirostal Z",
    crystalIcon: "🔥",
    power: "Variable",
    category: "Variable",
    description: "El usuario acumula el Poder Z para liberar un mar de fuego abrasador que envuelve al adversario.",
  },
  water: {
    name: "Hidrovórtice Abisal",
    nameEn: "Hydro Vortex",
    type: "water",
    crystal: "Hidrostal Z",
    crystalIcon: "💧",
    power: "Variable",
    category: "Variable",
    description: "El usuario crea un inmenso remolino de agua con el Poder Z que engulle y aplasta al objetivo.",
  },
  electric: {
    name: "Gigavoltio Destructor",
    nameEn: "Gigavolt Havoc",
    type: "electric",
    crystal: "Electrostal Z",
    crystalIcon: "⚡",
    power: "Variable",
    category: "Variable",
    description: "El usuario descarga una corriente de alto voltaje amplificada al máximo por el Poder Z.",
  },
  grass: {
    name: "Megatón Floral",
    nameEn: "Bloom Doom",
    type: "grass",
    crystal: "Fitostal Z",
    crystalIcon: "🌿",
    power: "Variable",
    category: "Variable",
    description: "El usuario reúne la energía de la naturaleza mediante el Poder Z para desatar un impacto botánico gigantesco.",
  },
  ice: {
    name: "Crioaliento Polar",
    nameEn: "Subzero Slammer",
    type: "ice",
    crystal: "Criostal Z",
    crystalIcon: "❄️",
    power: "Variable",
    category: "Variable",
    description: "El usuario congela el entorno con el Poder Z y precipita una masa glacial sobre el objetivo.",
  },
  fighting: {
    name: "Ráfaga Demoledora",
    nameEn: "All-Out Pummeling",
    type: "fighting",
    crystal: "Lizstal Z",
    crystalIcon: "🥊",
    power: "Variable",
    category: "Variable",
    description: "El usuario asesta una lluvia incesante de golpes marciales cargados de pura energía Z.",
  },
  poison: {
    name: "Diluvio Corrosivo",
    nameEn: "Acid Downpour",
    type: "poison",
    crystal: "Toxistal Z",
    crystalIcon: "☠️",
    power: "Variable",
    category: "Variable",
    description: "El usuario hace llover un torrente de toxinas corrosivas potenciadas por el Poder Z.",
  },
  ground: {
    name: "Barrena Telúrica",
    nameEn: "Tectonic Rage",
    type: "ground",
    crystal: "Litostal Z",
    crystalIcon: "🏜️",
    power: "Variable",
    category: "Variable",
    description: "El usuario agrieta la tierra con el Poder Z y atrapa al objetivo en un cataclismo sísmico.",
  },
  flying: {
    name: "Picado Supersónico",
    nameEn: "Supersonic Skystrike",
    type: "flying",
    crystal: "Aerostal Z",
    crystalIcon: "🌪️",
    power: "Variable",
    category: "Variable",
    description: "El usuario asciende a la estratosfera y desciende en picado a velocidad supersónica.",
  },
  psychic: {
    name: "Disrupción Psíquica",
    nameEn: "Shattered Psyche",
    type: "psychic",
    crystal: "Psistal Z",
    crystalIcon: "🔮",
    power: "Variable",
    category: "Variable",
    description: "El usuario materializa el Poder Z como una onda mental masiva que colapsa la mente enemiga.",
  },
  bug: {
    name: "Guadaña Sedosa",
    nameEn: "Savage Spin-Out",
    type: "bug",
    crystal: "Insectostal Z",
    crystalIcon: "🐛",
    power: "Variable",
    category: "Variable",
    description: "El usuario atrapa a la víctima en un capullo de seda y arremete con ferocidad desmedida.",
  },
  rock: {
    name: "Aplastamiento Gigalítico",
    nameEn: "Continental Crush",
    type: "rock",
    crystal: "Petrostal Z",
    crystalIcon: "🪨",
    power: "Variable",
    category: "Variable",
    description: "El usuario invoca un monolito de roca descomunal con el Poder Z y lo deja caer sobre el rival.",
  },
  ghost: {
    name: "Presa Espectral",
    nameEn: "Never-Ending Nightmare",
    type: "ghost",
    crystal: "Espectrostal Z",
    crystalIcon: "👻",
    power: "Variable",
    category: "Variable",
    description: "Una legión de espectros arrastra al oponente a un abismo sombrío sin fin.",
  },
  dragon: {
    name: "Dracoaliento Devastador",
    nameEn: "Devastating Drake",
    type: "dragon",
    crystal: "Dracostal Z",
    crystalIcon: "🐲",
    power: "Variable",
    category: "Variable",
    description: "El usuario canaliza la furia de los dragones en un haz de destrucción primordial.",
  },
  dark: {
    name: "Agujero Negro del Fin",
    nameEn: "Black Hole Eclipse",
    type: "dark",
    crystal: "Noctostal Z",
    crystalIcon: "🌑",
    power: "Variable",
    category: "Variable",
    description: "El usuario condensa el Poder Z en un agujero negro que absorbe y pulveriza al rival.",
  },
  steel: {
    name: "Hélice Trepanadora",
    nameEn: "Corkscrew Crash",
    type: "steel",
    crystal: "Metalostal Z",
    crystalIcon: "⚙️",
    power: "Variable",
    category: "Variable",
    description: "El usuario gira como un taladro de acero endurecido para atravesar cualquier defensa.",
  },
  fairy: {
    name: "Enjambre Arrumaco",
    nameEn: "Twinkle Tackle",
    type: "fairy",
    crystal: "Feastal Z",
    crystalIcon: "✨",
    power: "Variable",
    category: "Variable",
    description: "El usuario se llena del místico Poder Z y se lanza en una carica deslumbrante.",
  },
};

export const EXCLUSIVE_Z_MOVES: Record<string, ZMoveInfo[]> = {
  pikachu: [
    {
      name: "Pikavoltio Fulminante",
      nameEn: "Catastropika",
      type: "electric",
      crystal: "Pikashutal Z",
      crystalIcon: "⚡",
      power: 210,
      category: "Físico",
      description: "Pikachu concentra la totalidad de su energía en una bola de rayos y se lanza como un bólido.",
      isExclusive: true,
      requiredPokemon: "Pikachu con Placaje Eléctrico",
    },
    {
      name: "Gigarrayo Fulminante",
      nameEn: "10,000,000 Volt Thunderbolt",
      type: "electric",
      crystal: "Ash-Pikashutal Z",
      crystalIcon: "⚡",
      power: 195,
      category: "Especial",
      description: "Pikachu desata siete rayos con los colores del arcoíris con una probabilidad elevadísima de crítico.",
      isExclusive: true,
      requiredPokemon: "Pikachu con Gorra",
    },
  ],
  raichu: [
    {
      name: "Surfeo Galvánico",
      nameEn: "Stoked Sparksurfer",
      type: "electric",
      crystal: "Aloraichutal Z",
      crystalIcon: "⚡",
      power: 175,
      category: "Especial",
      description: "Raichu de Alola monta sobre su cola electrificada surfeando por el aire y paraliza al objetivo.",
      isExclusive: true,
      requiredPokemon: "Raichu de Alola con Rayo",
    },
  ],
  eevee: [
    {
      name: "Novena Potencia",
      nameEn: "Extreme Evoboost",
      type: "normal",
      crystal: "Eeveestal Z",
      crystalIcon: "✨",
      power: "Estado (+2 todas las estadísticas)",
      category: "Estado",
      description: "Eevee invoca a sus ocho evoluciones para recibir su poder, subiendo +2 niveles todas sus características.",
      isExclusive: true,
      requiredPokemon: "Eevee con Última Baza",
    },
  ],
  snorlax: [
    {
      name: "Arremetida Implacable",
      nameEn: "Pulverizing Pancake",
      type: "normal",
      crystal: "Snorlastal Z",
      crystalIcon: "⚪",
      power: 210,
      category: "Físico",
      description: "Snorlax despierta furioso, corre a toda prisa y se deja caer con todo su tonelaje sobre el rival.",
      isExclusive: true,
      requiredPokemon: "Snorlax con Gigaimpacto",
    },
  ],
  mew: [
    {
      name: "Supernova Original",
      nameEn: "Genesis Supernova",
      type: "psychic",
      crystal: "Mewstal Z",
      crystalIcon: "🔮",
      power: 185,
      category: "Especial",
      description: "Mew libera el poder de los orígenes y crea un Campo Psíquico tras atacar.",
      isExclusive: true,
      requiredPokemon: "Mew con Psíquico",
    },
  ],
  decidueye: [
    {
      name: "Aluvión de Flechas Sombrías",
      nameEn: "Sinister Arrow Raid",
      type: "ghost",
      crystal: "Dueyestal Z",
      crystalIcon: "👻",
      power: 180,
      category: "Físico",
      description: "Decidueye surca el cielo mientras miles de plumas-flecha caen en picado perforando al rival.",
      isExclusive: true,
      requiredPokemon: "Decidueye con Puntada Sombría",
    },
  ],
  incineroar: [
    {
      name: "Hiperplancha Oscura",
      nameEn: "Malicious Moonsault",
      type: "dark",
      crystal: "Incinostal Z",
      crystalIcon: "🔥",
      power: 180,
      category: "Físico",
      description: "Incineroar salta desde las cuerdas de un ring en llamas y aplasta al adversario sin piedad.",
      isExclusive: true,
      requiredPokemon: "Incineroar con Lariat Oscuro",
    },
  ],
  primarina: [
    {
      name: "Sinfonía de la Diva Marina",
      nameEn: "Oceanic Operetta",
      type: "water",
      crystal: "Primarinastal Z",
      crystalIcon: "💧",
      power: 195,
      category: "Especial",
      description: "Primarina entona un aria mística guiando un enorme orbe de agua que estalla sobre el rival.",
      isExclusive: true,
      requiredPokemon: "Primarina con Aria Burbuja",
    },
  ],
  mimikyu: [
    {
      name: "Somanta Amistosa",
      nameEn: "Let's Snuggle Forever",
      type: "fairy",
      crystal: "Mimikyustal Z",
      crystalIcon: "✨",
      power: 190,
      category: "Físico",
      description: "Mimikyu atrapa al oponente debajo de su disfraz para darle una paliza con cariño.",
      isExclusive: true,
      requiredPokemon: "Mimikyu con Carantoña",
    },
  ],
  kommo_o: [
    {
      name: "Fragor Escama Brutal",
      nameEn: "Clangorous Soulblaze",
      type: "dragon",
      crystal: "Kommostal Z",
      crystalIcon: "🐲",
      power: 185,
      category: "Especial",
      description: "Kommo-o hace sonar sus escamas con energía cósmica y sube 1 nivel todos sus atributos.",
      isExclusive: true,
      requiredPokemon: "Kommo-o con Fragor Escamas",
    },
  ],
  marshadow: [
    {
      name: "Constelación del Puño Férreo",
      nameEn: "Soul-Stealing 7-Star Strike",
      type: "ghost",
      crystal: "Marshadestal Z",
      crystalIcon: "👻",
      power: 195,
      category: "Físico",
      description: "Marshadow emerge de las sombras con un aura ardiente y asesta 7 golpes estelares devastadores.",
      isExclusive: true,
      requiredPokemon: "Marshadow con Robasombra",
    },
  ],
};

export function getZMovesForPokemon(pokemonName: string, types: PokemonType[]): ZMoveInfo[] {
  const result: ZMoveInfo[] = [];

  // 1. Check for signature exclusive Z-moves
  const cleanName = pokemonName.toLowerCase().replace(/-/g, "_");
  const baseName = cleanName.split("_")[0];

  const exclusiveList = EXCLUSIVE_Z_MOVES[cleanName] || EXCLUSIVE_Z_MOVES[baseName];
  if (exclusiveList) {
    result.push(...exclusiveList);
  }

  // 2. Add elemental Z-moves matching each of the Pokemon's types
  for (const t of types) {
    const elemental = ELEMENTAL_Z_MOVES[t];
    if (elemental) {
      result.push(elemental);
    }
  }

  return result;
}
