import React from "react";
import { PokemonStat } from "@/features/pokemon/types/pokemon.types";
import { STAT_NAMES_ES, getStatRatingColor } from "@/features/pokemon/utils/pokemonFormatters";
import { StatBar } from "@/components/atoms/StatBar/StatBar";
import styles from "./StatRow.module.css";

interface StatRowProps {
  stat: PokemonStat;
  maxCap?: number;
}

export function StatRow({ stat, maxCap = 255 }: StatRowProps) {
  const config = STAT_NAMES_ES[stat.name] || {
    label: stat.name,
    short: stat.name.toUpperCase(),
  };
  const percentage = Math.min(100, Math.round((stat.baseStat / maxCap) * 100));
  const color = getStatRatingColor(stat.baseStat);

  return (
    <div className={styles.statRow}>
      <div className={styles.statLabelBox}>
        <span className={styles.statShort}>{config.short}</span>
        <span className={styles.statFull}>{config.label}</span>
      </div>

      <div className={styles.statValueBox}>
        <strong style={{ color }}>{stat.baseStat}</strong>
      </div>

      <div className={styles.statBarWrap}>
        <StatBar percentage={percentage} color={color} />
      </div>
    </div>
  );
}
