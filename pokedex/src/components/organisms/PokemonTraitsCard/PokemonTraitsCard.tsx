import React from "react";
import { PokemonDetail } from "@/features/pokemon/types/pokemon.types";
import { formatHeight, formatWeight, formatPokemonName } from "@/features/pokemon/utils/pokemonFormatters";
import { TraitCard } from "@/components/molecules/TraitCard/TraitCard";
import styles from "./PokemonTraitsCard.module.css";

interface PokemonTraitsCardProps {
  pokemon: PokemonDetail;
}

export function PokemonTraitsCard({ pokemon }: PokemonTraitsCardProps) {
  const heightData = formatHeight(pokemon.height);
  const weightData = formatWeight(pokemon.weight);

  return (
    <div className={styles.detailCard}>
      <h4 className={styles.cardHeading}>Datos Biológicos</h4>
      <div className={styles.traitGrid}>
        <TraitCard
          icon="📏"
          label="Altura"
          value={
            <>
              {heightData.meters} <small>({heightData.feetInches})</small>
            </>
          }
        />
        <TraitCard
          icon="⚖️"
          label="Peso"
          value={
            <>
              {weightData.kilograms} <small>({weightData.pounds})</small>
            </>
          }
        />
        <TraitCard
          icon="⭐"
          label="Exp. Base"
          value={`${pokemon.baseExperience} XP`}
        />
        <TraitCard
          icon="🎯"
          label="Tasa de Captura"
          value={pokemon.species.captureRate}
        />
        <TraitCard
          icon="💖"
          label="Felicidad Base"
          value={pokemon.species.baseHappiness}
        />
        <TraitCard
          icon="⚧️"
          label="Ratio de Género"
          value={
            pokemon.species.genderRatio.genderless ? (
              "Sin Género"
            ) : (
              <>
                <span style={{ color: "#60a5fa" }}>♂ {pokemon.species.genderRatio.male}%</span> /{" "}
                <span style={{ color: "#f472b6" }}>♀ {pokemon.species.genderRatio.female}%</span>
              </>
            )
          }
        />
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
  );
}
