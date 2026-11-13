"""
Módulo de Autenticación y Verificación de JWT con Decorador de Roles.
Soporta tokens emitidos por Supabase Auth y Firebase Auth.
"""
import functools
import os
from datetime import datetime, timezone
import jwt
from flask import request, current_app
from .errors import make_problem_response

def decode_jwt_token(token: str) -> dict:
    """
    Decodifica el JWT. Si existe SUPABASE_JWT_SECRET, valida firma con HS256.
    En desarrollo sin secreto, extrae claims validando formato y expiración.
    """
    secret = current_app.config.get("SUPABASE_JWT_SECRET") or os.environ.get("SUPABASE_JWT_SECRET", "")
    try:
        if secret:
            payload = jwt.decode(token, secret, algorithms=["HS256"], options={"verify_aud": False})
        else:
            payload = jwt.decode(token, options={"verify_signature": False})

        # Validar expiración explícitamente para tokens decodificados
        exp = payload.get("exp")
        if exp is not None:
            now_ts = datetime.now(timezone.utc).timestamp()
            if now_ts > exp:
                raise ValueError("El token de sesión ha expirado.")

        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("El token de sesión ha expirado.")
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Token inválido: {str(e)}")

def extract_role_from_payload(payload: dict) -> str:
    """
    Extrae el rol del usuario desde el JWT.
    Revisa:
      - user_metadata.role
      - app_metadata.role
      - role (ej. authenticated / admin)
    """
    user_metadata = payload.get("user_metadata", {})
    if isinstance(user_metadata, dict) and user_metadata.get("role"):
        return str(user_metadata["role"]).lower()

    app_metadata = payload.get("app_metadata", {})
    if isinstance(app_metadata, dict) and app_metadata.get("role"):
        return str(app_metadata["role"]).lower()

    role = payload.get("role")
    if role:
        return str(role).lower()

    return "normal"

def require_auth(f):
    """Decorador que exige un token Bearer válido."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            # Si estamos en dev y no hay header, permitir con advertencia si está habilitado
            if current_app.config.get("ALLOW_DEV_ANON"):
                request.user = {"id": "dev-anon", "email": "dev@riqsirutas.bo", "role": "admin"}
                return f(*args, **kwargs)
            return make_problem_response(401, "Unauthorized", "Encabezado Authorization con 'Bearer <token>' es requerido.")

        token = auth_header.split(" ", 1)[1].strip()
        try:
            payload = decode_jwt_token(token)
            request.user = {
                "id": payload.get("sub") or payload.get("user_id"),
                "email": payload.get("email"),
                "role": extract_role_from_payload(payload),
                "payload": payload,
            }
        except ValueError as err:
            return make_problem_response(401, "Unauthorized", str(err))

        return f(*args, **kwargs)
    return decorated

def require_role(allowed_roles: list[str]):
    """
    Decorador que verifica que el usuario autenticado posea uno de los roles autorizados.
    Ejemplo: @require_role(["admin", "operador"])
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated(*args, **kwargs):
            # Primero exigir autenticación
            auth_header = request.headers.get("Authorization", "")
            
            # Soporte de bypass de testing con X-Dev-Role cuando ALLOW_DEV_ANON está activo
            dev_override_role = request.headers.get("X-Dev-Role")
            if dev_override_role and current_app.config.get("ALLOW_DEV_ANON"):
                if dev_override_role.lower() in [r.lower() for r in allowed_roles]:
                    request.user = {"id": "dev-override", "role": dev_override_role.lower()}
                    return f(*args, **kwargs)
                return make_problem_response(403, "Forbidden", f"Rol '{dev_override_role}' no autorizado.")

            if not auth_header or not auth_header.startswith("Bearer "):
                if current_app.config.get("ALLOW_DEV_ANON"):
                    request.user = {"id": "dev-anon", "email": "admin@riqsirutas.bo", "role": "admin"}
                    return f(*args, **kwargs)
                return make_problem_response(401, "Unauthorized", "Se requiere token de autenticación para validar permisos.")

            token = auth_header.split(" ", 1)[1].strip()
            try:
                payload = decode_jwt_token(token)
                role = extract_role_from_payload(payload)
                request.user = {
                    "id": payload.get("sub") or payload.get("user_id"),
                    "email": payload.get("email"),
                    "role": role,
                    "payload": payload,
                }
            except ValueError as err:
                return make_problem_response(401, "Unauthorized", str(err))

            allowed_lower = [r.lower() for r in allowed_roles]
            if role not in allowed_lower:
                return make_problem_response(
                    403,
                    "Forbidden",
                    f"El rol '{role}' no tiene permiso para realizar esta acción. Roles requeridos: {allowed_roles}"
                )

            return f(*args, **kwargs)
        return decorated
    return decorator
