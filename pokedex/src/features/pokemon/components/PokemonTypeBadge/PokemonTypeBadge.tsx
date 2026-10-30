import React from "react";
import { PokemonType } from "../../types/pokemon.types";
import { getPokemonTypeConfig } from "../../utils/pokemonColors";
import styles from "./PokemonTypeBadge.module.css";

interface PokemonTypeBadgeProps {
  type: PokemonType;
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function PokemonTypeBadge({
  type,
  size = "md",
  clickable = false,
  selected = false,
  onClick,
}: PokemonTypeBadgeProps) {
  const config = getPokemonTypeConfig(type);

  return (
    <span
      className={`${styles.badge} ${styles[size]} ${clickable ? styles.clickable : ""} ${
        selected ? styles.selected : ""
      }`}
      style={
        {
          "--type-color": config.primary,
          "--type-glow": config.glow,
          "--type-gradient": config.gradient,
        } as React.CSSProperties
      }
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={`Tipo ${config.nameEs}`}
    >
      <span className={styles.icon}>{config.icon}</span>
      <span className={styles.label}>{config.nameEs}</span>
    </span>
  );
}
