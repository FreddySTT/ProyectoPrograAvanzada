"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PokemonDetail } from "@/features/pokemon/types/pokemon.types";
import {
  formatPokemonName,
  formatPokemonId,
} from "@/features/pokemon/utils/pokemonFormatters";
import { getPokemonTypeConfig } from "@/features/pokemon/utils/pokemonColors";
import { PokemonTypeBadge } from "@/components/atoms/PokemonTypeBadge/PokemonTypeBadge";
import { PokemonCryPlayer } from "@/features/pokemon/components/PokemonDetail/PokemonCryPlayer";
import { PokemonVarieties } from "@/features/pokemon/components/PokemonDetail/PokemonVarieties";
import { PokemonTraitsCard } from "@/components/organisms/PokemonTraitsCard/PokemonTraitsCard";
import { PokemonMatchupsCard } from "@/components/organisms/PokemonMatchupsCard/PokemonMatchupsCard";
import { PokemonStatsCard } from "@/components/organisms/PokemonStatsCard/PokemonStatsCard";
import { PokemonZMoves } from "@/features/pokemon/components/PokemonDetail/PokemonZMoves";
import { PokemonEvolution } from "@/features/pokemon/components/PokemonDetail/PokemonEvolution";
import styles from "./PokemonDetailTemplate.module.css";

interface PokemonDetailTemplateProps {
  pokemon: PokemonDetail;
}

type DisplayStyle = "official" | "model3d" | "animated" | "retro" | "gen1";

export function PokemonDetailTemplate({ pokemon }: PokemonDetailTemplateProps) {
  const [isShiny, setIsShiny] = useState(false);
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>("official");
  const [lang, setLang] = useState<"es" | "en">("es");

  const primaryType = pokemon.types[0];
  const typeConfig = getPokemonTypeConfig(primaryType);
  const displayName = formatPokemonName(pokemon.name);

  // Preload all shiny & variant images for 0ms delay switch
  useEffect(() => {
    const imagesToPreload = [
      pokemon.sprites.officialArtworkShiny,
      pokemon.sprites.model3D,
      pokemon.sprites.model3DShiny,
      pokemon.sprites.animatedBattle,
      pokemon.sprites.animatedBattleShiny,
      pokemon.sprites.pixelRetro,
      pokemon.sprites.pixelRetroShiny,
      pokemon.sprites.gen1Retro,
    ].filter(Boolean) as string[];

    imagesToPreload.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [pokemon]);

  const currentImage = useMemo(() => {
    switch (displayStyle) {
      case "model3d":
        return isShiny
          ? pokemon.sprites.model3DShiny || pokemon.sprites.model3D
          : pokemon.sprites.model3D;
      case "animated":
        return isShiny
          ? pokemon.sprites.animatedBattleShiny || pokemon.sprites.animatedBattle
          : pokemon.sprites.animatedBattle;
      case "retro":
        return isShiny
          ? pokemon.sprites.pixelRetroShiny || pokemon.sprites.pixelRetro
          : pokemon.sprites.pixelRetro;
      case "gen1":
        return pokemon.sprites.gen1Retro || pokemon.sprites.pixelRetro;
      case "official":
      default:
        return isShiny
          ? pokemon.sprites.officialArtworkShiny || pokemon.sprites.officialArtwork
          : pokemon.sprites.officialArtwork;
    }
  }, [displayStyle, isShiny, pokemon.sprites]);

  const prevId = pokemon.id > 1 ? pokemon.id - 1 : 1025;
  const nextId = pokemon.id < 1025 ? pokemon.id + 1 : 1;

  return (
    <div
      className={styles.templateContainer}
      style={
        {
          "--hero-type-color": typeConfig.primary,
          "--hero-type-glow": typeConfig.glow,
          "--hero-type-gradient": typeConfig.gradient,
        } as React.CSSProperties
      }
    >
      {/* Top Nav: Back to Pokédex + Prev/Next buttons */}
      <nav className={styles.topNav}>
        <Link href="/" className={styles.backBtn} id="btn-back-pokedex">
          <span className={styles.backArrow}>←</span>
          <span>Volver a la Pokédex</span>
        </Link>

        <div className={styles.paginationNav}>
          <Link
            href={`/pokemon/${prevId}`}
            className={styles.pagerBtn}
            id="btn-prev-pokemon"
            title="Pokémon Anterior"
          >
            <span>‹</span>
            <span>{formatPokemonId(prevId)}</span>
          </Link>

          <Link
            href={`/pokemon/${nextId}`}
            className={styles.pagerBtn}
            id="btn-next-pokemon"
            title="Siguiente Pokémon"
          >
            <span>{formatPokemonId(nextId)}</span>
            <span>›</span>
          </Link>
        </div>
      </nav>

      {/* Hero Showcase Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroAura} />
        <div className={styles.heroPokeballWatermark} />

        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.heroMeta}>
              <span className={styles.idTag}>{pokemon.formattedId}</span>
              <span className={styles.genusTag}>{pokemon.species.genus}</span>
              {pokemon.species.isLegendary && (
                <span className={styles.specialTag}>★ Legendario</span>
              )}
              {pokemon.species.isMythical && (
                <span className={styles.specialTag}>★ Mítico</span>
              )}
            </div>

            <h1 className={styles.heroName}>{displayName}</h1>

            <div className={styles.typesRow}>
              {pokemon.types.map((t) => (
                <PokemonTypeBadge key={t} type={t} size="lg" />
              ))}
            </div>

            {/* Lore Box */}
            <div className={styles.loreBox}>
              <div className={styles.loreHeader}>
                <span className={styles.loreLabel}>Registro de la Pokédex:</span>
                <div className={styles.langToggle}>
                  <button
                    type="button"
                    className={`${styles.langBtn} ${lang === "es" ? styles.langActive : ""}`}
                    onClick={() => setLang("es")}
                  >
                    ES
                  </button>
                  <button
                    type="button"
                    className={`${styles.langBtn} ${lang === "en" ? styles.langActive : ""}`}
                    onClick={() => setLang("en")}
                  >
                    EN
                  </button>
                </div>
              </div>
              <p className={styles.loreText}>
                {lang === "es"
                  ? pokemon.species.flavorTextEs
                  : pokemon.species.flavorTextEn}
              </p>
            </div>

            <PokemonCryPlayer cries={pokemon.cries} pokemonName={displayName} />
          </div>

          <div className={styles.heroRight}>
            <div className={styles.imageStage}>
              <Image
                key={`${currentImage}-${isShiny}-${displayStyle}`}
                src={currentImage}
                alt={displayName}
                width={360}
                height={360}
                priority
                unoptimized
                className={`${styles.mainArtwork} ${
                  displayStyle === "retro" || displayStyle === "gen1" ? styles.pixelArt : ""
                }`}
              />
            </div>

            <div className={styles.viewModeSelector}>
              <button
                type="button"
                className={`${styles.modeBtn} ${displayStyle === "official" ? styles.modeBtnActive : ""}`}
                onClick={() => setDisplayStyle("official")}
                title="Ilustración Oficial en Alta Resolución"
              >
                🎨 Oficial HD
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${displayStyle === "model3d" ? styles.modeBtnActive : ""}`}
                onClick={() => setDisplayStyle("model3d")}
                title="Modelo 3D de Pokémon HOME (Soporta Shiny)"
              >
                🧊 Modelo 3D
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${displayStyle === "animated" ? styles.modeBtnActive : ""}`}
                onClick={() => setDisplayStyle("animated")}
                title="Sprite Animado de Batalla"
              >
                👾 Animado
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${displayStyle === "retro" ? styles.modeBtnActive : ""}`}
                onClick={() => setDisplayStyle("retro")}
                title="Pixel Art Clásico 2D"
              >
                🕹️ Retro Pixel
              </button>
              {pokemon.sprites.gen1Retro && (
                <button
                  type="button"
                  className={`${styles.modeBtn} ${displayStyle === "gen1" ? styles.modeBtnActive : ""}`}
                  onClick={() => setDisplayStyle("gen1")}
                  title="Sprite Original GameBoy 1996 (Rojo/Azul)"
                >
                  📼 GameBoy 96
                </button>
              )}
            </div>

            <div className={styles.spriteControls}>
              <button
                type="button"
                className={`${styles.shinyBtn} ${isShiny ? styles.shinyBtnActive : ""}`}
                onClick={() => setIsShiny(!isShiny)}
                id="btn-toggle-shiny"
              >
                <span>✨</span>
                <span>{isShiny ? "Modo Shiny Activo" : "Activar Versión Shiny"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alternate Forms, Megas & Regional Variants */}
      {pokemon.varieties && pokemon.varieties.length > 1 && (
        <div className={styles.sectionRow}>
          <PokemonVarieties
            varieties={pokemon.varieties}
            currentPokemonId={pokemon.id}
          />
        </div>
      )}

      {/* Details Grid: Organisms PokemonTraitsCard + PokemonMatchupsCard */}
      <div className={styles.detailsGrid}>
        <PokemonTraitsCard pokemon={pokemon} />
        <PokemonMatchupsCard types={pokemon.types} />
      </div>

      {/* Organism: PokemonStatsCard */}
      <div className={styles.sectionRow}>
        <PokemonStatsCard stats={pokemon.stats} />
      </div>

      {/* Organism: PokemonZMoves */}
      <div className={styles.sectionRow}>
        <PokemonZMoves pokemonName={pokemon.name} types={pokemon.types} />
      </div>

      {/* Organism: PokemonEvolution */}
      {pokemon.evolutionChain && (
        <div className={styles.sectionRow}>
          <PokemonEvolution
            chain={pokemon.evolutionChain}
            currentPokemonId={pokemon.id}
          />
        </div>
      )}
    </div>
  );
}
