"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PokemonDetail } from "../../types/pokemon.types";
import {
  formatPokemonName,
  formatHeight,
  formatWeight,
  formatPokemonId,
} from "../../utils/pokemonFormatters";
import { getPokemonTypeConfig } from "../../utils/pokemonColors";
import { calculateTypeMatchups } from "../../utils/typeMatchups";
import { PokemonTypeBadge } from "../PokemonTypeBadge/PokemonTypeBadge";
import { PokemonStats } from "./PokemonStats";
import { PokemonEvolution } from "./PokemonEvolution";
import { PokemonCryPlayer } from "./PokemonCryPlayer";
import { PokemonZMoves } from "./PokemonZMoves";
import { PokemonVarieties } from "./PokemonVarieties";
import styles from "./PokemonDetailView.module.css";

interface PokemonDetailViewProps {
  pokemon: PokemonDetail;
}

type DisplayStyle = "official" | "model3d" | "animated" | "retro" | "gen1";

export function PokemonDetailView({ pokemon }: PokemonDetailViewProps) {
  const [isShiny, setIsShiny] = useState(false);
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>("official");
  const [lang, setLang] = useState<"es" | "en">("es");

  const primaryType = pokemon.types[0];
  const typeConfig = getPokemonTypeConfig(primaryType);
  const displayName = formatPokemonName(pokemon.name);
  const heightData = formatHeight(pokemon.height);
  const weightData = formatWeight(pokemon.weight);
  const matchups = calculateTypeMatchups(pokemon.types);

  // Preload all shiny & variant images immediately to remove ANY switch delay!
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

  // Determine current active image based on style + shiny toggle
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
      className={styles.pageContainer}
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

            {/* Audio Cry Player */}
            <PokemonCryPlayer cries={pokemon.cries} pokemonName={displayName} />
          </div>

          {/* Hero Right: Multi-Format Sprite & 3D Viewer */}
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

            {/* Style Selector Buttons: HD, 3D Model, Animated, Retro */}
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

            {/* Instant Zero-Delay Shiny Toggle Button */}
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

      {/* Details Grid: Biological Data + Type Matchups */}
      <div className={styles.detailsGrid}>
        {/* Biological Data */}
        <div className={styles.detailCard}>
          <h4 className={styles.cardHeading}>Datos Biológicos</h4>
          <div className={styles.traitGrid}>
            <div className={styles.traitItem}>
              <span className={styles.traitIcon}>📏</span>
              <div className={styles.traitInfo}>
                <span className={styles.traitLabel}>Altura</span>
                <strong className={styles.traitValue}>
                  {heightData.meters} <small>({heightData.feetInches})</small>
                </strong>
              </div>
            </div>

            <div className={styles.traitItem}>
              <span className={styles.traitIcon}>⚖️</span>
              <div className={styles.traitInfo}>
                <span className={styles.traitLabel}>Peso</span>
                <strong className={styles.traitValue}>
                  {weightData.kilograms} <small>({weightData.pounds})</small>
                </strong>
              </div>
            </div>

            <div className={styles.traitItem}>
              <span className={styles.traitIcon}>⭐</span>
              <div className={styles.traitInfo}>
                <span className={styles.traitLabel}>Exp. Base</span>
                <strong className={styles.traitValue}>{pokemon.baseExperience} XP</strong>
              </div>
            </div>

            <div className={styles.traitItem}>
              <span className={styles.traitIcon}>🎯</span>
              <div className={styles.traitInfo}>
                <span className={styles.traitLabel}>Tasa de Captura</span>
                <strong className={styles.traitValue}>{pokemon.species.captureRate}</strong>
              </div>
            </div>

            <div className={styles.traitItem}>
              <span className={styles.traitIcon}>💖</span>
              <div className={styles.traitInfo}>
                <span className={styles.traitLabel}>Felicidad Base</span>
                <strong className={styles.traitValue}>{pokemon.species.baseHappiness}</strong>
              </div>
            </div>

            <div className={styles.traitItem}>
              <span className={styles.traitIcon}>⚧️</span>
              <div className={styles.traitInfo}>
                <span className={styles.traitLabel}>Ratio de Género</span>
                <strong className={styles.traitValue}>
                  {pokemon.species.genderRatio.genderless ? (
                    "Sin Género"
                  ) : (
                    <>
                      <span style={{ color: "#60a5fa" }}>♂ {pokemon.species.genderRatio.male}%</span> /{" "}
                      <span style={{ color: "#f472b6" }}>♀ {pokemon.species.genderRatio.female}%</span>
                    </>
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className={styles.abilitiesSection}>
            <span className={styles.traitLabel}>Habilidades:</span>
            <div className={styles.abilitiesList}>
              {pokemon.abilities.map((a) => (
                <div key={a.name} className={styles.abilityBadge}>
                  <span>{formatPokemonName(a.name)}</span>
                  {a.isHidden && <span className={styles.hiddenTag}>Oculta</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Type Matchups */}
        <div className={styles.detailCard}>
          <h4 className={styles.cardHeading}>Efectividad de Tipos (Defensiva)</h4>

          <div className={styles.matchupBlock}>
            <span className={styles.matchupTitle}>Débil contra (Recibe más daño):</span>
            <div className={styles.matchupChips}>
              {matchups.weaknesses.length > 0 ? (
                matchups.weaknesses.map((w) => (
                  <div key={w.type} className={styles.matchupItem}>
                    <PokemonTypeBadge type={w.type} size="sm" />
                    <span className={styles.multDanger}>{w.multiplier}x</span>
                  </div>
                ))
              ) : (
                <span className={styles.neutralNote}>Sin debilidades notables.</span>
              )}
            </div>
          </div>

          <div className={styles.matchupBlock}>
            <span className={styles.matchupTitle}>Resistente contra (Recibe menos daño):</span>
            <div className={styles.matchupChips}>
              {matchups.resistances.length > 0 ? (
                matchups.resistances.map((r) => (
                  <div key={r.type} className={styles.matchupItem}>
                    <PokemonTypeBadge type={r.type} size="sm" />
                    <span className={styles.multResist}>{r.multiplier}x</span>
                  </div>
                ))
              ) : (
                <span className={styles.neutralNote}>Sin resistencias adicionales.</span>
              )}
            </div>
          </div>

          {matchups.immunities.length > 0 && (
            <div className={styles.matchupBlock}>
              <span className={styles.matchupTitle}>Inmune a (Daño nulo 0x):</span>
              <div className={styles.matchupChips}>
                {matchups.immunities.map((imm) => (
                  <div key={imm} className={styles.matchupItem}>
                    <PokemonTypeBadge type={imm} size="sm" />
                    <span className={styles.multImmune}>0x</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Base Stats Component */}
      <div className={styles.sectionRow}>
        <PokemonStats stats={pokemon.stats} />
      </div>

      {/* Z-Moves & Z-Crystals Section */}
      <div className={styles.sectionRow}>
        <PokemonZMoves
          pokemonName={pokemon.name}
          types={pokemon.types}
        />
      </div>

      {/* Evolution Chain Component */}
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
