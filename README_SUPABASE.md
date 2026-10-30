# Riqsi Rutas — Supabase Backend Setup

Esta guía explica cómo conectar el proyecto a **Supabase** (reemplazando Firebase por completo).

---

## 1. Crear el proyecto en Supabase

1. Ve a [app.supabase.com](https://app.supabase.com) e inicia sesión.
2. Crea un nuevo proyecto (elige la región más cercana a Bolivia, ej. São Paulo).
3. Anota tu **Project URL** y **anon public key** (están en *Settings → API*).

---

## 2. Configurar variables de entorno

Copia el archivo de ejemplo y rellena tus valores:

```bash
cp .env.example .env
```

`.env` (NO lo subas a Git, ya está en `.gitignore`):

```
VITE_SUPABASE_URL=https://XXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

---

## 3. Ejecutar el esquema SQL

En el **SQL Editor** de Supabase, corre el archivo:

```
supabase_schema.sql
```

Esto crea las tablas `places`, `announcements`, `app_users` y `security_logs` con
índices y políticas RLS activadas.

---

## 4. Arrancar el proyecto

```bash
npm run dev:vite
```

Si `VITE_SUPABASE_URL` está configurado, el indicador en el Panel Admin mostrará
**🟢 Supabase Cloud**. Sin configurar, funciona en modo local (localStorage).

---

## 5. Exportar / Importar datos (JSON Engine)

En el Panel Admin → 🛡️ Seguridad verás el **JSON Engine**:

- **Exportar** → descarga un `.json` con todos los lugares, anuncios y usuarios.
- **Importar** → sube un `.json` y sincroniza todo con Supabase.

---

## 6. Seguridad

- Las contraseñas se guardan como **hashes SHA-256 con salt**. Nunca en texto plano.
- El admin nunca puede ver contraseñas en texto plano — ni en la UI ni en la base de datos.
- La clave maestra para elevar privilegios de administrador **no está en ningún archivo de código**.
  Solo el dueño del proyecto la conoce.
- RLS (Row Level Security) activo en todas las tablas de Supabase.

---

## 7. Supabase Realtime

Las actualizaciones en tiempo real se activan automáticamente mediante canales de Supabase.
Sin conexión, el sistema cae a polling cada 30 segundos desde localStorage.

---

*Proyecto: Riqsi Rutas Cochabamba — Migrado a Supabase en octubre 2026.*
