"use client";

import React, { useId } from "react";
import { PokemonListItem } from "../../types/pokemon.types";
import { useVirtualGrid } from "@/shared/components/VirtualScroll/useVirtualGrid";
import { PokemonCard } from "../PokemonCard/PokemonCard";
import styles from "./PokemonVirtualGrid.module.css";

interface PokemonVirtualGridProps {
  pokemonList: PokemonListItem[];
  isLoading?: boolean;
}

export function PokemonVirtualGrid({
  pokemonList,
  isLoading = false,
}: PokemonVirtualGridProps) {
  const gridId = useId();

  // Custom Virtual Scroll Hook with zero external dependencies
  const {
    containerRef,
    columns,
    totalHeight,
    offsetY,
    virtualItems,
  } = useVirtualGrid({
    totalItems: pokemonList.length,
    estimatedItemHeight: 250,
    gap: 18,
    minColumnWidth: 220,
    overscanRows: 2,
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.pokeballLoader}>
          <div className={styles.pokeballTop} />
          <div className={styles.pokeballCenter} />
          <div className={styles.pokeballBottom} />
        </div>
        <p className={styles.loadingText}>Sincronizando base de datos de la Pokédex...</p>
      </div>
    );
  }

  if (pokemonList.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <span className={styles.emptyIcon}>🔍</span>
        <h3 className={styles.emptyTitle}>No se encontró ningún Pokémon</h3>
        <p className={styles.emptyText}>
          Intenta con otro término de búsqueda, ID o cambia los filtros de generación y tipo.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.viewportWrapper}>
      {/* HUD Info Header */}
      <div className={styles.hudBar}>
        <div className={styles.hudLeft}>
          <span className={styles.hudTag}>VIRTUAL SCROLL ENGINE</span>
          <span className={styles.hudDetail}>
            Renderizando {virtualItems.length} nodos activos de {pokemonList.length} ítems en {columns} columnas
          </span>
        </div>
        <div className={styles.hudRight}>
          <span className={styles.fpsBadge}>60 FPS OPTIMIZED</span>
        </div>
      </div>

      {/* Virtualization Container */}
      <div ref={containerRef} className={styles.virtualContainer}>
        <div
          className={styles.virtualHeightSpacer}
          style={{ height: `${totalHeight}px` }}
        >
          <div
            className={styles.virtualGridWindow}
            style={{
              transform: `translateY(${offsetY}px)`,
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {virtualItems.map(({ index }) => {
              const pokemon = pokemonList[index];
              if (!pokemon) return null;

              return (
                <div key={`${gridId}-${pokemon.id}`} className={styles.gridCell}>
                  <PokemonCard pokemon={pokemon} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
