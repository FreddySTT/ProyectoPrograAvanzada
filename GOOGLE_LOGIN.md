# Acceso con Google mediante Supabase

## 1. Google Cloud Console

En el proyecto correcto abre Google Auth Platform (o APIs y servicios → Credenciales).
Configura la pantalla de consentimiento y crea un cliente OAuth de tipo Aplicación web.
Si la aplicación está en modo de prueba, agrega los correos de prueba en Audience/Público.

En URI de redireccionamiento autorizados agrega el callback que muestra Supabase en
Authentication → Sign In / Providers → Google. Tiene este formato:

https://<project-ref>.supabase.co/auth/v1/callback

Usa el proyecto realmente configurado en VITE_SUPABASE_URL.
No coloques aquí la dirección de GitHub Pages.

## 2. Supabase

En Authentication → Sign In / Providers → Google habilita el proveedor y guarda el
Client ID y Client Secret de Google. El secreto se guarda solo en Supabase.
En la configuración general de proveedores habilita Allow new users to sign up:
el primer acceso con Google crea una identidad en Auth. Si está desactivado,
Supabase devuelve `signup_disabled`.

En Authentication → URL Configuration configura:

Site URL: https://freddystt.github.io/ProyectoPrograAvanzada/
Redirect URLs:
- https://freddystt.github.io/ProyectoPrograAvanzada/
- http://localhost:5173/

Si Vite usa otro puerto, agrega también su dirección exacta.

## 3. Aplicación y despliegue

Copia .env.example como .env y completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
Mantén VITE_BACKEND=supabase. No agregues el Client Secret ni una clave service_role.
También se admite VITE_BACKEND=dual: Google utiliza Supabase Auth y se conservan
las operaciones del modo combinado del equipo. El botón no aparece en modo firebase.
Ejecuta npm install y npm run dev.

Para GitHub Pages configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en
Settings → Secrets and variables → Actions. El workflow existente ya las utiliza.
Incorpora los cambios a main para desplegar.

## Comprobación

1. Abre Ingresar o Crear cuenta y pulsa Continuar con Google.
2. Elige una cuenta y acepta el acceso. Debes volver a la plataforma con tu nombre.
3. Cierra sesión y comprueba que desaparece el usuario.
4. Cancela el acceso de Google y verifica que puedes volver a intentarlo.
5. Comprueba que el acceso por contraseña anterior sigue funcionando.

Se utiliza el flujo implícito para una SPA con sesión exclusivamente en memoria,
respetando la política de almacenamiento existente. Al recargar o cerrar la página
se pierde la sesión y hay que volver a ingresar. El SDK procesa y elimina del
fragmento de URL los tokens al regresar. No se necesita una ruta de callback del servidor.

La identidad se registra en Supabase Authentication → Users, con rol normal en la
aplicación. No se vincula por correo a las cuentas de la tabla pública users ni se
copian privilegios administrativos. El acceso por contraseña existente conserva
su implementación actual; no se migra a Supabase Auth en este cambio.

Documentación oficial:
https://supabase.com/docs/guides/auth/social-sign-in/auth-google
https://supabase.com/docs/guides/auth/sessions/implicit-flow
