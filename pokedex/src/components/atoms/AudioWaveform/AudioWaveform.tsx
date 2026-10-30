import React from "react";
import styles from "./AudioWaveform.module.css";

interface AudioWaveformProps {
  isPlaying: boolean;
}

export function AudioWaveform({ isPlaying }: AudioWaveformProps) {
  return (
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
  );
}
