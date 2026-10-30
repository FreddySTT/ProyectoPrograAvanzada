import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { PokedexHeader } from "@/shared/components/Header/PokedexHeader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pokédex Nacional // Next.js & Screaming Architecture",
  description:
    "Pokédex interactiva de 1,025 Pokémon con Virtual Scroll personalizado de alto rendimiento, rugidos oficiales de PokéAPI y páginas de detalle completas.",
  keywords: ["Pokemon", "Pokedex", "Next.js", "Virtual Scroll", "Screaming Architecture", "PokeAPI"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <div className="pokedex-app-wrapper">
          <PokedexHeader />
          <div className="pokedex-content-container">{children}</div>
          <footer className="pokedex-footer">
            <div className="footer-content">
              <p>
                <strong>Pokédex Next.js</strong> — Diseñada con Screaming Architecture & Virtual Scroll personalizada.
              </p>
              <p className="footer-sub">
                Datos y audios proporcionados por PokéAPI v2. Creado para el portafolio de Freddy STT.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
