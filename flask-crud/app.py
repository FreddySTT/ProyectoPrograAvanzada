"""
Flask Backend API — Riqsi Rutas Enterprise Edition
Arquitectura: Application Factory + Blueprints + Pydantic v2 + POO + Dijkstra + JWT Auth.
"""
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

from config import get_config
from core.errors import register_error_handlers
from core.dijkstra import GrafoRutasDijkstra
from models.user import GestorUsuarios
from models.database import SupabaseBridge
from services.payment_service import PaymentService

from routes.health import health_bp
from routes.users import users_bp
from routes.places import places_bp
from routes.dijkstra import dijkstra_bp
from routes.payments import payments_bp
from routes.docs import docs_bp
from routes.ai import ai_bp

def create_app(config_class=None):
    """Fábrica de Aplicaciones (Application Factory Pattern)."""
    # 0. Sentry Observability (opcional si SENTRY_DSN está configurado)
    sentry_dsn = os.environ.get("SENTRY_DSN")
    if sentry_dsn:
        try:
            import sentry_sdk
            from sentry_sdk.integrations.flask import FlaskIntegration
            sentry_sdk.init(
                dsn=sentry_dsn,
                integrations=[FlaskIntegration()],
                traces_sample_rate=0.2,
                profiles_sample_rate=0.1,
            )
        except Exception as e:
            print(f"⚠️ Sentry no pudo inicializarse: {e}")

    app = Flask(__name__)

    if config_class is None:
        config_class = get_config()
    app.config.from_object(config_class)

    # 1. CORS configurado para comunicación segura y cabeceras de administración
    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        allow_headers=["Content-Type", "Authorization", "X-Admin-Key", "X-Dev-Role"],
        expose_headers=["Content-Type", "X-Admin-Key", "Authorization"]
    )

    # 2. Manejo uniforme de errores RFC-7807
    register_error_handlers(app)

    # 3. Inicializar e inyectar dependencias y servicios de dominio
    supabase_url = app.config.get("SUPABASE_URL", "")
    supabase_key = app.config.get("SUPABASE_KEY", "")

    supabase_bridge = SupabaseBridge(supabase_url, supabase_key)
    gestor_usuarios = GestorUsuarios()
    grafo_rutas = GrafoRutasDijkstra()
    payment_service = PaymentService(supabase_bridge)

    app.extensions["supabase_bridge"] = supabase_bridge
    app.extensions["gestor_usuarios"] = gestor_usuarios
    app.extensions["grafo_rutas"] = grafo_rutas
    app.extensions["payment_service"] = payment_service

    # 4. Registrar Blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(places_bp)
    app.register_blueprint(dijkstra_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(docs_bp)
    app.register_blueprint(ai_bp)

    # 5. Cabeceras de Seguridad HTTP Enterprise
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(self)"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
        return response

    return app

# Instancia para servidores WSGI (Gunicorn / Waitress) y ejecución directa
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5551))
    # Seguridad de puertos: bind exclusivo a 127.0.0.1 (loopback) para que NO quede expuesto en la red local o Wi-Fi
    bind_host = os.environ.get("FLASK_HOST", "127.0.0.1")
    print(f"🚀 Iniciando Riqsi Rutas Backend Seguro en http://{bind_host}:{port} (Loopback Protegido)")
    app.run(host=bind_host, port=port, debug=app.config.get("DEBUG", True))
