"""
Blueprint para CRUD de Atractivos Turísticos (Validación Pydantic + Edición Completa + Fallback Dual).
"""
import uuid
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app
from pydantic import ValidationError
from models.schemas import PlaceSchema
from models.database import PLACES_FALLBACK
from core.auth import require_role
from core.errors import make_problem_response

places_bp = Blueprint("places_bp", __name__, url_prefix="/api/places")

def normalizar_payload_lugar(data: dict) -> dict:
    """Normaliza nombres de campos entre camelCase (React Frontend) y snake_case (DB / REST)."""
    norm = dict(data)
    if "precioUsd" in norm and "precio_usd" not in norm:
        norm["precio_usd"] = norm.pop("precioUsd")
    if "precioDetalle" in norm and "precio_detalle" not in norm:
        norm["precio_detalle"] = norm.pop("precioDetalle")
    if "horarioVisita" in norm and "horario_visita" not in norm:
        norm["horario_visita"] = norm.pop("horarioVisita")
    if "descripcionItems" in norm and "descripcion_items" not in norm:
        norm["descripcion_items"] = norm.pop("descripcionItems")
    if "datoHistorico" in norm and "dato_historico" not in norm:
        norm["dato_historico"] = norm.pop("datoHistorico")
    if "price" in norm and "precio" not in norm:
        norm["precio"] = norm.pop("price")
    return norm

@places_bp.route("", methods=["GET"])
def obtener_destinos():
    supabase_bridge = current_app.extensions["supabase_bridge"]
    lugares_supabase = supabase_bridge.fetch_places()
    if lugares_supabase is not None and len(lugares_supabase) > 0:
        return jsonify({"ok": True, "source": "supabase", "data": lugares_supabase})

    return jsonify({
        "ok": True,
        "source": "backend-memory",
        "data": list(PLACES_FALLBACK.values()),
        "mensaje": "Lugares cargados con todos los campos editables.",
    })

@places_bp.route("/<place_id>", methods=["GET"])
def obtener_destino_por_id(place_id):
    supabase_bridge = current_app.extensions["supabase_bridge"]
    lugares = supabase_bridge.fetch_places()
    if lugares:
        for p in lugares:
            if str(p.get("id")) == str(place_id):
                return jsonify({"ok": True, "source": "supabase", "data": p})

    if place_id in PLACES_FALLBACK:
        return jsonify({"ok": True, "source": "backend-memory", "data": PLACES_FALLBACK[place_id]})

    return make_problem_response(404, "Not Found", f"Lugar '{place_id}' no encontrado.")

@places_bp.route("", methods=["POST"])
@require_role(["admin", "operador"])
def crear_destino():
    raw_data = request.get_json(silent=True) or {}
    norm = normalizar_payload_lugar(raw_data)
    if "id" not in norm:
        norm["id"] = f"place-{uuid.uuid4().hex[:6]}"

    try:
        PlaceSchema(**norm)
    except ValidationError as err:
        return make_problem_response(422, "Unprocessable Entity", "Fallo de validación del atractivo", err.errors())

    supabase_bridge = current_app.extensions["supabase_bridge"]
    creado = supabase_bridge.create_place(norm)
    PLACES_FALLBACK[norm["id"]] = norm

    return jsonify({
        "ok": True,
        "mensaje": "Destino creado exitosamente",
        "data": creado or norm
    }), 201

@places_bp.route("/<place_id>", methods=["PUT", "PATCH"])
@require_role(["admin", "operador"])
def actualizar_destino(place_id):
    """Permite al administrador editar cualquier campo visible en pantalla con persistencia inmediata."""
    raw_data = request.get_json(silent=True) or {}
    norm = normalizar_payload_lugar(raw_data)
    norm["id"] = place_id

    try:
        PlaceSchema(**norm)
    except ValidationError as err:
        return make_problem_response(422, "Unprocessable Entity", "Fallo de validación de campos del atractivo", err.errors())

    actual = PLACES_FALLBACK.get(place_id, {"id": place_id})
    actual.update(norm)
    actual["updated_at"] = datetime.utcnow().isoformat() + "Z"
    PLACES_FALLBACK[place_id] = actual

    supabase_bridge = current_app.extensions["supabase_bridge"]
    resp_sb = supabase_bridge.update_place(place_id, norm)

    return jsonify({
        "ok": True,
        "mensaje": f"Destino '{place_id}' actualizado con éxito",
        "data": resp_sb or actual,
        "campos_actualizados": list(norm.keys()),
    }), 200

@places_bp.route("/<place_id>", methods=["DELETE"])
@require_role(["admin"])
def eliminar_destino(place_id):
    PLACES_FALLBACK.pop(place_id, None)
    supabase_bridge = current_app.extensions["supabase_bridge"]
    sb_ok = supabase_bridge.delete_place(place_id)

    return jsonify({
        "ok": True,
        "mensaje": f"Destino '{place_id}' eliminado",
        "supabase_eliminado": sb_ok,
    })

