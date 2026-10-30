"use client";

import React, { useState, useRef } from "react";
import { PokemonCry } from "../../types/pokemon.types";
import styles from "./PokemonCryPlayer.module.css";

interface PokemonCryPlayerProps {
  cries: PokemonCry;
  pokemonName: string;
}

export function PokemonCryPlayer({ cries, pokemonName }: PokemonCryPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cryType, setCryType] = useState<"latest" | "legacy">("latest");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeAudioUrl = cryType === "latest" ? cries.latest : cries.legacy || cries.latest;

  const handlePlay = () => {
    if (!activeAudioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(activeAudioUrl);
    audioRef.current = audio;
    audio.volume = 0.5;

    setIsPlaying(true);
    audio.play().catch(() => setIsPlaying(false));

    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
  };

  if (!cries.latest && !cries.legacy) return null;

  return (
    <div className={styles.cryContainer}>
      <div className={styles.cryHeader}>
        <span className={styles.cryTitle}>🔊 Rugido Oficial (PokéAPI Cry)</span>
        {cries.legacy && cries.latest && (
          <div className={styles.toggleButtons}>
            <button
              type="button"
              className={`${styles.typeBtn} ${cryType === "latest" ? styles.typeBtnActive : ""}`}
              onClick={() => {
                setCryType("latest");
                setIsPlaying(false);
              }}
            >
              Moderno
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${cryType === "legacy" ? styles.typeBtnActive : ""}`}
              onClick={() => {
                setCryType("legacy");
                setIsPlaying(false);
              }}
            >
              Retro (Clásico)
            </button>
          </div>
        )}
      </div>

      <div className={styles.playerBar}>
        <button
          type="button"
          onClick={handlePlay}
          className={`${styles.playBtn} ${isPlaying ? styles.playBtnActive : ""}`}
          title={`Reproducir rugido de ${pokemonName}`}
        >
          {isPlaying ? "⏸ Detener" : "▶ Reproducir"}
        </button>

        <div className={`${styles.waveform} ${isPlaying ? styles.waveformActive : ""}`}>
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </div>
      </div>
    </div>
  );
}
