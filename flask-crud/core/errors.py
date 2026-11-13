"""
Manejadores de errores uniformes siguiendo la especificación RFC-7807 (Problem Details for HTTP APIs).
"""
from flask import jsonify

def make_problem_response(status: int, title: str, detail: str, invalid_params: list = None):
    problem = {
        "type": "about:blank",
        "title": title,
        "status": status,
        "detail": detail,
    }
    if invalid_params:
        problem["invalid_params"] = invalid_params
    resp = jsonify(problem)
    resp.status_code = status
    resp.headers["Content-Type"] = "application/problem+json"
    return resp

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return make_problem_response(400, "Bad Request", str(e.description if hasattr(e, "description") else e))

    @app.errorhandler(401)
    def unauthorized(e):
        return make_problem_response(401, "Unauthorized", "Se requiere autenticación válida para este recurso.")

    @app.errorhandler(403)
    def forbidden(e):
        return make_problem_response(403, "Forbidden", "No tienes permisos suficientes para realizar esta acción.")

    @app.errorhandler(404)
    def not_found(e):
        return make_problem_response(404, "Not Found", "El recurso solicitado no fue encontrado.")

    @app.errorhandler(409)
    def conflict(e):
        return make_problem_response(409, "Conflict", str(e.description if hasattr(e, "description") else e))

    @app.errorhandler(422)
    def unprocessable_entity(e):
        return make_problem_response(422, "Unprocessable Entity", "Datos de entrada no válidos.")

    @app.errorhandler(500)
    def internal_server_error(e):
        return make_problem_response(500, "Internal Server Error", "Ha ocurrido un error inesperado en el servidor.")

