"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PokemonListItem } from "../../types/pokemon.types";
import { formatPokemonName } from "../../utils/pokemonFormatters";
import styles from "./PokemonCard.module.css";

interface PokemonCardProps {
  pokemon: PokemonListItem;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingCry, setIsPlayingCry] = useState(false);

  const displayName = formatPokemonName(pokemon.name);

  const handlePlayCry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlayingCry) return;
    setIsPlayingCry(true);

    const audioUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
    const audio = new Audio(audioUrl);
    audio.volume = 0.45;

    audio.onended = () => setIsPlayingCry(false);
    audio.onerror = () => setIsPlayingCry(false);

    audio.play().catch(() => setIsPlayingCry(false));
  };

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`pokemon-card-${pokemon.id}`}
    >
      <div className={styles.cardGlow} />
      <div className={styles.pokeballBg} />

      <div className={styles.header}>
        <span className={styles.idBadge}>{pokemon.formattedId}</span>
        <button
          className={`${styles.cryBtn} ${isPlayingCry ? styles.cryActive : ""}`}
          onClick={handlePlayCry}
          title={`Escuchar rugido de ${displayName}`}
          aria-label={`Escuchar rugido de ${displayName}`}
          type="button"
        >
          {isPlayingCry ? "🔊" : "🔈"}
        </button>
      </div>

      <div className={styles.imageContainer}>
        <Image
          src={isHovered ? pokemon.animatedSprite || pokemon.artwork : pokemon.artwork}
          alt={displayName}
          width={160}
          height={160}
          unoptimized
          className={`${styles.image} ${isHovered ? styles.imageHovered : ""}`}
          loading="lazy"
        />
      </div>

      <div className={styles.footer}>
        <h3 className={styles.name}>{displayName}</h3>
        <div className={styles.viewBadge}>
          <span>Detalles</span>
          <span className={styles.arrow}>→</span>
        </div>
      </div>
    </Link>
  );
}
