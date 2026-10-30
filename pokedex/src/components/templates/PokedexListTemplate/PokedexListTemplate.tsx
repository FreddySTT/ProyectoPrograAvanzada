"use client";

import React from "react";
import { PokemonListItem, PokemonType } from "@/features/pokemon/types/pokemon.types";
import { PokemonFiltersBar } from "@/components/organisms/PokemonFiltersBar/PokemonFiltersBar";
import { PokemonVirtualGrid } from "@/features/pokemon/components/PokemonGrid/PokemonVirtualGrid";
import styles from "./PokedexListTemplate.module.css";

interface PokedexListTemplateProps {
  pokemonList: PokemonListItem[];
  totalAll: number;
  totalFiltered: number;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedGeneration: number;
  onGenerationChange: (gen: number) => void;
  selectedType: PokemonType | null;
  onTypeChange: (t: PokemonType | null) => void;
  sortBy: "id-asc" | "id-desc" | "name-asc" | "name-desc";
  onSortChange: (s: "id-asc" | "id-desc" | "name-asc" | "name-desc") => void;
  onRandomPokemon: () => void;
}

export function PokedexListTemplate({
  pokemonList,
  totalAll,
  totalFiltered,
  isLoading,
  searchQuery,
  onSearchChange,
  selectedGeneration,
  onGenerationChange,
  selectedType,
  onTypeChange,
  sortBy,
  onSortChange,
  onRandomPokemon,
}: PokedexListTemplateProps) {
  return (
    <main className={styles.templateMain}>
      <PokemonFiltersBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedGeneration={selectedGeneration}
        onGenerationChange={onGenerationChange}
        selectedType={selectedType}
        onTypeChange={onTypeChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        totalFiltered={totalFiltered}
        totalAll={totalAll}
        onRandomPokemon={onRandomPokemon}
      />

      <PokemonVirtualGrid
        pokemonList={pokemonList}
        isLoading={isLoading}
      />
    </main>
  );
}
