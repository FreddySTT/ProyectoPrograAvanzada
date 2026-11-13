// ==============================================================================
// Mapbox — Riqsi Rutas
// El token se lee desde VITE_MAPBOX_TOKEN (.env, nunca se commitea).
// NOTA: un token pk.* es público por diseño (viaja al navegador). La protección
// real es restringirlo por URL en el dashboard de Mapbox.
// ==============================================================================

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";
