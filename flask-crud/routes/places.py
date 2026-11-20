"""
Blueprint para CRUD de Atractivos Turísticos (Validación Pydantic + Edición Completa + Fallback Dual).
"""
import uuid
import math
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app
from pydantic import ValidationError
from models.schemas import PlaceSchema
from models.database import PLACES_FALLBACK
from core.auth import require_role, require_admin_access
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

def filtrar_y_paginar_lugares(items: list[dict], args: dict) -> dict:
    """Aplica búsqueda de texto completo, filtro de categoría y paginación."""
    resultado = list(items)

    # 1. Búsqueda de texto completo
    q = (args.get("q") or args.get("search") or "").strip().lower()
    if q:
        def match_search(item: dict) -> bool:
            campos_texto = [
                str(item.get("title") or ""),
                str(item.get("area") or ""),
                str(item.get("tag") or ""),
                str(item.get("category") or ""),
                str(item.get("dato_historico") or ""),
                str(item.get("consejo") or ""),
            ]
            for desc in item.get("descripcion_items") or []:
                campos_texto.append(str(desc))
            return any(q in campo.lower() for campo in campos_texto)
        resultado = [p for p in resultado if match_search(p)]

    # 2. Filtro por categoría
    categoria = (args.get("category") or args.get("categoria") or "").strip().lower()
    if categoria and categoria != "todas":
        resultado = [p for p in resultado if str(p.get("category", "")).lower() == categoria]

    # 3. Paginación
    total = len(resultado)
    page_str = args.get("page")
    limit_str = args.get("limit")

    # Si no se solicitan explícitamente page o limit, devolver todos para retrocompatibilidad
    if not page_str and not limit_str:
        return {
            "total": total,
            "data": resultado,
            "paginated": False
        }

    page = max(int(page_str or 1), 1)
    limit = max(min(int(limit_str or 10), 100), 1)
    total_pages = max(math.ceil(total / limit), 1)

    inicio = (page - 1) * limit
    fin = inicio + limit
    paginados = resultado[inicio:fin]

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
        "data": paginados,
        "paginated": True
    }

@places_bp.route("", methods=["GET"])
def obtener_destinos():
    supabase_bridge = current_app.extensions["supabase_bridge"]
    lugares_supabase = supabase_bridge.fetch_places()

    base_items = lugares_supabase if (lugares_supabase is not None and len(lugares_supabase) > 0) else list(PLACES_FALLBACK.values())
    source = "supabase" if (lugares_supabase is not None and len(lugares_supabase) > 0) else "backend-memory"

    filtro = filtrar_y_paginar_lugares(base_items, request.args)

    return jsonify({
        "ok": True,
        "source": source,
        **filtro
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
@require_admin_access
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
@require_admin_access
def actualizar_destino(place_id):
    """Permite al administrador editar cualquier campo visible en pantalla con persistencia inmediata."""
    raw_data = request.get_json(silent=True) or {}
    norm = normalizar_payload_lugar(raw_data)
    norm["id"] = place_id

    try:
        PlaceSchema(**norm)
    except ValidationError as err:
        return make_problem_response(422, "Unprocessable Entity", "Fallo de validación de campos del atractivo", err.errors())

    actual = PLACES_FALLBACK.get(place_id, {"id": place_id, "version": 1})
    current_version = int(actual.get("version") or 1)

    # Control de Concurrencia Optimista (OCC)
    client_version = norm.get("version")
    if client_version is not None and int(client_version) < current_version:
        return make_problem_response(
            409,
            "Conflict",
            f"Conflicto de concurrencia optimista: el atractivo '{place_id}' fue modificado por otro usuario (versión actual: {current_version}, versión recibida: {client_version}). Recarga la página para sincronizar."
        )

    # Incrementar versión para el siguiente cambio
    nueva_version = current_version + 1
    actual.update(norm)
    actual["version"] = nueva_version
    actual["updated_at"] = datetime.utcnow().isoformat() + "Z"
    PLACES_FALLBACK[place_id] = actual

    supabase_bridge = current_app.extensions["supabase_bridge"]
    resp_sb = supabase_bridge.update_place(place_id, actual)

    return jsonify({
        "ok": True,
        "mensaje": f"Destino '{place_id}' actualizado con éxito",
        "data": resp_sb or actual,
        "version": nueva_version,
        "campos_actualizados": list(norm.keys()),
    }), 200

@places_bp.route("/<place_id>", methods=["DELETE"])
@require_admin_access
def eliminar_destino(place_id):
    PLACES_FALLBACK.pop(place_id, None)
    supabase_bridge = current_app.extensions["supabase_bridge"]
    sb_ok = supabase_bridge.delete_place(place_id)

    return jsonify({
        "ok": True,
        "mensaje": f"Destino '{place_id}' eliminado",
        "supabase_eliminado": sb_ok,
    })

