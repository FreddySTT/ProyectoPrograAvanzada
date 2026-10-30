"use client";

import React from "react";
import { usePokemonList } from "@/features/pokemon/hooks/usePokemonList";
import { PokedexListTemplate } from "@/components/templates/PokedexListTemplate/PokedexListTemplate";

export default function PokedexPage() {
  const {
    pokemonList,
    totalAll,
    totalFiltered,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedGeneration,
    setSelectedGeneration,
    selectedType,
    setSelectedType,
    sortBy,
    setSortBy,
    handleRandomPokemon,
  } = usePokemonList();

  return (
    <PokedexListTemplate
      pokemonList={pokemonList}
      totalAll={totalAll}
      totalFiltered={totalFiltered}
      isLoading={isLoading}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      selectedGeneration={selectedGeneration}
      onGenerationChange={setSelectedGeneration}
      selectedType={selectedType}
      onTypeChange={setSelectedType}
      sortBy={sortBy}
      onSortChange={setSortBy}
      onRandomPokemon={handleRandomPokemon}
    />
  );
}
