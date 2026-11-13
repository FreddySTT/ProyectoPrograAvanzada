# Por qué la API key de Mapbox no se sube a GitHub

## Resumen

El token de Mapbox (`pk.*`) **no debe commitearse** en este repositorio. GitHub
lo rechaza automáticamente y, aunque se pudiera, es la práctica incorrecta.
Afortunadamente el proyecto **no lo necesita**: funciona sin token.

## Qué pasó al intentarlo

Al hacer `git push` con el token en `src/config/mapbox.ts`, GitHub rechazó el
push con **GH013 — Push Protection**:

```
- Push cannot contain secrets
- Mapbox Secret Access Token — src/config/mapbox.ts:10
```

El repo tiene **secret scanning + push protection** activados: GitHub detecta
tokens de servicios conocidos (Mapbox, AWS, Stripe, etc.) y bloquea el push
antes de que el secreto quede expuesto.

## Cómo funciona el mapa sin token

`src/components/MapView.tsx` tiene un **fallback a OpenStreetMap**: si
`VITE_MAPBOX_TOKEN` está vacío, el mapa usa tiles raster de OSM y todo sigue
funcionando (marcadores, filtros, rutas visuales).

- **Sin configurar nada** → mapa OpenStreetMap (cualquiera que clone el repo).
- **Con `VITE_MAPBOX_TOKEN` en `.env`** → mapa Mapbox `streets-v12` + Directions
  API para rutas reales por calle.

## Cómo configurar el token localmente

1. Crear cuenta gratis en <https://account.mapbox.com> → Tokens → copiar el
   `pk.*` público.
2. Crear `.env` en la raíz (ya está en `.gitignore`, nunca se sube):

   ```
   VITE_MAPBOX_TOKEN=pk.tu-token-aqui
   ```

3. `npm run dev` — Vite lo inyecta automáticamente.

## Notas de seguridad

- Los tokens `pk.*` son **públicos por diseño** (viajan al navegador), pero
  igual no se commitean: la protección real es **restringir el token por URL**
  en el dashboard de Mapbox (Settings → Tokens → URL restrictions).
- Nunca usar tokens `sk.*` (secretos) en frontend — esos sí son credenciales
  reales y solo deben vivir en backend/`.env` locales.
