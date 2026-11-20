"""
Configuración de la aplicación Flask por entornos.

Seguridad JWT:
- En TODOS los entornos (dev + prod), los endpoints de escritura exigen Bearer token
  firmado por Supabase Auth (SUPABASE_JWT_SECRET). No hay bypass anónimo.
- ALLOW_DEV_ANON = True SOLO en TestingConfig para que pytest funcione sin Supabase real.
- Para usar Postman: iniciá sesión en el frontend → copiá el access_token de Supabase Auth
  → pegalo como Bearer en Postman.
"""
import os

class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "riqsi-rutas-secret-key-2026")
    SUPABASE_URL = os.environ.get("SUPABASE_URL", os.environ.get("VITE_SUPABASE_URL", "")).rstrip("/")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY", os.environ.get("VITE_SUPABASE_ANON_KEY", ""))
    SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
    # CLAVE MAESTRA DE SEGURIDAD PARA POSTMAN / ADMINISTRACIÓN
    ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "riqsi-admin-freddy-secret-2026")
    # SEGURIDAD: Por defecto NUNCA se permite acceso anónimo.
    # Solo TestingConfig lo habilita para pytest.
    ALLOW_DEV_ANON = False
    PORT = int(os.environ.get("PORT", 5551))
    HOST = os.environ.get("FLASK_HOST", "127.0.0.1")
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True
    # Dev también exige token real de Supabase — no hay bypass.
    # Para sobreescribir localmente: ALLOW_DEV_ANON=true en .env (no recomendado)
    ALLOW_DEV_ANON = os.environ.get("ALLOW_DEV_ANON", "false").lower() in ("true", "1", "yes")

class TestingConfig(Config):
    TESTING = True
    # ÚNICO entorno donde se permite bypass anónimo — exclusivo para pytest.
    ALLOW_DEV_ANON = True
    # Deshabilitar Supabase en tests para usar solo PLACES_FALLBACK en memoria
    SUPABASE_URL = ""
    SUPABASE_KEY = ""
    SUPABASE_JWT_SECRET = ""

class ProductionConfig(Config):
    DEBUG = False
    ALLOW_DEV_ANON = False

def get_config():
    env = os.environ.get("FLASK_ENV", "development").lower()
    if env == "production":
        return ProductionConfig
    elif env == "testing":
        return TestingConfig
    return DevelopmentConfig

