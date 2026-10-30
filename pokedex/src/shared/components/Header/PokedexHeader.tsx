"use client";

import React from "react";
import Link from "next/link";
import styles from "./PokedexHeader.module.css";

export function PokedexHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        {/* Classic Pokédex Sensor Lenses */}
        <div className={styles.sensorCluster}>
          <div className={styles.bigBlueSensor}>
            <div className={styles.blueLensInner} />
          </div>
          <div className={styles.smallLeds}>
            <span className={`${styles.led} ${styles.ledRed}`} />
            <span className={`${styles.led} ${styles.ledYellow}`} />
            <span className={`${styles.led} ${styles.ledGreen}`} />
          </div>
        </div>

        {/* Brand & Title */}
        <div className={styles.brand}>
          <Link href="/" className={styles.titleLink}>
            <span className={styles.brandBadge}>ROTOM DEX v2.6</span>
            <h1 className={styles.mainTitle}>
              POKÉDEX <span className={styles.highlight}>NEXT</span>
            </h1>
          </Link>
          <p className={styles.tagline}>
            Base de datos nacional de 1,025 Pokémon con Virtual Scroll de 60 FPS y Screaming Architecture
          </p>
        </div>

        {/* Links & Quick Actions */}
        <div className={styles.linksCluster}>
          <a
            href="https://github.com/FreddySTT/Portafolio-Freddy"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.portfolioLink}
          >
            <span>GitHub Portafolio</span>
            <span className={styles.extIcon}>↗</span>
          </a>
        </div>
      </div>
      <div className={styles.accentLine} />
    </header>
  );
}
