"""
Blueprint para Rutas y Algoritmo Dijkstra en Grafo Ponderado.
"""
from flask import Blueprint, jsonify, request, current_app
from pydantic import ValidationError
from models.schemas import DijkstraQuerySchema
from core.errors import make_problem_response

dijkstra_bp = Blueprint("dijkstra_bp", __name__, url_prefix="/api/routes")

@dijkstra_bp.route("/nodes", methods=["GET"])
def obtener_nodos_rutas():
    grafo = current_app.extensions["grafo_rutas"]
    return jsonify({"ok": True, "nodos": grafo.nodos})

@dijkstra_bp.route("/dijkstra", methods=["POST"])
def calcular_ruta():
    raw_data = request.get_json(silent=True) or {}
    try:
        validated = DijkstraQuerySchema(**raw_data)
    except ValidationError as err:
        return make_problem_response(422, "Unprocessable Entity", "Parámetros de ruta inválidos", err.errors())

    grafo = current_app.extensions["grafo_rutas"]
    resultado = grafo.calcular_ruta_optima(
        origen_id=validated.origen,
        destino_id=validated.destino,
        optimizar_por=validated.optimizar_por,
    )

    if not resultado:
        return make_problem_response(
            400,
            "Bad Request",
            f"No existe un camino o no se reconocen los POIs: '{validated.origen}' -> '{validated.destino}'"
        )

    return jsonify(resultado)
