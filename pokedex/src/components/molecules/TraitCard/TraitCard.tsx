import React from "react";
import styles from "./TraitCard.module.css";

interface TraitCardProps {
  icon: string;
  label: string;
  value: React.ReactNode;
}

export function TraitCard({ icon, label, value }: TraitCardProps) {
  return (
    <div className={styles.traitItem}>
      <span className={styles.traitIcon}>{icon}</span>
      <div className={styles.traitInfo}>
        <span className={styles.traitLabel}>{label}</span>
        <strong className={styles.traitValue}>{value}</strong>
      </div>
    </div>
  );
}
