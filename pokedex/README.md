# ⚡ Pokédex Next.js — Screaming Architecture & Virtual Scroll

Aplicación web de alto rendimiento construida con **Next.js 16 (App Router)**, **TypeScript** y **Vanilla CSS**, aplicando **Screaming Architecture** (Clean Architecture orientada a características de dominio) y un motor de **Virtual Scroll** propio (sin librerías externas) capaz de renderizar los **1,025 Pokémon** de la base de datos nacional a 60 FPS constantes.

---

## 🏛️ Screaming Architecture (Estructura de Dominio)

La arquitectura "grita" el dominio del negocio (**Pokédex / Pokémon**) en lugar de detalles técnicos del framework:

```
pokedex/
├── src/
│   ├── app/                                    # Mecanismo de entrega (Next.js App Router)
│   │   ├── layout.tsx                          # Layout raíz con Rotom Dex Header & Fuentes
│   │   ├── page.tsx                            # Vista de lista Pokédex (conecta con feature pokemon)
│   │   ├── pokemon/
│   │   │   └── [id]/
│   │   │       └── page.tsx                    # Vista dinámica de detalle (conecta con feature pokemon)
│   │   ├── globals.css                         # Tema cyberpunk oscuro y scrollbars de neón
│   │   └── not-found.tsx                       # Página 404 personalizada para Pokémon inexistentes
│   │
│   ├── features/
│   │   └── pokemon/                            # 🔴 NÚCLEO DE DOMINIO: POKÉMON
│   │       ├── types/
│   │       │   └── pokemon.types.ts            # Tipos de dominio (PokemonDetail, Types, Stats, etc.)
│   │       ├── services/
│   │       │   └── pokeApi.ts                  # Capa de servicio PokéAPI con caché en memoria
│   │       ├── utils/
│   │       │   ├── pokemonColors.ts            # 18 tipos elementales, gradientes y glows
│   │       │   ├── pokemonFormatters.ts        # Formateadores (#0025, kg, m, tiers de stats)
│   │       │   └── typeMatchups.ts             # Matriz de efectividad (debilidades y resistencias)
│   │       ├── hooks/
│   │       │   └── usePokemonList.ts           # Hook de estado reactivo, búsqueda y filtros
│   │       └── components/
│   │           ├── PokemonCard/                # Tarjeta 3D con audio preview y artwork
│   │           ├── PokemonGrid/                # Grid virtualizado de alta tasa de refresco
│   │           ├── PokemonFilters/             # Búsqueda instantánea, selector de Gen y filtros de tipo
│   │           ├── PokemonTypeBadge/           # Chips elementales con brillo de neón
│   │           └── PokemonDetail/
│   │               ├── PokemonDetailView.tsx   # Vista de detalle con Hero y lore
│   │               ├── PokemonStats.tsx        # Medidores de estadísticas base y totales
│   │               ├── PokemonEvolution.tsx    # Árbol de cadena evolutiva interactivo
│   │               └── PokemonCryPlayer.tsx    # Reproductor de rugidos oficiales (Moderno y Retro)
│   │
│   └── shared/                                 # Componentes y utilidades transversales
│       ├── components/
│       │   ├── Header/                         # Rotom Dex Header con lentes LED animados
│       │   └── VirtualScroll/
│       │       └── useVirtualGrid.ts           # Motor de Virtual Scroll reactivo sin dependencias
```

---

## 🚀 Características Principales

1. **Virtual Scroll Zero-Dependencies**:
   - Renderiza únicamente los elementos visibles en el viewport + 2 filas de margen (*overscan*).
   - Recalcula columnas automáticamente según el ancho de pantalla (responsive de 1 a 6 columnas).
   - Sin librerías externas pesadas: implementado puramente con `ResizeObserver` y `requestAnimationFrame`.
2. **Página de Detalle Dinámica (`/pokemon/[id]`)**:
   - **Hero Visual**: Artwork oficial en alta resolución con opción para alternar entre **Versión Normal** y **Versión Shiny**.
   - **Reproductor de Rugidos (PokéAPI Cries)**: Reproduce el audio oficial de la especie con selector entre versión moderna y versión clásica/retro de 8-bits con animación de ecualizador de ondas.
   - **Datos Biológicos**: Altura, peso, ratio de género (macho/hembra/sin género), tasa de captura y experiencia base.
   - **Efectividad de Tipos en Tiempo Real**: Cálculo automático de debilidades (2x, 4x), resistencias (0.5x, 0.25x) e inmunidades (0x).
   - **Medidores de Estadísticas**: Barras animadas codificadas por colores según el nivel de cada estadística (PS, Ataque, Defensa, Atq. Esp, Def. Esp, Velocidad) y suma total de atributos.
   - **Línea Evolutiva Interactiva**: Muestra la evolución previa y siguiente con los requisitos de nivel o piedra, permitiendo navegar entre ellas con un clic.
3. **Filtros Avanzados**:
   - Búsqueda en tiempo real por nombre o número (`#0025` o `pikachu`).
   - Salto rápido por generaciones (Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea).
   - Selector por los 18 tipos elementales (Fuego, Agua, Planta, Dragón, etc.).
   - Botón de **Pokémon Aleatorio** para descubrir nuevas criaturas.

---

## 🛠️ Cómo Ejecutar el Proyecto

```bash
# 1. Entrar en la carpeta del proyecto
cd pokedex

# 2. Iniciar el servidor de desarrollo
npm run dev

# 3. O compilar para producción
npm run build
npm run start
```

Abre en tu navegador: [http://localhost:3001](http://localhost:3001) o [http://localhost:3000](http://localhost:3000).
