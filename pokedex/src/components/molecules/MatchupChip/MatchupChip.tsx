import React from "react";
import { PokemonType } from "@/features/pokemon/types/pokemon.types";
import { PokemonTypeBadge } from "@/components/atoms/PokemonTypeBadge/PokemonTypeBadge";
import styles from "./MatchupChip.module.css";

interface MatchupChipProps {
  type: PokemonType;
  multiplier: number;
}

export function MatchupChip({ type, multiplier }: MatchupChipProps) {
  let badgeClass = styles.multDanger;
  if (multiplier === 0) badgeClass = styles.multImmune;
  else if (multiplier < 1) badgeClass = styles.multResist;

  return (
    <div className={styles.matchupItem}>
      <PokemonTypeBadge type={type} size="sm" />
      <span className={badgeClass}>{multiplier}x</span>
    </div>
  );
}
