import React from "react";
import { PokemonStat } from "../../types/pokemon.types";
import { STAT_NAMES_ES, getStatRatingColor } from "../../utils/pokemonFormatters";
import styles from "./PokemonStats.module.css";

interface PokemonStatsProps {
  stats: PokemonStat[];
}

export function PokemonStats({ stats }: PokemonStatsProps) {
  const totalStats = stats.reduce((acc, s) => acc + s.baseStat, 0);
  const maxStatCap = 255; // Max theoretical single base stat in Pokémon (e.g. Blissey HP = 255)

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
        {stats.map((stat) => {
          const config = STAT_NAMES_ES[stat.name] || {
            label: stat.name,
            short: stat.name.toUpperCase(),
          };
          const percentage = Math.min(100, Math.round((stat.baseStat / maxStatCap) * 100));
          const color = getStatRatingColor(stat.baseStat);

          return (
            <div key={stat.name} className={styles.statRow}>
              <div className={styles.statLabelBox}>
                <span className={styles.statShort}>{config.short}</span>
                <span className={styles.statFull}>{config.label}</span>
              </div>

              <div className={styles.statValueBox}>
                <strong style={{ color }}>{stat.baseStat}</strong>
              </div>

              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}80`,
                  }}
                />
              </div>
            </div>
          );
        })}
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
