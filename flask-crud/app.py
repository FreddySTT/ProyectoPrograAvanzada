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

def create_app(config_class=None):
    """Fábrica de Aplicaciones (Application Factory Pattern)."""
    app = Flask(__name__)

    if config_class is None:
        config_class = get_config()
    app.config.from_object(config_class)

    # 1. CORS configurado
    CORS(app, resources={r"/*": {"origins": "*"}})

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

    # 5. Cabeceras de Seguridad HTTP
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    return app

# Instancia para servidores WSGI (Gunicorn / Waitress) y ejecución directa
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5551))
    print(f"🚀 Iniciando Riqsi Rutas Backend Factory en http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=app.config.get("DEBUG", True))
