import React from "react";
import { PokemonStat } from "@/features/pokemon/types/pokemon.types";
import { StatRow } from "@/components/molecules/StatRow/StatRow";
import styles from "./PokemonStatsCard.module.css";

interface PokemonStatsCardProps {
  stats: PokemonStat[];
}

export function PokemonStatsCard({ stats }: PokemonStatsCardProps) {
  const totalStats = stats.reduce((acc, s) => acc + s.baseStat, 0);

  return (
    <div className={styles.statsContainer}>
      <div className={styles.header}>
        <h4 className={styles.title}>Estadísticas Base</h4>
        <div className={styles.totalBadge}>
          <span>Total:</span>
          <strong>{totalStats}</strong>
        </div>
      </div>

      <div className={styles.statsList}>
        {stats.map((stat) => (
          <StatRow key={stat.name} stat={stat} />
        ))}
      </div>

      <div className={styles.statsFooter}>
        <span className={styles.tierDot} style={{ background: "#f87171" }} /> &lt;50 Bajo
        <span className={styles.tierDot} style={{ background: "#fbbf24", marginLeft: "8px" }} /> 50-79 Medio
        <span className={styles.tierDot} style={{ background: "#34d399", marginLeft: "8px" }} /> 80-109 Bueno
        <span className={styles.tierDot} style={{ background: "#60a5fa", marginLeft: "8px" }} /> 110-139 Alto
        <span className={styles.tierDot} style={{ background: "#c084fc", marginLeft: "8px" }} /> 140+ Élite
      </div>
    </div>
  );
}
