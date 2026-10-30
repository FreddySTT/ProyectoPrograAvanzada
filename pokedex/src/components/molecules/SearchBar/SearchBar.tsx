import React from "react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar por nombre o número (#0025)...",
}: SearchBarProps) {
  return (
    <div className={styles.searchBox}>
      <span className={styles.searchIcon}>🔍</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.searchInput}
        id="pokemon-search-input"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className={styles.clearBtn}
          type="button"
          title="Limpiar búsqueda"
        >
          ✕
        </button>
      )}
    </div>
  );
}
