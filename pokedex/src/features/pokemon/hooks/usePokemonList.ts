"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PokemonListItem, PokemonType, GENERATIONS } from "../types/pokemon.types";
import { fetchAllPokemonList, fetchPokemonIdsByType } from "../services/pokeApi";

export function usePokemonList() {
  const router = useRouter();
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState(0);
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null);
  const [typeFilteredIds, setTypeFilteredIds] = useState<Set<number> | null>(null);
  const [isFilteringType, setIsFilteringType] = useState(false);
  const [sortBy, setSortBy] = useState<"id-asc" | "id-desc" | "name-asc" | "name-desc">("id-asc");

  // Load all pokemons once
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchAllPokemonList()
      .then((data) => {
        if (isMounted) {
          setAllPokemon(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Error al cargar la lista de pokémon");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch type IDs whenever selectedType changes
  useEffect(() => {
    if (!selectedType) {
      setTypeFilteredIds(null);
      setIsFilteringType(false);
      return;
    }

    let isMounted = true;
    setIsFilteringType(true);

    fetchPokemonIdsByType(selectedType)
      .then((ids) => {
        if (isMounted) {
          setTypeFilteredIds(ids);
          setIsFilteringType(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTypeFilteredIds(new Set());
          setIsFilteringType(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedType]);

  // Filter and sort list
  const filteredPokemon = useMemo(() => {
    let result = [...allPokemon];

    // Generation filter
    if (selectedGeneration > 0) {
      const genConfig = GENERATIONS.find((g) => g.gen === selectedGeneration);
      if (genConfig) {
        result = result.filter(
          (p) => p.id >= genConfig.start && p.id <= genConfig.end
        );
      }
    }

    // Type filter
    if (selectedType && typeFilteredIds) {
      result = result.filter((p) => typeFilteredIds.has(p.id));
    }

    // Search query filter (matches name or ID like "25" or "#0025")
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase().replace("#", "");
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.id.toString() === query ||
          p.formattedId.toLowerCase().includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "id-asc") return a.id - b.id;
      if (sortBy === "id-desc") return b.id - a.id;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });

    return result;
  }, [allPokemon, selectedGeneration, selectedType, typeFilteredIds, searchQuery, sortBy]);

  const handleRandomPokemon = useCallback(() => {
    if (allPokemon.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allPokemon.length);
    const randomPokemon = allPokemon[randomIndex];
    router.push(`/pokemon/${randomPokemon.id}`);
  }, [allPokemon, router]);

  return {
    pokemonList: filteredPokemon,
    totalAll: allPokemon.length,
    totalFiltered: filteredPokemon.length,
    isLoading: isLoading || isFilteringType,
    error,
    searchQuery,
    setSearchQuery,
    selectedGeneration,
    setSelectedGeneration,
    selectedType,
    setSelectedType,
    sortBy,
    setSortBy,
    handleRandomPokemon,
  };
}
