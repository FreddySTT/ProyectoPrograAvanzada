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

# Argumentos de compilación opcionales para Supabase
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_BASE_PATH=/
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_BASE_PATH=$VITE_BASE_PATH

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
