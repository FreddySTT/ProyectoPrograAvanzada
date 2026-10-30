import React from "react";
import { PokemonType } from "@/features/pokemon/types/pokemon.types";
import { calculateTypeMatchups } from "@/features/pokemon/utils/typeMatchups";
import { MatchupChip } from "@/components/molecules/MatchupChip/MatchupChip";
import styles from "./PokemonMatchupsCard.module.css";

interface PokemonMatchupsCardProps {
  types: PokemonType[];
}

export function PokemonMatchupsCard({ types }: PokemonMatchupsCardProps) {
  const matchups = calculateTypeMatchups(types);

  return (
    <div className={styles.detailCard}>
      <h4 className={styles.cardHeading}>Efectividad de Tipos (Defensiva)</h4>

      <div className={styles.matchupBlock}>
        <span className={styles.matchupTitle}>Débil contra (Recibe más daño):</span>
        <div className={styles.matchupChips}>
          {matchups.weaknesses.length > 0 ? (
            matchups.weaknesses.map((w) => (
              <MatchupChip key={w.type} type={w.type} multiplier={w.multiplier} />
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
              <MatchupChip key={r.type} type={r.type} multiplier={r.multiplier} />
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
              <MatchupChip key={imm} type={imm} multiplier={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
