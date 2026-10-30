"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PokemonEvolutionNode } from "../../types/pokemon.types";
import { formatPokemonName, formatPokemonId } from "../../utils/pokemonFormatters";
import styles from "./PokemonEvolution.module.css";

interface PokemonEvolutionProps {
  chain: PokemonEvolutionNode;
  currentPokemonId: number;
}

export function PokemonEvolution({ chain, currentPokemonId }: PokemonEvolutionProps) {
  // Flatten tree to paths or sequential stages
  const renderNode = (node: PokemonEvolutionNode) => {
    const isCurrent = node.id === currentPokemonId;
    const name = formatPokemonName(node.name);

    return (
      <div key={node.id} className={styles.stageWrapper}>
        <Link
          href={`/pokemon/${node.id}`}
          className={`${styles.pokeNode} ${isCurrent ? styles.currentPoke : ""}`}
        >
          <span className={styles.pokeId}>{formatPokemonId(node.id)}</span>
          <div className={styles.imgWrapper}>
            <Image
              src={node.image}
              alt={name}
              width={90}
              height={90}
              unoptimized
              className={styles.img}
            />
          </div>
          <span className={styles.pokeName}>{name}</span>
          {isCurrent && <span className={styles.currentTag}>Actual</span>}
        </Link>

        {node.evolvesTo && node.evolvesTo.length > 0 && (
          <div className={styles.evolutionsBranch}>
            {node.evolvesTo.map((child) => (
              <div key={child.id} className={styles.branchItem}>
                <div className={styles.arrowBox}>
                  <span className={styles.arrowIcon}>➔</span>
                  {child.minLevel && (
                    <span className={styles.condition}>Nivel {child.minLevel}</span>
                  )}
                  {child.item && (
                    <span className={styles.condition}>
                      {child.item.replace("-", " ")}
                    </span>
                  )}
                  {child.trigger && !child.minLevel && !child.item && (
                    <span className={styles.condition}>{child.trigger}</span>
                  )}
                </div>
                {renderNode(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Línea Evolutiva</h4>
      <div className={styles.treeContainer}>{renderNode(chain)}</div>
    </div>
  );
}
