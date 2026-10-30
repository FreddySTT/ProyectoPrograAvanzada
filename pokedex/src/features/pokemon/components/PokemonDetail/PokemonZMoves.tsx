import React from "react";
import { PokemonType } from "../../types/pokemon.types";
import { getZMovesForPokemon, ZMoveInfo } from "../../utils/zMoves";
import { PokemonTypeBadge } from "../PokemonTypeBadge/PokemonTypeBadge";
import styles from "./PokemonZMoves.module.css";

interface PokemonZMovesProps {
  pokemonName: string;
  types: PokemonType[];
}

export function PokemonZMoves({ pokemonName, types }: PokemonZMovesProps) {
  const zMoves: ZMoveInfo[] = getZMovesForPokemon(pokemonName, types);

  if (zMoves.length === 0) return null;

  return (
    <div className={styles.zContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.zBadge}>ALOLA POWER</span>
          <h4 className={styles.title}>Cristal Z & Movimientos Z</h4>
        </div>
        <p className={styles.subtitle}>
          Movimientos destructivos activados por la Pulsera Z y el Cristal Z correspondiente
        </p>
      </div>

      <div className={styles.movesGrid}>
        {zMoves.map((z) => (
          <div
            key={z.name}
            className={`${styles.zCard} ${z.isExclusive ? styles.exclusiveCard : ""}`}
          >
            {z.isExclusive && (
              <span className={styles.exclusiveBadge}>★ EXCLUSIVO DE ESPECIE</span>
            )}

            <div className={styles.cardHeader}>
              <div className={styles.crystalBox}>
                <span className={styles.crystalIcon}>{z.crystalIcon}</span>
                <span className={styles.crystalName}>{z.crystal}</span>
              </div>
              <PokemonTypeBadge type={z.type} size="sm" />
            </div>

            <div className={styles.moveBody}>
              <h5 className={styles.moveName}>{z.name}</h5>
              <span className={styles.moveNameEn}>{z.nameEn}</span>
              <p className={styles.description}>{z.description}</p>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Categoría:</span>
                <strong className={styles.metaValue}>{z.category}</strong>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Potencia:</span>
                <strong className={styles.powerValue}>{z.power}</strong>
              </div>
            </div>

            {z.requiredPokemon && (
              <div className={styles.reqNotice}>
                <span>Requisito: {z.requiredPokemon}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
