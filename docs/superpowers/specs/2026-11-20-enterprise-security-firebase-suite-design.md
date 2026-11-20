# 🛡️ Especificación de Diseño: Blindaje de Seguridad, Suite Firebase & Supabase

**Fecha:** 2026-11-20  
**Proyecto:** Riqsi Rutas Cochabamba  
**Estado:** Aprobado para ejecución  

---

## 1. Contexto y Objetivos

El usuario solicitó:
1. **Blindaje Total de Seguridad y Puertos:** 
   - Proteger el servidor backend local (`port 5551`) para que no quede expuesto en redes locales o Wi-Fi compartidas (cambiar de `0.0.0.0` a `127.0.0.1`).
   - Permitir que el administrador edite destinos desde Postman de forma segura y exclusiva mediante una clave maestra secreta (`X-Admin-Key` con comparación de tiempo constante `hmac.compare_digest`).
   - Impedir que cualquier persona con solo la URL o en la red pueda realizar peticiones de escritura (`POST`, `PUT`, `DELETE`).
   - Mantener validación estricta de roles para usuarios web (JWT de Supabase/Firebase).
2. **Fase A (Inmediata):**
   - Implementar autenticación con Google (OAuth Popup / Redirect) en `AuthModal`.
   - Integrar Asistente de Rutas Turísticas con Inteligencia Artificial Gemini (Firebase AI Logic).
3. **Fase B (Continuación directa):**
   - Firebase App Check para proteger la app contra bots y scrapers.
   - Firebase Realtime Database para sincronización de alertas viales, climáticas y de atractivos en tiempo real.
   - Refuerzo de Firebase Cloud Storage para subida de fotos con validación de tipos y tamaños.

---

## 2. Arquitectura de Seguridad (Backend Flask)

### A. Cierre de Puertos y Protección de Red
- En `app.py`: cambiar host de `0.0.0.0` a `127.0.0.1` (loopback exclusivo de la máquina del desarrollador). Solo accesible desde localhost, neutralizando ataques desde la red local o Wi-Fi pública.
- CORS restrictivo: permitir cabeceras seguras (`X-Admin-Key`, `Authorization`, `Content-Type`) y validar orígenes permitidos.

### B. Decorador de Acceso Administrativo Híbrido (`@require_admin_access`)
Para endpoints de modificación (`POST /api/places`, `PUT /api/places/<id>`, `DELETE /api/places/<id>`):
1. **Ruta Postman con API Key:**
   - Header: `X-Admin-Key: <ADMIN_API_KEY>`
   - Verificación con `hmac.compare_digest` para prevenir ataques de temporización (timing attacks).
2. **Ruta Web con Bearer JWT:**
   - Header: `Authorization: Bearer <token>`
   - Token emitido por Supabase Auth con rol `admin` verificado criptográficamente.
3. Si ninguna de las dos credenciales válidas está presente, devuelve `401 Unauthorized` o `403 Forbidden` inmediatamente.

---

## 3. Fase A: Autenticación Google y Asistente IA (Gemini)

### A. Autenticación con Google
- En `src/firebase/services.ts`: implementar `firebaseLoginWithGoogle()` usando `GoogleAuthProvider` y `signInWithPopup`.
- En `src/context/AuthContext.tsx`: exponer `loginWithGoogle()`, sincronizando la sesión del usuario en el estado global.
- En `src/components/AuthModal.tsx`: añadir botón corporativo *"Continuar con Google"* con diseño accesible y feedback visual.

### B. Firebase AI Logic (Asistente de Rutas Gemini)
- Componente `AiRouteAdvisorModal.tsx`: permite al turista solicitar itinerarios personalizados según:
  - Presupuesto en Bs. (ej. 20 Bs, 50 Bs, 100+ Bs).
  - Tiempo disponible (1 hora, medio día, día completo).
  - Preferencia (Gastronomía, Historia/Cultura, Aventura, Paisajes).
- Consulta a la API de Gemini vía endpoint backend `/api/ai/recommend-route` o cliente directo, devolviendo un itinerario optimizado con los POIs de Cochabamba.

---

## 4. Fase B: App Check, Realtime DB y Cloud Storage

### A. Firebase Realtime Database (Alertas en Vivo)
- Canal `/alerts/live`: difunde avisos de último minuto (ej. teleférico operando, clima en el Tunari, eventos culturales).
- Componente o banner de alertas sincronizado en milisegundos.

### B. Firebase App Check
- Inicialización condicional en `src/firebase/config.ts` utilizando `ReCaptchaV3Provider` o proveedor de depuración para desarrollo.

### C. Firebase Cloud Storage
- Endpoint/utilidad robusta para subir fotos de atractivos turísticos con verificación de formato (JPEG/PNG/WebP) y límite de 5 MB.

