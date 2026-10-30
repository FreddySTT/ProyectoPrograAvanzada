import {
  PokemonListItem,
  PokemonDetail,
  PokemonEvolutionNode,
  PokemonType,
  PokemonStat,
  PokemonAbility,
  PokemonVariety,
  VarietyCategory,
} from "../types/pokemon.types";
import {
  formatPokemonId,
  formatPokemonName,
  getArtworkUrl,
  getShinyArtworkUrl,
  getModel3DUrl,
  getShinyModel3DUrl,
  getAnimatedSpriteUrl,
  getAnimatedShinySpriteUrl,
  getRetroPixelUrl,
  getShinyRetroPixelUrl,
  getGen1RetroUrl,
} from "../utils/pokemonFormatters";

const BASE_URL = "https://pokeapi.co/api/v2";

let pokemonListCache: PokemonListItem[] | null = null;
const pokemonDetailCache = new Map<string | number, PokemonDetail>();
const typePokemonMapCache = new Map<PokemonType, Set<number>>();

export async function fetchAllPokemonList(): Promise<PokemonListItem[]> {
  if (pokemonListCache && pokemonListCache.length > 0) {
    return pokemonListCache;
  }

  try {
    const res = await fetch(`${BASE_URL}/pokemon?limit=1025&offset=0`, {
      cache: "force-cache",
    });

    if (!res.ok) {
      throw new Error(`Error al obtener lista de pokémon: ${res.statusText}`);
    }

    const data = await res.json();
    const results: Array<{ name: string; url: string }> = data.results;

    const list: PokemonListItem[] = results.map((item, index) => {
      const parts = item.url.split("/").filter(Boolean);
      const id = parseInt(parts[parts.length - 1], 10) || index + 1;

      return {
        id,
        name: item.name,
        url: item.url,
        formattedId: formatPokemonId(id),
        artwork: getArtworkUrl(id),
        sprite: getRetroPixelUrl(id),
        animatedSprite: getAnimatedSpriteUrl(id),
      };
    });

    pokemonListCache = list;
    return list;
  } catch (error) {
    console.error("Error en fetchAllPokemonList:", error);
    throw error;
  }
}

export async function fetchPokemonIdsByType(type: PokemonType): Promise<Set<number>> {
  if (typePokemonMapCache.has(type)) {
    return typePokemonMapCache.get(type)!;
  }

  try {
    const res = await fetch(`${BASE_URL}/type/${type}`);
    if (!res.ok) {
      throw new Error(`Error al obtener tipo ${type}`);
    }

    const data = await res.json();
    const idSet = new Set<number>();

    for (const entry of data.pokemon) {
      const parts = entry.pokemon.url.split("/").filter(Boolean);
      const id = parseInt(parts[parts.length - 1], 10);
      if (id && id <= 1025) {
        idSet.add(id);
      }
    }

    typePokemonMapCache.set(type, idSet);
    return idSet;
  } catch (err) {
    console.error(`Error en fetchPokemonIdsByType(${type}):`, err);
    return new Set<number>();
  }
}

export async function fetchPokemonDetail(idOrName: string | number): Promise<PokemonDetail> {
  const cacheKey = String(idOrName).toLowerCase();
  if (pokemonDetailCache.has(cacheKey)) {
    return pokemonDetailCache.get(cacheKey)!;
  }

  try {
    const pokeRes = await fetch(`${BASE_URL}/pokemon/${idOrName}`);
    if (!pokeRes.ok) {
      throw new Error(`No se encontró el Pokémon: ${idOrName}`);
    }
    const pokeData = await pokeRes.json();
    const id: number = pokeData.id;

    // Fetch species data
    let speciesData: any = null;
    let evolutionChain: PokemonEvolutionNode | undefined = undefined;

    try {
      // If querying an alternate form (>10000), species URL is in pokeData.species.url
      const speciesUrl = pokeData.species?.url || `${BASE_URL}/pokemon-species/${id}`;
      const speciesRes = await fetch(speciesUrl);
      if (speciesRes.ok) {
        speciesData = await speciesRes.json();

        if (speciesData.evolution_chain?.url) {
          try {
            const evoRes = await fetch(speciesData.evolution_chain.url);
            if (evoRes.ok) {
              const evoData = await evoRes.json();
              evolutionChain = parseEvolutionChain(evoData.chain);
            }
          } catch (e) {
            console.warn("No se pudo cargar la cadena de evolución:", e);
          }
        }
      }
    } catch (e) {
      console.warn("No se pudo cargar datos de especie:", e);
    }

    const types: PokemonType[] = pokeData.types.map((t: any) => t.type.name as PokemonType);

    const stats: PokemonStat[] = pokeData.stats.map((s: any) => ({
      name: s.stat.name,
      baseStat: s.base_stat,
      effort: s.effort,
    }));

    const abilities: PokemonAbility[] = pokeData.abilities.map((a: any) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
      slot: a.slot,
    }));

    let flavorTextEs = "";
    let flavorTextEn = "";
    let genus = "Pokémon Desconocido";

    if (speciesData) {
      const esEntry = speciesData.flavor_text_entries?.find(
        (entry: any) => entry.language.name === "es"
      );
      const enEntry = speciesData.flavor_text_entries?.find(
        (entry: any) => entry.language.name === "en"
      );
      flavorTextEs = cleanFlavorText(esEntry?.flavor_text || "");
      flavorTextEn = cleanFlavorText(enEntry?.flavor_text || "");

      const genusEs = speciesData.genera?.find((g: any) => g.language.name === "es");
      const genusEn = speciesData.genera?.find((g: any) => g.language.name === "en");
      genus = genusEs?.genus || genusEn?.genus || "Pokémon";
    }

    const genderRate = speciesData?.gender_rate ?? -1;
    const genderless = genderRate === -1;
    const female = genderless ? 0 : (genderRate / 8) * 100;
    const male = genderless ? 0 : 100 - female;

    // Sprite collection with 3D model & retro support
    const sprites = {
      officialArtwork: getArtworkUrl(id),
      officialArtworkShiny: getShinyArtworkUrl(id),
      model3D: pokeData.sprites?.other?.home?.front_default || getModel3DUrl(id),
      model3DShiny: pokeData.sprites?.other?.home?.front_shiny || getShinyModel3DUrl(id),
      animatedBattle: pokeData.sprites?.other?.showdown?.front_default || getAnimatedSpriteUrl(id),
      animatedBattleShiny: pokeData.sprites?.other?.showdown?.front_shiny || getAnimatedShinySpriteUrl(id),
      pixelRetro: pokeData.sprites?.front_default || getRetroPixelUrl(id),
      pixelRetroShiny: pokeData.sprites?.front_shiny || getShinyRetroPixelUrl(id),
      gen1Retro: id <= 151 ? getGen1RetroUrl(id) : undefined,
    };

    // Parse all varieties (Megas, Alola, Galar, Hisui, Paldea, G-Max, Alternas)
    const varieties: PokemonVariety[] = [];
    if (speciesData?.varieties && speciesData.varieties.length > 0) {
      for (const v of speciesData.varieties) {
        const parts = v.pokemon.url.split("/").filter(Boolean);
        const varietyId = parseInt(parts[parts.length - 1], 10);
        const vName = v.pokemon.name;

        let category: VarietyCategory = "alternate";
        let displayName = formatPokemonName(vName);

        if (vName.includes("mega")) {
          category = "mega";
          displayName = vName.includes("mega-x")
            ? "Mega " + formatPokemonName(speciesData.name) + " X"
            : vName.includes("mega-y")
            ? "Mega " + formatPokemonName(speciesData.name) + " Y"
            : "Mega " + formatPokemonName(speciesData.name);
        } else if (vName.includes("primal")) {
          category = "mega";
          displayName = formatPokemonName(speciesData.name) + " Primigenio";
        } else if (vName.includes("alola")) {
          category = "alola";
          displayName = "Forma Alola";
        } else if (vName.includes("galar")) {
          category = "galar";
          displayName = "Forma Galar";
        } else if (vName.includes("hisui")) {
          category = "hisui";
          displayName = "Forma Hisui";
        } else if (vName.includes("paldea")) {
          category = "paldea";
          displayName = "Forma Paldea";
        } else if (vName.includes("gmax")) {
          category = "gmax";
          displayName = "Gigamax (G-Max)";
        } else if (v.is_default) {
          displayName = "Forma Estándar";
        }

        varieties.push({
          id: varietyId,
          name: vName,
          displayName,
          isDefault: v.is_default,
          category,
          artwork: getArtworkUrl(varietyId),
        });
      }
    }

    const detail: PokemonDetail = {
      id,
      name: pokeData.name,
      formattedId: formatPokemonId(id > 10000 ? (speciesData?.id || id) : id),
      height: pokeData.height,
      weight: pokeData.weight,
      baseExperience: pokeData.base_experience ?? 0,
      types,
      stats,
      abilities,
      cries: {
        latest: pokeData.cries?.latest,
        legacy: pokeData.cries?.legacy,
      },
      sprites,
      species: {
        name: speciesData?.name || pokeData.name,
        genus,
        flavorTextEs: flavorTextEs || flavorTextEn || "Sin descripción disponible en la base de datos de la Pokédex.",
        flavorTextEn: flavorTextEn || "No Pokédex description available.",
        captureRate: speciesData?.capture_rate ?? 45,
        baseHappiness: speciesData?.base_happiness ?? 50,
        growthRate: speciesData?.growth_rate?.name || "medium-slow",
        isLegendary: !!speciesData?.is_legendary,
        isMythical: !!speciesData?.is_mythical,
        genderRatio: {
          male,
          female,
          genderless,
        },
      },
      evolutionChain,
      varieties,
    };

    pokemonDetailCache.set(cacheKey, detail);
    pokemonDetailCache.set(id, detail);
    return detail;
  } catch (error) {
    console.error(`Error en fetchPokemonDetail(${idOrName}):`, error);
    throw error;
  }
}

function cleanFlavorText(text: string): string {
  return text
    .replace(/[\f\n\r\t\v]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseEvolutionChain(chainNode: any): PokemonEvolutionNode {
  const parts = chainNode.species.url.split("/").filter(Boolean);
  const id = parseInt(parts[parts.length - 1], 10);

  const details = chainNode.evolution_details?.[0];
  const minLevel = details?.min_level ?? null;
  const trigger = details?.trigger?.name ?? null;
  const item = details?.item?.name ?? null;

  const evolvesTo: PokemonEvolutionNode[] = (chainNode.evolves_to || []).map((sub: any) =>
    parseEvolutionChain(sub)
  );

  return {
    id,
    name: chainNode.species.name,
    image: getArtworkUrl(id),
    minLevel,
    trigger,
    item,
    evolvesTo,
  };
}
