"use client";

import React from "react";
import { PokemonType, GENERATIONS } from "@/features/pokemon/types/pokemon.types";
import { ALL_POKEMON_TYPES } from "@/features/pokemon/utils/pokemonColors";
import { PokemonTypeBadge } from "@/components/atoms/PokemonTypeBadge/PokemonTypeBadge";
import { SearchBar } from "@/components/molecules/SearchBar/SearchBar";
import styles from "./PokemonFiltersBar.module.css";

interface PokemonFiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGeneration: number;
  onGenerationChange: (gen: number) => void;
  selectedType: PokemonType | null;
  onTypeChange: (type: PokemonType | null) => void;
  sortBy: "id-asc" | "id-desc" | "name-asc" | "name-desc";
  onSortChange: (sort: "id-asc" | "id-desc" | "name-asc" | "name-desc") => void;
  totalFiltered: number;
  totalAll: number;
  onRandomPokemon: () => void;
}

export function PokemonFiltersBar({
  searchQuery,
  onSearchChange,
  selectedGeneration,
  onGenerationChange,
  selectedType,
  onTypeChange,
  sortBy,
  onSortChange,
  totalFiltered,
  totalAll,
  onRandomPokemon,
}: PokemonFiltersBarProps) {
  return (
    <div className={styles.filtersWrapper}>
      {/* Top Row: SearchBar molecule + Actions */}
      <div className={styles.topRow}>
        <SearchBar value={searchQuery} onChange={onSearchChange} />

        <div className={styles.actionsBox}>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className={styles.sortSelect}
            id="pokemon-sort-select"
          >
            <option value="id-asc">Número: Menor a Mayor</option>
            <option value="id-desc">Número: Mayor a Menor</option>
            <option value="name-asc">Nombre: A - Z</option>
            <option value="name-desc">Nombre: Z - A</option>
          </select>

          <button
            type="button"
            onClick={onRandomPokemon}
            className={styles.randomBtn}
            id="btn-random-pokemon"
            title="Ir a un Pokémon al azar"
          >
            🎲 Aleatorio
          </button>
        </div>
      </div>

      {/* Generation Bar */}
      <div className={styles.genBar}>
        <span className={styles.genLabel}>Región:</span>
        <div className={styles.genList}>
          {GENERATIONS.map((gen) => (
            <button
              key={gen.gen}
              type="button"
              className={`${styles.genBtn} ${
                selectedGeneration === gen.gen ? styles.genBtnActive : ""
              }`}
              onClick={() => onGenerationChange(gen.gen)}
              title={`${gen.name} (${gen.region}): #${gen.start} - #${gen.end}`}
            >
              <span className={styles.genName}>{gen.name}</span>
              {gen.gen > 0 && <span className={styles.genRegion}>{gen.region}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter Pills using PokemonTypeBadge Atom */}
      <div className={styles.typeFilterSection}>
        <div className={styles.typeHeader}>
          <span className={styles.typeLabel}>Filtrar por Tipo:</span>
          {selectedType && (
            <button
              type="button"
              className={styles.resetTypeBtn}
              onClick={() => onTypeChange(null)}
            >
              Limpiar tipo ({selectedType}) ✕
            </button>
          )}
        </div>
        <div className={styles.typeChips}>
          {ALL_POKEMON_TYPES.map((type) => (
            <PokemonTypeBadge
              key={type}
              type={type}
              size="sm"
              clickable
              selected={selectedType === type}
              onClick={() => onTypeChange(selectedType === type ? null : type)}
            />
          ))}
        </div>
      </div>

      {/* Results summary bar */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryLeft}>
          <span className={styles.ledIndicator} />
          <span>
            Mostrando <strong>{totalFiltered}</strong> de {totalAll} Pokémons en la Pokédex
          </span>
        </div>
        {totalFiltered < totalAll && (
          <button
            type="button"
            className={styles.clearAllBtn}
            onClick={() => {
              onSearchChange("");
              onGenerationChange(0);
              onTypeChange(null);
            }}
          >
            Restablecer todos los filtros
          </button>
        )}
      </div>
    </div>
  );
}
