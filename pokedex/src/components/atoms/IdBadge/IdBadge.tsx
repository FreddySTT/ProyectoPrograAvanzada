import React from "react";
import styles from "./IdBadge.module.css";

interface IdBadgeProps {
  idText: string;
  variant?: "primary" | "secondary";
}

export function IdBadge({ idText, variant = "primary" }: IdBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {idText}
    </span>
  );
}
