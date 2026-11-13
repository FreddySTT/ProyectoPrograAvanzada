"""
Blueprint para CRUD de Usuarios (POO + Validación Pydantic + Control de Acceso).
"""
from flask import Blueprint, jsonify, request, current_app
from pydantic import ValidationError
from models.user import Usuario
from models.schemas import UserCreateSchema, UserUpdateSchema
from core.auth import require_role
from core.errors import make_problem_response

users_bp = Blueprint("users_bp", __name__, url_prefix="/api/users")

@users_bp.route("", methods=["GET"])
def listar_usuarios():
    gestor = current_app.extensions["gestor_usuarios"]
    return jsonify({
        "ok": True,
        "total": gestor.cantidad(),
        "data": gestor.listar_todos(),
    })

@users_bp.route("/<user_id>", methods=["GET"])
def obtener_usuario(user_id):
    gestor = current_app.extensions["gestor_usuarios"]
    usuario = gestor.obtener_por_id(user_id)
    if not usuario:
        return make_problem_response(404, "Not Found", f"Usuario con ID '{user_id}' no encontrado.")
    return jsonify({"ok": True, "data": usuario.to_dict()})

@users_bp.route("", methods=["POST"])
def crear_usuario():
    raw_data = request.get_json(silent=True) or {}
    try:
        validated = UserCreateSchema(**raw_data)
    except ValidationError as err:
        return make_problem_response(422, "Unprocessable Entity", "Fallo de validación de usuario", err.errors())

    gestor = current_app.extensions["gestor_usuarios"]
    if gestor.existe_email(validated.email):
        return make_problem_response(409, "Conflict", "Ya existe un usuario registrado con ese correo electrónico.")

    nuevo = Usuario(
        nombre=validated.nombre,
        email=validated.email,
        telefono=validated.telefono,
    )
    gestor.agregar(nuevo)

    return jsonify({
        "ok": True,
        "mensaje": "Usuario creado exitosamente",
        "data": nuevo.to_dict(),
    }), 201

@users_bp.route("/<user_id>", methods=["PUT", "PATCH"])
def actualizar_usuario(user_id):
    gestor = current_app.extensions["gestor_usuarios"]
    usuario = gestor.obtener_por_id(user_id)
    if not usuario:
        return make_problem_response(404, "Not Found", f"Usuario con ID '{user_id}' no encontrado.")

    raw_data = request.get_json(silent=True) or {}
    try:
        validated = UserUpdateSchema(**raw_data)
    except ValidationError as err:
        return make_problem_response(422, "Unprocessable Entity", "Fallo de validación de actualización", err.errors())

    usuario.actualizar(
        nombre=validated.nombre,
        email=validated.email,
        telefono=validated.telefono,
    )

    return jsonify({
        "ok": True,
        "mensaje": f"Usuario '{user_id}' actualizado correctamente",
        "data": usuario.to_dict(),
    })

@users_bp.route("/<user_id>", methods=["DELETE"])
@require_role(["admin"])
def eliminar_usuario(user_id):
    gestor = current_app.extensions["gestor_usuarios"]
    if not gestor.eliminar(user_id):
        return make_problem_response(404, "Not Found", f"Usuario '{user_id}' no encontrado para eliminar.")
    return jsonify({
        "ok": True,
        "mensaje": f"Usuario '{user_id}' eliminado correctamente",
    })

