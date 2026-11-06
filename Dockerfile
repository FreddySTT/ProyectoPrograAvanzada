# ==============================================================================
# Dockerfile Frontend — Riqsi Rutas (Multi-Stage Build Node 22 + Nginx Alpine)
# ==============================================================================

# Etapa 1: Construcción (Builder)
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias limpias
RUN npm ci

# Copiar el código fuente
COPY . .

# ── Argumentos de compilación ──────────────────────────────────────────────────
# Supabase
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_BASE_PATH=/

# Switch de backend: "supabase" (default) o "firebase"
ARG VITE_BACKEND=supabase

# Firebase (sólo necesarias cuando VITE_BACKEND=firebase)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_BASE_PATH=$VITE_BASE_PATH \
    VITE_BACKEND=$VITE_BACKEND \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# Compilar para producción con Vite
RUN npm run build

# Etapa 2: Servidor Web de Producción con Nginx
FROM nginx:1.27-alpine AS production

# Eliminar configuración por defecto de Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada con proxy a /api/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados desde la etapa builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Healthcheck frontend
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
