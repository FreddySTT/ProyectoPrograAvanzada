# 🛡️ Guía de Configuración de Firebase & Seguridad - Riqsi Rutas Cochabamba

Este proyecto cuenta con una integración profesional de **Google Firebase (Authentication & Cloud Firestore)** y un **sistema blindado de seguridad** para proteger el acceso administrativo.

---

## 🚀 1. Configuración de Firebase en 3 Pasos

### Paso 1: Crear el proyecto en la consola de Firebase
1. Ve a [https://console.firebase.google.com](https://console.firebase.google.com/) con tu cuenta de Google.
2. Haz clic en **"Agregar proyecto"** y nómbralo `riqsi-rutas-cbba` (o el nombre que prefieras).
3. Desactiva Google Analytics si quieres una configuración más rápida, o déjalo activo y dale a **Crear**.

### Paso 2: Activar Authentication y Firestore
1. **Autenticación (Firebase Auth):**
   - En el menú lateral, ve a **Compilación > Authentication**.
   - Haz clic en **Comenzar**.
   - En proveedores de acceso, activa **Correo electrónico / Contraseña** y guarda.
2. **Base de Datos (Cloud Firestore):**
   - En el menú lateral, ve a **Compilación > Firestore Database**.
   - Haz clic en **Crear base de datos**.
   - Elige una ubicación cercana (por ejemplo `southamerica-east1` o `us-central1`).
   - Selecciona **Modo de producción**.
   - En la pestaña **Reglas**, pega el contenido del archivo `firestore.rules` incluido en este repositorio y dale a **Publicar**.

### Paso 3: Conectar tus credenciales al proyecto
Hay **dos formas súper fáciles** de conectar tus credenciales:

#### Opción A: Directamente desde la web (Sin tocar código)
1. Inicia la app (`npm run dev`).
2. Presiona <kbd>Ctrl + Shift + A</kbd> o haz clic en el enlace **"🛡️ Portal de Gestión"** en el pie de página.
3. Ve a la pestaña **🔥 Firebase Backend**.
4. Pega tus credenciales (ApiKey, ProjectId, etc.) y haz clic en **"Guardar y Conectar a Firebase"**. ¡La app se recargará conectada a la nube automáticamente!

#### Opción B: Mediante archivo `.env`
Copia el archivo `.env.example` a un nuevo archivo llamado `.env` y completa tus datos:
```env
VITE_FIREBASE_API_KEY=AIzaSyTuClave...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## 🔒 2. Mejoras de Seguridad Implementadas ("Blindaje del Link")

1. **Eliminación de contraseñas visibles y accesos rápidos vulnerables:**
   - Se removieron por completo los botones públicos de demo (`admin/admin` y `123`).
   - Se eliminó la opción de que cualquier usuario elija el rol de "Administrador" al registrarse.
2. **Clave Maestra de Seguridad (PIN de Doble Factor):**
   - Para desbloquear los permisos de administrador se requiere la Clave Maestra:
     **`LLAJTA-2026-SEGURA`** *(puedes cambiarla en `src/context/AuthContext.tsx`)*.
3. **Protección contra ataques de Fuerza Bruta (Rate Limiting):**
   - Tras 5 intentos fallidos consecutivos, el acceso se bloquea automáticamente por 60 segundos con un temporizador activo.
4. **Registro de Auditoría de Seguridad (Security Audit Logs):**
   - Cada intento de acceso, elevación de privilegios, modificación de roles y cierre de sesión se registra con fecha, hora y nivel de alerta.
5. **Ruta y Acceso Oculto:**
   - Acceso al portal mediante:
     - Atajo de teclado: <kbd>Ctrl + Shift + A</kbd> (o <kbd>Cmd + Shift + A</kbd> en Mac).
     - Ruta URL: `#portal-admin` (ejemplo: `http://localhost:5173/#portal-admin`).
     - Botón discreto en el footer de la página.
