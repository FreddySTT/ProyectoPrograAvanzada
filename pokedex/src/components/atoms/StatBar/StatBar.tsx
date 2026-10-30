import React from "react";
import styles from "./StatBar.module.css";

interface StatBarProps {
  percentage: number;
  color: string;
}

export function StatBar({ percentage, color }: StatBarProps) {
  return (
    <div className={styles.barTrack}>
      <div
        className={styles.barFill}
        style={{
          width: `${Math.min(100, Math.max(0, percentage))}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}80`,
        }}
      />
    </div>
  );
}
