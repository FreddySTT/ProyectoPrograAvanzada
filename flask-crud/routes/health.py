"""
Blueprint de Información del Servicio y Health Check.
"""
from datetime import datetime
from flask import Blueprint, jsonify, current_app

health_bp = Blueprint("health_bp", __name__)

@health_bp.route("/")
def index():
    supabase_bridge = current_app.extensions["supabase_bridge"]
    return jsonify({
        "servicio": "Riqsi Rutas — Flask Backend Enterprise (POO + Pydantic + JWT)",
        "version": "3.5-production",
        "status": "online",
        "supabase_conectado": supabase_bridge.is_configured,
        "modulos": {
            "poo_usuarios": "Clase Usuario + GestorUsuarios",
            "dijkstra": "Clase GrafoRutasDijkstra (Cálculo de trayectos óptimos)",
            "pagos_qr": "PaymentService (Cálculo en servidor + Idempotencia)",
            "jwt_auth": "@require_role y @require_auth con decodificación de JWT",
            "pydantic": "Validación de esquemas con Pydantic v2",
        },
        "endpoints": [
            "GET    /health",
            "GET    /api/users",
            "POST   /api/users",
            "GET    /api/places",
            "GET    /api/places/<id>",
            "POST   /api/places",
            "PUT    /api/places/<id>",
            "DELETE /api/places/<id>",
            "GET    /api/routes/nodes",
            "POST   /api/routes/dijkstra",
            "POST   /api/payments/checkout",
            "GET    /api/payments/reservas",
        ],
    })

@health_bp.route("/health")
def health():
    gestor = current_app.extensions["gestor_usuarios"]
    payment_service = current_app.extensions["payment_service"]
    supabase_bridge = current_app.extensions["supabase_bridge"]

    return jsonify({
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "supabase_configured": supabase_bridge.is_configured,
        "usuarios_en_memoria": gestor.cantidad(),
        "reservas_procesadas": len(payment_service.reservas_memoria),
    })
