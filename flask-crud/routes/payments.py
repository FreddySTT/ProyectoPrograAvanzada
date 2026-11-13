"""
Blueprint para Pasarela de Pagos, Cotización en Servidor y Reservas Idempotentes.
"""
from flask import Blueprint, jsonify, request, current_app
from pydantic import ValidationError
from models.schemas import CheckoutSchema
from core.errors import make_problem_response

payments_bp = Blueprint("payments_bp", __name__, url_prefix="/api/payments")

@payments_bp.route("/quote", methods=["POST"])
def cotizar_tarifa():
    """Calcula y devuelve el desglose de tarifas oficial directamente desde el servidor."""
    raw_data = request.get_json(silent=True) or {}
    payment_service = current_app.extensions["payment_service"]

    desglose = payment_service.calcular_tarifa_servidor(
        lugar_id=raw_data.get("lugar_id", "place-1"),
        pasajeros=max(int(raw_data.get("pasajeros", 1)), 1),
        incluir_guia=bool(raw_data.get("incluir_guia")),
        incluir_transporte=bool(raw_data.get("incluir_transporte")),
        incluir_almuerzo=bool(raw_data.get("incluir_almuerzo")),
        cupon=raw_data.get("cupon_descuento"),
    )

    return jsonify({"ok": True, "tarifa": desglose})

@payments_bp.route("/checkout", methods=["POST"])
def checkout_pago():
    """
    Procesa el pago con validación Pydantic, cálculo en servidor y soporte de Idempotencia.
    Cabecera opcional: Idempotency-Key
    """
    raw_data = request.get_json(silent=True) or {}

    # Soporte retrocompatible si el frontend envía campos alternativos
    if "experiencia" not in raw_data and "lugar_nombre" in raw_data:
        raw_data["experiencia"] = raw_data["lugar_nombre"]

    try:
        validated = CheckoutSchema(**raw_data)
    except ValidationError as err:
        return make_problem_response(422, "Unprocessable Entity", "Fallo de validación en datos de reserva/pago", err.errors())

    idempotency_key = request.headers.get("Idempotency-Key") or request.headers.get("X-Idempotency-Key")

    payment_service = current_app.extensions["payment_service"]
    res, status_code = payment_service.procesar_checkout(
        datos=validated.model_dump(),
        idempotency_key=idempotency_key,
    )

    return jsonify(res), status_code

@payments_bp.route("/reservas", methods=["GET"])
def listar_reservas():
    payment_service = current_app.extensions["payment_service"]
    return jsonify({
        "ok": True,
        "total": len(payment_service.reservas_memoria),
        "data": payment_service.reservas_memoria,
    })
