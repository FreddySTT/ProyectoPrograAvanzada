"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PokemonVariety, VarietyCategory } from "../../types/pokemon.types";
import styles from "./PokemonVarieties.module.css";

interface PokemonVarietiesProps {
  varieties: PokemonVariety[];
  currentPokemonId: number;
}

const CATEGORY_TAGS: Record<VarietyCategory, { label: string; icon: string; color: string }> = {
  mega: { label: "Mega Evolución", icon: "🧬", color: "#a855f7" },
  alola: { label: "Alola", icon: "🌴", color: "#38bdf8" },
  galar: { label: "Galar", icon: "🛡️", color: "#f43f5e" },
  hisui: { label: "Hisui", icon: "🏔️", color: "#fb923c" },
  paldea: { label: "Paldea", icon: "🐂", color: "#facc15" },
  gmax: { label: "Gigamax", icon: "⚡", color: "#ef4444" },
  alternate: { label: "Forma Alterna", icon: "✨", color: "#10b981" },
};

export function PokemonVarieties({ varieties, currentPokemonId }: PokemonVarietiesProps) {
  // Only show if there are actual alternate forms / megas / regional forms
  if (varieties.length <= 1) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.badge}>FORMAS & MEGAS</span>
          <h4 className={styles.title}>Formas Alternas, Regionales & Megas</h4>
        </div>
        <p className={styles.subtitle}>
          Selecciona una forma para inspeccionar sus atributos, tipos elementales exclusivos y diseño 3D
        </p>
      </div>

      <div className={styles.varietiesGrid}>
        {varieties.map((v) => {
          const isCurrent = v.id === currentPokemonId;
          const tagConfig = CATEGORY_TAGS[v.category] || CATEGORY_TAGS.alternate;

          return (
            <Link
              key={v.id}
              href={`/pokemon/${v.id}`}
              className={`${styles.varietyCard} ${isCurrent ? styles.activeCard : ""}`}
              style={
                {
                  "--tag-color": tagConfig.color,
                } as React.CSSProperties
              }
            >
              <div className={styles.cardTop}>
                <span className={styles.catBadge}>
                  <span>{tagConfig.icon}</span>
                  <span>{v.isDefault ? "Base" : tagConfig.label}</span>
                </span>
                {isCurrent && <span className={styles.activePill}>Actual</span>}
              </div>

              <div className={styles.imgWrap}>
                <Image
                  src={v.artwork}
                  alt={v.displayName}
                  width={110}
                  height={110}
                  unoptimized
                  className={styles.img}
                />
              </div>

              <div className={styles.cardFooter}>
                <strong className={styles.formName}>{v.displayName}</strong>
                <span className={styles.viewLink}>Ver Detalles →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
