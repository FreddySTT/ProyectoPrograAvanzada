"""
Configuración de la aplicación Flask por entornos.
"""
import os

class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "riqsi-rutas-secret-key-2026")
    SUPABASE_URL = os.environ.get("SUPABASE_URL", os.environ.get("VITE_SUPABASE_URL", "")).rstrip("/")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY", os.environ.get("VITE_SUPABASE_ANON_KEY", ""))
    SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
    ALLOW_DEV_ANON = os.environ.get("ALLOW_DEV_ANON", "true").lower() in ("true", "1", "yes")
    PORT = int(os.environ.get("PORT", 5551))
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
    ALLOW_DEV_ANON = True

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
