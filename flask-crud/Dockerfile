# ==============================================================================
# Dockerfile Backend — Riqsi Rutas (Python 3.12 Flask + Gunicorn)
# ==============================================================================
FROM python:3.12-slim AS base

# Evitar escritura de archivos .pyc y habilitar buffering inmediato
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000 \
    FLASK_ENV=production

WORKDIR /app

# Instalar dependencias del sistema mínimas requeridas y curl para healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependencias e instalar con pip cache limpio
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Crear usuario sin privilegios por seguridad
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser:appuser /app
USER appuser

# Copiar código fuente
COPY --chown=appuser:appuser . .

# Exponer puerto
EXPOSE 5000

# Verificación de salud (Healthcheck)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Servidor WSGI de grado de producción (Gunicorn)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4", "--timeout", "60", "app:app"]
